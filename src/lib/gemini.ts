import { GoogleGenAI } from "@google/genai";

export const getApiKey = (customKey?: string) => {
  if (customKey) return customKey;
  
  // Fallback to environment variable or hardcoded key
  // We use a safe check for process.env which Vite will replace
  try {
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey && envKey !== "undefined") return envKey;
  } catch (e) {
    // process.env might not be defined in some environments
  }
  
  return "AIzaSyCNPZrryf3i0dQnDdNV0WJKC--63_A9P3M";
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
