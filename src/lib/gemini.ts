import { GoogleGenAI } from "@google/genai";

export const getApiKey = (customKey?: string) => {
  if (customKey && customKey.length > 5) return customKey;
  
  try {
    // Check various common environment variable locations
    const envKey = 
      (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
      (window as any).process?.env?.GEMINI_API_KEY;

    if (envKey && envKey !== "undefined" && envKey.length > 5) return envKey;
  } catch (e) {
    console.warn("Failed to access environment variables:", e);
  }
  
  return "";
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
