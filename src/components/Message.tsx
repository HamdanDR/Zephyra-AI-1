import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";
import { Message as MessageType } from "../lib/gemini";
import { motion } from "motion/react";
import { User, Copy, Check, FileText, Play, Terminal } from "lucide-react";
import { ZephyraLogo } from "./ZephyraLogo";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Edit2, Save, X as CloseIcon } from "lucide-react";

interface MessageProps {
  message: MessageType;
  onPreview?: (code: string, language: string) => void;
  onEdit?: (id: string, newContent: string) => void;
}

const CodeBlock = ({ language, value, onPreview }: { language: string, value: string, onPreview?: (code: string, language: string) => void }) => {
  const [copied, setCopied] = useState(false);
  
  // Extract filename if present in language string (e.g. "typescript:src/App.tsx")
  const parts = language?.split(":") || ["text"];
  const lang = parts[0];
  const filename = parts.slice(1).join(":");

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPreviewable = ["html", "css", "javascript", "typescript", "jsx", "tsx", "python"].includes(lang.toLowerCase());

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-zinc-950/50 group">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{lang}</span>
          {filename && (
            <span className="text-[10px] text-zinc-400 font-mono italic">{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPreviewable && onPreview && (
            <button
              onClick={() => onPreview(value, lang)}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-indigo-400 flex items-center gap-1.5"
              title="Preview Code"
            >
              {lang.toLowerCase() === "python" ? <Terminal size={14} /> : <Play size={14} />}
              <span className="text-[10px] font-bold uppercase">Preview</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span className="text-[10px] font-bold uppercase">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={lang.toLowerCase()}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1.5rem",
          fontSize: "0.85rem",
          background: "transparent",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export const Message: React.FC<MessageProps> = ({ message, onPreview, onEdit }) => {
  const isUser = message.role === "user";
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleSave = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex w-full gap-4 py-8 px-4 md:px-8 group",
        isUser ? "bg-transparent" : "glass-dark"
      )}
    >
      <div className="flex-shrink-0">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          isUser ? "bg-indigo-600/20 text-indigo-400" : "bg-zinc-900 border border-white/10"
        )}>
          {isUser ? <User size={18} /> : <ZephyraLogo size={18} />}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {isUser ? "You" : "Zephyra AI"}
            </span>
          </div>
          {isUser && !isEditing && onEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/5 rounded-lg transition-all text-zinc-500 hover:text-indigo-400"
              title="Edit message"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
        
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((file, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-2">
                {file.mimeType.startsWith("image/") ? (
                  <img 
                    src={`data:${file.mimeType};base64,${file.data}`} 
                    alt={file.name} 
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <FileText size={20} className="text-zinc-400" />
                )}
                <span className="text-[10px] text-zinc-400">{file.name}</span>
              </div>
            ))}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-zinc-100 focus:ring-1 focus:ring-indigo-500/50 outline-none min-h-[100px] resize-none"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <Save size={14} />
                Save & Resend
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-lg text-xs font-bold transition-colors"
              >
                <CloseIcon size={14} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none prose-p:leading-relaxed">
            <ReactMarkdown
              components={{
                p({ children }) {
                  return <div className="mb-4 last:mb-0">{children}</div>;
                },
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";
                  const isInline = !match;
                  
                  return !isInline ? (
                    <CodeBlock
                      language={language}
                      value={String(children).replace(/\n$/, "")}
                      onPreview={onPreview}
                    />
                  ) : (
                    <code className={cn("bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-sm", className)} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};
