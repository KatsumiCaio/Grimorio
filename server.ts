import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasServerApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Streaming chat endpoint with Gemini
  app.post("/api/chat", async (req, res) => {
    const { messages, systemInstruction, model, customApiKey, system, campaignTitle } = req.body;
    
    // Validate API key: prefer trimmed custom key if provided and valid, otherwise fallback to server environment key
    const trimmedCustomKey = typeof customApiKey === "string" ? customApiKey.trim() : "";
    const apiKey = (trimmedCustomKey && trimmedCustomKey !== "undefined" && trimmedCustomKey !== "null" && trimmedCustomKey.length > 8)
      ? trimmedCustomKey
      : process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(400).json({
        error: "Chave da API Gemini não configurada. Defina GEMINI_API_KEY nas variáveis de ambiente ou informe uma chave nas configurações do Grimório.",
      });
      return;
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    let isAborted = false;
    res.on("close", () => {
      if (!res.writableEnded) {
        isAborted = true;
      }
    });

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
          timeout: 12000,
        },
      });

      // Format messages for @google/genai SDK
      // Ensure contents array has valid roles: 'user' | 'model'
      const formattedContents = (messages || []).map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content || "" }],
      }));

      // Determine requested model, sanitizing deprecated names
      let primaryModel = model || "gemini-3.1-flash-lite";
      if (
        primaryModel === "gemini-2.5-flash" ||
        primaryModel === "gemini-2.5-flash-lite" ||
        primaryModel.includes("2.5") ||
        primaryModel.includes("2.0") ||
        primaryModel.includes("1.5")
      ) {
        primaryModel = "gemini-3.1-flash-lite";
      }

      // Priority list of fallback models if primary model is unavailable or overloaded (e.g. 503 high demand)
      const candidateModels = Array.from(
        new Set([
          primaryModel,
          "gemini-3.1-flash-lite",
          "gemini-3.6-flash",
          "gemini-3.8-flash",
          "gemini-flash-latest",
        ])
      );

      // Ensure active RPG system context (e.g. D&D 5e, Tormenta 20, Pathfinder 2e) is always enforced in every request
      let effectiveSystemInstruction = systemInstruction || "";
      if (system && !effectiveSystemInstruction.includes(`SISTEMA DE RPG ATIVO:`)) {
        effectiveSystemInstruction = `[SISTEMA DE RPG ATIVO: ${String(system).toUpperCase()}${campaignTitle ? ` | CAMPANHA: ${campaignTitle}` : ''}]\n${effectiveSystemInstruction}`;
      }

      const contentsPayload = formattedContents.length > 0
        ? formattedContents
        : [{ role: "user", parts: [{ text: "Olá" }] }];

      let streamSucceeded = false;
      let lastError: any = null;

      for (const currentModel of candidateModels) {
        if (isAborted || res.writableEnded) break;

        try {
          const streamResult = await ai.models.generateContentStream({
            model: currentModel,
            contents: contentsPayload,
            config: effectiveSystemInstruction
              ? {
                  systemInstruction: effectiveSystemInstruction,
                  temperature: 0.8,
                }
              : {
                  temperature: 0.8,
                },
          });

          let chunkReceived = false;
          for await (const chunk of streamResult) {
            if (isAborted || res.writableEnded) break;
            const text = chunk.text || "";
            if (text) {
              chunkReceived = true;
              res.write(`data: ${JSON.stringify({ text, activeModel: currentModel })}\n\n`);
              if (typeof (res as any).flush === "function") {
                (res as any).flush();
              }
            }
          }

          if (chunkReceived) {
            streamSucceeded = true;
            break;
          }
        } catch (modelErr: any) {
          lastError = modelErr;
          console.warn(`[Grimório AI] Modelo ${currentModel} falhou (${modelErr?.status || modelErr?.message || modelErr}). Tentando próximo modelo da cadeia...`);
          // Continue loop to try next model in fallback list
        }
      }

      if (streamSucceeded) {
        if (!res.writableEnded) {
          res.write("data: [DONE]\n\n");
          res.end();
        }
      } else if (!isAborted && !res.writableEnded) {
        let errorMessage = lastError?.message || "Não foi possível obter resposta dos modelos de IA.";
        if (typeof errorMessage === "string") {
          if (errorMessage.includes("exceeded your current quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
            errorMessage = "Limite de cota atingido na API Gemini. Aguarde alguns instantes ou forneça sua chave pessoal em Configurações.";
          } else if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
            errorMessage = "A chave de API Gemini informada é inválida. Verifique sua chave no menu de Configurações.";
          } else if (errorMessage.includes("high demand") || errorMessage.includes("503")) {
            errorMessage = "Os servidores do Gemini estão com alta demanda no momento. Por favor, tente novamente em alguns segundos.";
          }
        }
        res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    } catch (err: any) {
      console.error("Gemini API handler fatal error:", err);
      let errorMessage = err?.message || "Erro desconhecido ao consultar a API Gemini.";
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    } finally {
      if (!res.writableEnded) {
        res.end();
      }
    }
  });

  // Vite middleware for development vs Static assets for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Grimório RPG Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Erro fatal ao iniciar o servidor Grimório:", err);
  process.exit(1);
});
