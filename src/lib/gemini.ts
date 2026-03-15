import { GoogleGenAI } from "@google/genai";

// WARNING: Hardcoding API keys is insecure and not recommended for production.
// This is done here per user request for "automatic deployment without setup".
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCNPZrryf3i0dQnDdNV0WJKC--63_A9P3M";

if (!apiKey || apiKey === "undefined") {
  console.warn("GEMINI_API_KEY is not defined. AI features will not work.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "dummy-key" });

export const CHAT_MODEL = "gemini-3-flash-preview";

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: number;
  attachments?: {
    mimeType: string;
    data: string;
    name: string;
  }[];
}
