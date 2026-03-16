import React from "react";
import { X, User, Brain, Palette, Save, History, Settings, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export interface AppSettings {
  userName: string;
  personality: string;
  accentColor: string;
  enableMemory: boolean;
  customApiKeys?: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const personalities = [
  { id: "professional", name: "Professional", desc: "Formal, precise, and objective." },
  { id: "friendly", name: "Friendly", desc: "Warm, empathetic, and conversational." },
  { id: "creative", name: "Creative", desc: "Imaginative, expressive, and detailed." },
  { id: "sarcastic", name: "Sarcastic", desc: "Witty, sharp, and a bit cheeky." },
  { id: "concise", name: "Concise", desc: "Short, direct, and to the point." },
];

export const accentColors = [
  { id: "indigo", class: "bg-indigo-500", border: "border-indigo-500" },
  { id: "emerald", class: "bg-emerald-500", border: "border-emerald-500" },
  { id: "rose", class: "bg-rose-500", border: "border-rose-500" },
  { id: "amber", class: "bg-amber-500", border: "border-amber-500" },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [tempSettings, setTempSettings] = React.useState<AppSettings>(settings);

  React.useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(tempSettings);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-dark rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Settings className="text-indigo-400" size={20} />
                Settings
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* User Profile */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> User Profile
                </label>
                <input
                  type="text"
                  value={tempSettings.userName}
                  onChange={(e) => setTempSettings({ ...tempSettings, userName: e.target.value })}
                  placeholder="Your Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* API Keys */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Key size={14} /> Gemini API Keys (Optional)
                </label>
                <textarea
                  value={tempSettings.customApiKeys || ""}
                  onChange={(e) => setTempSettings({ ...tempSettings, customApiKeys: e.target.value })}
                  placeholder="Enter your API Keys (one per line) for automatic rotation"
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none font-mono text-xs"
                />
                <p className="text-[10px] text-zinc-500 italic">
                  If one key hits its limit, Zephyra will automatically switch to the next one.
                </p>
              </div>

              {/* AI Personality */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Brain size={14} /> AI Personality
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {personalities.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setTempSettings({ ...tempSettings, personality: p.id })}
                      className={cn(
                        "flex flex-col items-start p-3 rounded-xl border transition-all text-left",
                        tempSettings.personality === p.id
                          ? "bg-indigo-500/10 border-indigo-500/50"
                          : "bg-white/5 border-transparent hover:bg-white/10"
                      )}
                    >
                      <span className="text-sm font-bold">{p.name}</span>
                      <span className="text-[11px] text-zinc-500">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Palette size={14} /> Accent Color
                </label>
                <div className="flex gap-4">
                  {accentColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setTempSettings({ ...tempSettings, accentColor: c.id })}
                      className={cn(
                        "w-10 h-10 rounded-full transition-all border-2",
                        c.class,
                        tempSettings.accentColor === c.id
                          ? "scale-110 border-white"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-white/5">
              <button
                onClick={handleSave}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
