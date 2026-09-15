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
    const { messages, systemInstruction, model, customApiKey } = req.body;
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

      // Model requested: gemini-2.5-flash
      const selectedModel = model || "gemini-2.5-flash";

      const streamResult = await ai.models.generateContentStream({
        model: selectedModel,
        contents: formattedContents.length > 0 ? formattedContents : [{ role: "user", parts: [{ text: "Olá" }] }],
        config: systemInstruction
          ? {
              systemInstruction,
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
      const errorMessage = err?.message || "Erro desconhecido ao consultar a API Gemini.";
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  });

  // Imagen endpoint for RPG character portraits
  app.post("/api/generate-portrait", async (req, res) => {
    const { prompt, name, role, notes, system, artStyle, customApiKey } = req.body;
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(400).json({
        error: "Chave da API não configurada. Defina GEMINI_API_KEY nas variáveis de ambiente ou informe sua chave nas configurações do Grimório.",
      });
      return;
    }

    try {
      // Build an evocative tabletop RPG portrait prompt if a custom one isn't explicitly provided
      let finalPrompt = prompt?.trim();

      if (!finalPrompt) {
        const styleDescriptor =
          artStyle || "High quality fantasy digital painting, highly detailed tabletop RPG character portrait";
        const systemContext = system ? `setting: ${system}` : "tabletop RPG";
        const charName = name ? `Character: ${name}` : "";
        const charRole = role ? `Class/Role: ${role}` : "";
        const charNotes = notes
          ? `Visual features, equipment & description: ${notes.slice(0, 300).replace(/\n+/g, " ")}`
          : "";

        finalPrompt = [
          `Detailed tabletop RPG character portrait, head and shoulders bust shot.`,
          charName,
          charRole,
          systemContext,
          charNotes,
          `Style: ${styleDescriptor}. Intricate lighting, expressive face, crisp atmospheric background, centered composition, digital character art. No text, no watermark, no border.`,
        ]
          .filter(Boolean)
          .join(" ");
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: "1:1",
        },
      });

      const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;

      if (!imageBytes) {
        const filterReason = response.generatedImages?.[0]?.raiFilteredReason;
        throw new Error(
          filterReason
            ? `A imagem foi bloqueada pelos filtros de segurança do modelo (${filterReason}). Modifique a descrição do personagem.`
            : "Nenhuma imagem foi gerada pelo modelo Imagen."
        );
      }

      res.json({
        imageUrl: `data:image/jpeg;base64,${imageBytes}`,
        prompt: finalPrompt,
      });
    } catch (err: any) {
      console.error("Portrait generation error:", err);
      const errorMessage =
        err?.message || "Ocorreu um erro ao gerar o retrato do personagem com a ferramenta Imagen.";
      res.status(500).json({ error: errorMessage });
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

startServer();
