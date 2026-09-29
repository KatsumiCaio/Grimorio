import { useState, useRef, useCallback } from 'react';
import { ChatMessage } from '../types';
import { getSystemKnowledge } from '../data/rpgSystems';

export interface ChatContext {
  system: string;
  campaignTitle: string;
  notes: string;
  activeChapterTitle?: string;
  chaptersSummary?: string;
  charactersSummary?: string;
}

export interface UseGeminiChatOptions {
  customApiKey?: string;
  model?: string;
  initialMessages?: ChatMessage[];
  onUserMessageAdded?: (userMsg: ChatMessage) => void;
  onMessageComplete?: (userMsg: ChatMessage, assistantMsg: ChatMessage) => void;
}

// Fallback direct streaming for static sites or when /api/chat is unavailable
async function streamDirectGemini({
  apiKey,
  model,
  messages,
  systemInstruction,
  signal,
  onChunk,
}: {
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  systemInstruction?: string;
  signal?: AbortSignal;
  onChunk: (accumulatedText: string) => void;
}): Promise<string> {
  const effectiveModel =
    model && !model.includes('2.5') && !model.includes('2.0') && !model.includes('1.5')
      ? model
      : 'gemini-3.8-flash';

  const formattedContents = (messages || []).map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content || '' }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    effectiveModel
  )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

  const body: any = {
    contents:
      formattedContents.length > 0
        ? formattedContents
        : [{ role: 'user', parts: [{ text: 'Olá' }] }],
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData?.error?.message;
    if (res.status === 400 || res.status === 403) {
      throw new Error(
        `Chave da API Gemini inválida ou não autorizada. Verifique sua chave nas Configurações (⚙️): ${msg || res.statusText}`
      );
    }
    throw new Error(msg || `Erro na API Gemini (${res.status}): ${res.statusText}`);
  }

  if (!res.body) {
    throw new Error('Corpo de resposta vazio da API Gemini.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulated = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const jsonStr = trimmed.slice(6);
      if (jsonStr === '[DONE]') break;
      try {
        const parsed = JSON.parse(jsonStr);
        const chunkText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (chunkText) {
          accumulated += chunkText;
          onChunk(accumulated);
        }
      } catch {
        // ignore incomplete json chunks
      }
    }
  }

  return accumulated;
}

export function useGeminiChat(options: UseGeminiChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(options.initialMessages || []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    stopStreaming();
    setMessages([]);
    setError(null);
  }, [stopStreaming]);

  const sendMessage = useCallback(
    async (prompt: string, context?: ChatContext) => {
      if (!prompt.trim() || isStreaming) return;

      setError(null);

      const userMessageId = `msg-user-${Date.now()}`;
      const assistantMessageId = `msg-ast-${Date.now() + 1}`;

      const userMessage: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content: prompt.trim(),
        timestamp: Date.now(),
      };

      const assistantMessagePlaceholder: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };

      const updatedHistory = [...messages, userMessage];
      setMessages([...updatedHistory, assistantMessagePlaceholder]);
      setIsStreaming(true);

      // Notify callback of new user message
      options.onUserMessageAdded?.(userMessage);

      // Retrieve deep system knowledge & canonical mechanics
      const systemKnowledge = getSystemKnowledge(context?.system || '');

      // Construct system instruction injecting the campaign context silently
      let systemInstruction = `Você é o Copiloto do Grimório, um co-mestre de RPG experiente e especialista nas regras de ${systemKnowledge.name}.
Sua missão é auxiliar o mestre em tempo real durante a preparação e a condução da sessão com ideias evocativas, ganchos dramáticos, descrições vívidas e APLICAÇÃO PRECISA DAS REGRAS DO SISTEMA ${systemKnowledge.name.toUpperCase()}.

SISTEMA DE RPG ATIVO: ${systemKnowledge.name} (${systemKnowledge.category})
CONVENÇÃO DE DADOS & MECÂNICA CENTRAL: ${systemKnowledge.diceConvention}
ESTRUTURA DE REGRAS: ${systemKnowledge.keyMechanics}

DIRETRIZES TÉCNICAS E MECÂNICAS DESTE SISTEMA:
${systemKnowledge.aiSystemDirectives}

CAMPANHA SELECIONADA: ${context?.campaignTitle || 'Campanha Principal'}${context?.activeChapterTitle ? ` (Capítulo Atual: ${context.activeChapterTitle})` : ''}

--- CADERNO DE ANOTAÇÕES DO MESTRE (${context?.activeChapterTitle ? `CAPÍTULO ATUAL: ${context.activeChapterTitle}` : 'CONTEXTO ATIVO'}) ---
${context?.notes ? context.notes.slice(0, 15000) : '(Nenhuma anotação registrada ainda no caderno da campanha)'}
--------------------------------------------------------
${context?.chaptersSummary ? `\n--- ÍNDICE DE CAPÍTULOS / SESSÕES DA CAMPANHA ---\n${context.chaptersSummary.slice(0, 3000)}\n-------------------------------------------------\n` : ''}
${
  context?.charactersSummary
    ? `\n--- FICHAS DA CAMPANHA (PERSONAGENS & NPCS) ---\n${context.charactersSummary.slice(0, 8000)}\n-------------------------------------------------\n`
    : ''
}

DIRETRIZES DE RESPOSTA AO MESTRE:
1. Responda em Português do Brasil com linguagem clara, imersiva e pronta para ser narrada ou usada diretamente na mesa.
2. Seja conciso e direto: mestres precisam de informações rápidas durante o jogo. Evite introduções prolixas ou enrolações.
3. DOMÍNIO E RESOLUÇÃO DE DÚVIDAS DO SISTEMA: Quando o mestre tiver dúvidas de regras, testes, combate, magias, perícias, danos ou condições, responda com autoridade baseando-se estritamente nas regras oficiais de ${systemKnowledge.name}.
   - Especifique quais dados devem ser rolados (ex: ${systemKnowledge.diceConvention}).
   - Indique a CD ou grau de dificuldade sugerido ou a fórmula exata do teste.
   - Forneça exemplos práticos de como narrar o sucesso e a falha mecânica.
4. Mantenha total coerência com os locais, ganchos e segredos já documentados nas notas do mestre.
5. Use formatação Markdown clara (tópicos com marcadores, destaques em negrito, tabelas ou caixas de citação para falas de NPCs).`;

      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const requestPayload = {
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemInstruction,
          system: context?.system || 'D&D 5e',
          campaignTitle: context?.campaignTitle || 'Campanha Principal',
          model: options.model && options.model !== 'gemini-2.5-flash' && options.model !== 'gemini-2.5-flash-lite' ? options.model : 'gemini-3.8-flash',
          customApiKey: options.customApiKey || undefined,
        };

        let response: Response | null = null;
        let fetchFailed = false;
        const maxAttempts = 3;

        const effectiveCustomApiKey =
          (options.customApiKey && options.customApiKey.trim().length > 8 ? options.customApiKey.trim() : '') ||
          (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY
            ? String((import.meta as any).env.VITE_GEMINI_API_KEY).trim()
            : '');

        // Resilient fetch loop: Handles dev-server warmup, proxy reload (405/502/504), and temporary spikes (503)
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
              body: JSON.stringify(requestPayload),
            });

            if (response.ok) {
              break;
            }

            // Retry if proxy returned 405 (method not allowed while reloading), 502, 503, or 504
            const isTransient = [405, 502, 503, 504].includes(response.status);
            if (isTransient && attempt < maxAttempts && !controller.signal.aborted) {
              await new Promise((r) => setTimeout(r, attempt * 800));
              continue;
            }
            break;
          } catch (fetchErr: any) {
            if (controller.signal.aborted) throw fetchErr;
            if (attempt < maxAttempts) {
              await new Promise((r) => setTimeout(r, attempt * 800));
              continue;
            }
            fetchFailed = true;
            break;
          }
        }

        let accumulatedText = '';

        // If /api/chat failed to connect, returned 404 (static hosting), returned HTML (SPA fallback), or returned 400 (missing server key)
        const isHtmlFallback = Boolean(response?.headers.get('content-type')?.includes('text/html'));
        const isMissingServerKey = response?.status === 400;
        const isStaticHostWithoutBackend = fetchFailed || response?.status === 404 || isHtmlFallback;

        if (isStaticHostWithoutBackend || (isMissingServerKey && effectiveCustomApiKey)) {
          if (effectiveCustomApiKey) {
            // Static hosting fallback: stream directly from Google Gemini API with user's key
            accumulatedText = await streamDirectGemini({
              apiKey: effectiveCustomApiKey,
              model: options.model || 'gemini-3.8-flash',
              messages: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
              systemInstruction,
              signal: controller.signal,
              onChunk: (text) => {
                accumulatedText = text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: text, isStreaming: true, error: undefined }
                      : msg
                  )
                );
              },
            });
          } else {
            throw new Error(
              'No site publicado, o Copiloto precisa da chave da API Gemini. Abra as Configurações (ícone ⚙️ no menu superior) e adicione sua chave gratuita do Google AI Studio, ou configure a variável GEMINI_API_KEY no servidor.'
            );
          }
        } else if (!response || !response.ok) {
          const errorData = await response?.json().catch(() => ({}));
          let friendlyError = errorData?.error;
          if (!friendlyError) {
            if (response?.status === 405) {
              friendlyError = 'O servidor do Copiloto está finalizando a inicialização. Tente reenviar em alguns instantes.';
            } else if (response?.status === 503) {
              friendlyError = 'Os servidores de IA estão com alta demanda temporária. Clique em Tentar novamente.';
            } else if (response?.status === 429) {
              friendlyError = 'Muitas mensagens enviadas em pouco tempo. Aguarde alguns segundos.';
            } else {
              friendlyError = `Erro na requisição (${response?.status || 'desconectado'}). Se este for um site publicado, configure sua chave Gemini nas Configurações (⚙️).`;
            }
          }
          throw new Error(friendlyError);
        } else {
          // Standard server-side SSE stream response
          if (!response.body) {
            throw new Error('Corpo de resposta vazio do servidor.');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

              const payload = trimmedLine.slice(6);
              if (payload === '[DONE]') {
                break;
              }

              try {
                const data = JSON.parse(payload);
                if (data.error) {
                  throw new Error(data.error);
                }
                if (data.text) {
                  accumulatedText += data.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedText, isStreaming: true, error: undefined }
                        : msg
                    )
                  );
                }
              } catch (jsonErr: any) {
                if (jsonErr.message && !jsonErr.message.includes('JSON')) {
                  throw jsonErr;
                }
              }
            }
          }
        }

        // Finalize message state
        const finalizedAssistantMessage: ChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: accumulatedText || 'O modelo concluiu a consulta sem texto adicional.',
          timestamp: Date.now(),
          isStreaming: false,
        };

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? finalizedAssistantMessage
              : msg
          )
        );

        options.onMessageComplete?.(userMessage, finalizedAssistantMessage);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
          return;
        }

        const errMsg = err.message || 'Ocorreu um erro ao comunicar com a IA.';
        setError(errMsg);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    `⚠️ Não foi possível obter resposta: ${errMsg}`,
                  isStreaming: false,
                  error: errMsg,
                }
              : msg
          )
        );
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isStreaming, options.customApiKey, options.model]
  );

  const retryMessage = useCallback(
    async (failedMessageId?: string, context?: ChatContext) => {
      if (isStreaming) return;
      // Find the message to retry or the last user message
      let targetUserPrompt = '';
      if (failedMessageId) {
        const idx = messages.findIndex((m) => m.id === failedMessageId);
        if (idx > 0 && messages[idx - 1].role === 'user') {
          targetUserPrompt = messages[idx - 1].content;
          // Remove the failed assistant message
          setMessages((prev) => prev.filter((m) => m.id !== failedMessageId));
        }
      }

      if (!targetUserPrompt) {
        const lastUser = [...messages].reverse().find((m) => m.role === 'user');
        if (lastUser) {
          targetUserPrompt = lastUser.content;
        }
      }

      if (targetUserPrompt) {
        await sendMessage(targetUserPrompt, context);
      }
    },
    [messages, isStreaming, sendMessage]
  );

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    retryMessage,
    clearMessages,
    stopStreaming,
    setMessages,
  };
}
