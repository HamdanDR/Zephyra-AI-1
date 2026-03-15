import { GoogleGenAI } from "@google/genai";

export const getApiKey = (customKey?: string) => {
  return customKey || process.env.GEMINI_API_KEY || "AIzaSyCNPZrryf3i0dQnDdNV0WJKC--63_A9P3M";
};

export const getAI = (customKey?: string) => {
  const key = getApiKey(customKey);
  return new GoogleGenAI({ apiKey: key || "dummy-key" });
};

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
