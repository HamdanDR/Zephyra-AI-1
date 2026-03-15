import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "../lib/utils";

export interface FileData {
  mimeType: string;
  data: string; // base64
  name: string;
}

interface ChatInputProps {
  onSend: (message: string, files?: FileData[]) => void;
  disabled?: boolean;
  accentColor?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, accentColor = "indigo" }) => {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileData[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || files.length > 0) && !disabled) {
      onSend(input.trim(), files.length > 0 ? files : undefined);
      setInput("");
      setFiles([]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: FileData[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const reader = new FileReader();
      
      const fileData = await new Promise<FileData>((resolve) => {
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          const data = base64.split(",")[1];
          resolve({
            mimeType: file.type,
            data,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      });
      
      newFiles.push(fileData);
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="relative max-w-4xl mx-auto w-full px-4 pb-8">
      {/* File Previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 px-2">
          {files.map((file, idx) => (
            <div key={idx} className="relative group bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-2 pr-8">
              {file.mimeType.startsWith("image/") ? (
                <div className="w-8 h-8 rounded bg-zinc-800 overflow-hidden">
                  <img src={`data:${file.mimeType};base64,${file.data}`} alt={file.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <FileText size={16} className="text-zinc-400" />
              )}
              <span className="text-[10px] text-zinc-400 truncate max-w-[100px]">{file.name}</span>
              <button 
                onClick={() => removeFile(idx)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-zinc-500 hover:text-rose-400 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex items-end gap-2 glass p-2 rounded-2xl shadow-2xl transition-all duration-300",
          accentColor === "indigo" && "focus-within:border-indigo-500/50",
          accentColor === "emerald" && "focus-within:border-emerald-500/50",
          accentColor === "rose" && "focus-within:border-rose-500/50",
          accentColor === "amber" && "focus-within:border-amber-500/50",
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          multiple
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "p-3 text-zinc-500 transition-colors",
            accentColor === "indigo" && "hover:text-indigo-400",
            accentColor === "emerald" && "hover:text-emerald-400",
            accentColor === "rose" && "hover:text-rose-400",
            accentColor === "amber" && "hover:text-amber-400",
          )}
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>
        
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Zephyra anything..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-100 placeholder:text-zinc-600 py-3 resize-none max-h-[200px] custom-scrollbar"
          disabled={disabled}
        />

        <button
          type="submit"
          disabled={(!input.trim() && files.length === 0) || disabled}
          className={cn(
            "p-3 rounded-xl transition-all duration-300 flex items-center justify-center",
            (input.trim() || files.length > 0) && !disabled
              ? cn(
                  "text-white shadow-lg",
                  accentColor === "indigo" && "bg-indigo-600 shadow-indigo-500/40 hover:bg-indigo-500",
                  accentColor === "emerald" && "bg-emerald-600 shadow-emerald-500/40 hover:bg-emerald-500",
                  accentColor === "rose" && "bg-rose-600 shadow-rose-500/40 hover:bg-rose-500",
                  accentColor === "amber" && "bg-amber-600 shadow-amber-500/40 hover:bg-amber-500",
                )
              : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
          )}
        >
          {disabled ? (
            <Sparkles size={20} className="animate-pulse" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
      <p className="text-[10px] text-center mt-3 text-zinc-600 uppercase tracking-[0.2em] font-medium">
        Zephyra AI can make mistakes. Check important info.
      </p>
    </div>
  );
};
