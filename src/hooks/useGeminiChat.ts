import { useState, useRef, useCallback } from 'react';
import { ChatMessage } from '../types';

export interface ChatContext {
  system: string;
  campaignTitle: string;
  notes: string;
  charactersSummary?: string;
}

export interface UseGeminiChatOptions {
  customApiKey?: string;
  model?: string;
  initialMessages?: ChatMessage[];
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

      // Construct system instruction injecting the campaign context silently
      let systemInstruction = `Você é o Copiloto do Grimório, um assistente inteligente e co-mestre especializado em RPG de Mesa para Mestres de Jogo (Game Masters / Dungeon Masters).
Sua missão é auxiliar o mestre em tempo real durante a preparação e a condução da sessão com ideias evocativas, ganchos dramáticos, descrições vívidas e aplicação precisa de regras.

SISTEMA DE RPG ATUAL: ${context?.system ? context.system : 'D&D 5e / Fantasia'}
CAMPANHA SELECIONADA: ${context?.campaignTitle || 'Campanha Principal'}

--- CADERNO DE ANOTAÇÕES DO MESTRE (CONTEXTO ATIVO) ---
${context?.notes ? context.notes.slice(0, 15000) : '(Nenhuma anotação registrada ainda no caderno da campanha)'}
--------------------------------------------------------
${
  context?.charactersSummary
    ? `\n--- FICHAS DA CAMPANHA (PERSONAGENS & NPCS) ---\n${context.charactersSummary.slice(0, 8000)}\n-------------------------------------------------\n`
    : ''
}

DIRETRIZES DE RESPOSTA:
1. Responda em Português do Brasil com linguagem rica, imersiva e pronta para ser narrada ou usada diretamente na mesa.
2. Seja conciso e direto: mestres precisam de informações rápidas durante o jogo. Evite introduções prolixas.
3. Se perguntado sobre regras ou mecânicas, respeite estritamente as regras e o tom do sistema informado (${context?.system || 'D&D 5e'}).
4. Mantenha total coerência com os locais, ganchos e segredos já documentados nas notas do mestre.
5. Use formatação Markdown clara (tópicos com marcadores, destaques em negrito, tabelas ou caixas de citação para falas de NPCs).`;

      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            messages: updatedHistory.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            systemInstruction,
            model: options.model && options.model !== 'gemini-2.5-flash' ? options.model : 'gemini-3.6-flash',
            customApiKey: options.customApiKey || undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erro na requisição (${response.status})`);
        }

        if (!response.body) {
          throw new Error('Corpo de resposta vazio do servidor.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
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
                      ? { ...msg, content: accumulatedText, isStreaming: true }
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

        // Finalize message state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedText, isStreaming: false }
              : msg
          )
        );
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

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    stopStreaming,
    setMessages,
  };
}
