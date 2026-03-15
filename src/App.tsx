/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  Menu, 
  X, 
  Sparkles,
  Zap,
  Shield,
  Globe,
  Bot,
  Trash2
} from "lucide-react";
import { ZephyraLogo } from "./components/ZephyraLogo";
import { getAI, CHAT_MODEL, Message as MessageType } from "./lib/gemini";
import { Message } from "./components/Message";
import { ChatInput, FileData } from "./components/ChatInput";
import { SettingsModal, AppSettings, personalities } from "./components/SettingsModal";
import { CodePreview } from "./components/CodePreview";
import { cn } from "./lib/utils";

interface Conversation {
  id: string;
  title: string;
  messages: MessageType[];
  timestamp: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  userName: "User",
  personality: "professional",
  accentColor: "indigo",
  enableMemory: true,
};

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem("zephyra_conversations");
        return saved ? JSON.parse(saved) : [];
      }
    } catch (e) {
      console.error("Failed to parse conversations:", e);
    }
    return [];
  });
  const [activeId, setActiveId] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem("zephyra_active_id") || null;
      }
    } catch (e) {}
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ code: string, language: string } | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem("zephyra_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_SETTINGS, ...parsed };
        }
      }
    } catch (e) {
      console.error("Failed to parse settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  const activeConversation = conversations.find(c => c.id === activeId);
  const messages = activeConversation?.messages || [];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem("zephyra_settings", JSON.stringify(settings));
      }
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem("zephyra_conversations", JSON.stringify(conversations));
      }
    } catch (e) {}
  }, [conversations]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (activeId) {
          localStorage.setItem("zephyra_active_id", activeId);
        } else {
          localStorage.removeItem("zephyra_active_id");
        }
      }
    } catch (e) {}
  }, [activeId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, files?: FileData[]) => {
    let currentId = activeId;
    let currentConversations = [...conversations];

    // Create new conversation if none active
    if (!currentId) {
      currentId = Date.now().toString();
      const newConv: Conversation = {
        id: currentId,
        title: content ? (content.slice(0, 30) + (content.length > 30 ? "..." : "")) : (files?.[0]?.name || "New Chat"),
        messages: [],
        timestamp: Date.now(),
      };
      currentConversations = [newConv, ...currentConversations];
      setConversations(currentConversations);
      setActiveId(currentId);
    }

    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
      attachments: files,
    };

    const updatedConversations = currentConversations.map(c => {
      if (c.id === currentId) {
        return { ...c, messages: [...c.messages, userMessage] };
      }
      return c;
    });

    setConversations(updatedConversations);
    setIsLoading(true);

    try {
      const personalityObj = personalities.find(p => p.id === settings.personality);
      const currentDate = new Date().toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const systemInstruction = `You are Zephyra AI, a versatile and intelligent personal assistant created by Hamdan Dzakir Mujtaba. 
      Today is ${currentDate}. User: ${settings.userName}. 
      Personality: ${personalityObj?.name} (${personalityObj?.desc}).
      
      Your Capabilities:
      - General Knowledge: Science, history, philosophy, and everyday topics.
      - Creative Writing: Poetry, storytelling, and professional copywriting.
      - Logical Reasoning: Problem solving, data analysis, and critical thinking.
      - Technical Skills: Programming (Web, Mobile, Backend), UI/UX design, and system architecture.
      - Languages: Fluent in Indonesian and English, capable of translation and cultural context.

      Guidelines:
      1. Be a "normal" and versatile assistant. Do not assume the user wants to talk about coding or UI/UX unless they bring it up.
      2. Start conversations naturally. Respond warmly to greetings and ask how you can help with anything—from planning a trip to writing a script or solving a math problem.
      3. You are in a continuous conversation thread. Use previous messages for context.
      4. When writing code (if requested), ALWAYS include the filename in the code block header (e.g., \`\`\`typescript:src/App.tsx\`).
      5. Provide clear, high-quality responses tailored to the user's specific request.
      6. You can analyze images and files to provide insights on any topic, not just technical ones.`;

      // Construct parts for the current message
      const currentParts: any[] = [];
      if (content.trim()) {
        currentParts.push({ text: content.trim() });
      } else if (files && files.length > 0) {
        currentParts.push({ text: "Analyze the attached file(s)." });
      }
      
      if (files && files.length > 0) {
        files.forEach(f => {
          currentParts.push({
            inlineData: {
              mimeType: f.mimeType,
              data: f.data
            }
          });
        });
      }
      
      // Ensure there's at least one part
      if (currentParts.length === 0) {
        currentParts.push({ text: "..." });
      }

      // Construct history with strict role alternation and valid parts
      const currentConv = updatedConversations.find(c => c.id === currentId);
      const historyMessages = currentConv?.messages || [];
      
      const history = historyMessages.slice(0, -1) // All messages except the one we just added
            .filter(m => m.content.trim() || (m.attachments && m.attachments.length > 0))
            .map(m => {
              const parts: any[] = [];
              if (m.content.trim()) {
                parts.push({ text: m.content.trim() });
              } else if (m.attachments && m.attachments.length > 0) {
                parts.push({ text: "[Sent a file]" });
              }
              
              if (m.attachments && m.attachments.length > 0) {
                m.attachments.forEach(a => {
                  parts.push({
                    inlineData: {
                      mimeType: a.mimeType,
                      data: a.data
                    }
                  });
                });
              }
              
              // Ensure every message has at least one part
              if (parts.length === 0) {
                parts.push({ text: "..." });
              }
              
              return {
                role: m.role === "user" ? "user" : "model",
                parts
              };
            });

      // Combine history and current message
      const contents = [...history, { role: "user", parts: currentParts }];

      const aiInstance = getAI(settings.customApiKey);
      const response = await aiInstance.models.generateContent({
        model: CHAT_MODEL,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          topP: 0.95,
        },
      });
      
      const aiMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: response.text || "I'm sorry, I couldn't process that.",
        timestamp: Date.now(),
      };

      setConversations(prev => prev.map(c => {
        if (c.id === currentId) {
          return { ...c, messages: [...c.messages, aiMessage] };
        }
        return c;
      }));
    } catch (error: any) {
      console.error("Chat error:", error);
      
      let errorText = "I encountered an error while processing your request. Please try again.";
      
      if (error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("API key not valid")) {
        errorText = "Invalid API Key. Please check your Gemini API Key in Settings.";
      } else if (error?.message?.includes("quota") || error?.message?.includes("429")) {
        errorText = "API Quota exceeded. Please try again later or use your own API Key in Settings.";
      } else if (error?.message?.includes("safety") || error?.message?.includes("SAFETY")) {
        errorText = "The message was blocked by safety filters. Please try a different prompt.";
      }

      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: errorText,
        timestamp: Date.now(),
      };
      setConversations(prev => prev.map(c => {
        if (c.id === currentId) {
          return { ...c, messages: [...c.messages, errorMessage] };
        }
        return c;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveId(null);
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const deleteAllConversations = () => {
    if (window.confirm("Are you sure you want to delete all conversations?")) {
      setConversations([]);
      setActiveId(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#030303] overflow-hidden font-sans">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 glass rounded-lg md:hidden"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed md:relative z-40 w-72 h-full glass-dark border-r border-white/5 flex flex-col"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 bg-zinc-900 border border-white/10",
                )}>
                  <ZephyraLogo size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold tracking-tight">Zephyra <span className="gradient-text">AI</span></h1>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Premium Intelligence</p>
                </div>
              </div>

              <button
                onClick={startNewChat}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
              >
                <Plus size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">New Conversation</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
              <div className="px-2 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Recent Chats</span>
                {conversations.length > 0 && (
                  <button 
                    onClick={deleteAllConversations}
                    className="p-1 hover:bg-white/5 rounded text-zinc-600 hover:text-rose-400 transition-colors"
                    title="Delete all"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              {conversations.length > 0 ? (
                conversations.map(conv => (
                  <div 
                    key={conv.id}
                    onClick={() => setActiveId(conv.id)}
                    className={cn(
                      "p-3 rounded-xl border flex items-center gap-3 cursor-pointer group transition-all",
                      activeId === conv.id 
                        ? "bg-indigo-500/10 border-indigo-500/20" 
                        : "bg-transparent border-transparent hover:bg-white/5"
                    )}
                  >
                    <MessageSquare size={16} className={activeId === conv.id ? "text-indigo-400" : "text-zinc-500"} />
                    <span className={cn(
                      "text-sm truncate flex-1",
                      activeId === conv.id ? "text-zinc-200" : "text-zinc-500 group-hover:text-zinc-300"
                    )}>
                      {conv.title}
                    </span>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-rose-400 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-xs text-zinc-600 italic">No recent history</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 space-y-1">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white group"
              >
                <Settings size={18} className="group-hover:rotate-45 transition-transform" />
                <span className="text-sm">Settings</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-bottom border-white/5 glass-dark z-30">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors hidden md:block"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <ZephyraLogo size={20} />
              <span className="text-sm font-medium text-zinc-400">Zephyra v2.5</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold">
              {settings.userName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl mb-8 transition-all duration-500 bg-zinc-900 border border-white/10",
                )}>
                  <ZephyraLogo size={48} />
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
                  Welcome to <span className="gradient-text">Zephyra AI</span>
                </h2>
                <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
                  Experience the next generation of artificial intelligence. Precise, creative, and always ready to assist.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
                  {[
                    { icon: <Zap size={20} />, title: "Ultra Fast", desc: "Responses in milliseconds" },
                    { icon: <Shield size={20} />, title: "Secure", desc: "Enterprise-grade privacy" },
                    { icon: <Globe size={20} />, title: "Global", desc: "Multilingual support" }
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="p-6 glass rounded-2xl text-left hover:bg-white/10 transition-colors cursor-pointer group"
                    >
                      <div className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
                      <h3 className="font-bold text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-zinc-500">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((msg, idx) => (
                <Message 
                  key={msg.id} 
                  message={msg} 
                  onPreview={(code, lang) => setPreviewData({ code, language: lang })}
                />
              ))}
              {isLoading && (
                <div className="flex gap-4 py-8 px-4 md:px-8 glass-dark">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center">
                      <Bot size={18} className="animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="h-2 w-24 bg-zinc-800 rounded animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-zinc-800 rounded animate-pulse" />
                      <div className="h-2 w-3/4 bg-zinc-800 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-32" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#030303] via-[#030303]/90 to-transparent pt-12">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} accentColor={settings.accentColor} />
        </div>

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          settings={settings}
          onSave={setSettings}
        />

        <AnimatePresence>
          {previewData && (
            <CodePreview 
              code={previewData.code} 
              language={previewData.language} 
              onClose={() => setPreviewData(null)} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
