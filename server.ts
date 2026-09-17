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
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

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
    res.flushHeaders?.();

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Format messages for @google/genai SDK
      // Ensure contents array has valid roles: 'user' | 'model'
      const formattedContents = (messages || []).map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content || "" }],
      }));

      // Map deprecated or unsupported models to active official models
      let requestedModel = model || "gemini-3.6-flash";
      if (
        requestedModel === "gemini-2.5-flash" ||
        requestedModel.includes("2.5") ||
        requestedModel.includes("2.0") ||
        requestedModel.includes("1.5")
      ) {
        requestedModel = "gemini-3.6-flash";
      }

      // Ensure active RPG system context (e.g. D&D 5e, Tormenta 20, Pathfinder 2e) is always enforced in every request
      let effectiveSystemInstruction = systemInstruction || "";
      if (system && !effectiveSystemInstruction.includes(`SISTEMA DE RPG ATIVO:`)) {
        effectiveSystemInstruction = `[SISTEMA DE RPG ATIVO: ${String(system).toUpperCase()}${campaignTitle ? ` | CAMPANHA: ${campaignTitle}` : ''}]\n${effectiveSystemInstruction}`;
      }

      const streamResult = await ai.models.generateContentStream({
        model: requestedModel,
        contents: formattedContents.length > 0 ? formattedContents : [{ role: "user", parts: [{ text: "Olá" }] }],
        config: effectiveSystemInstruction
          ? {
              systemInstruction: effectiveSystemInstruction,
              temperature: 0.8,
            }
          : {
              temperature: 0.8,
            },
      });

      for await (const chunk of streamResult) {
        const text = chunk.text || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err: any) {
      console.error("Gemini API stream error:", err);
      let errorMessage = err?.message || "Erro desconhecido ao consultar a API Gemini.";
      if (typeof errorMessage === "string" && errorMessage.includes("exceeded your current quota")) {
        errorMessage = "Limite de cota temporário atingido na API Gemini. Aguarde alguns segundos ou configure sua chave pessoal no menu de Configurações.";
      } else if (typeof errorMessage === "string" && errorMessage.includes("API key not valid")) {
        errorMessage = "A chave de API do Gemini informada é inválida. Verifique a chave nas Configurações.";
      }
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
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
