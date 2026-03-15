import React, { useState, useEffect } from "react";
import { X, Maximize2, Minimize2, RefreshCw, Terminal, Globe, Bot } from "lucide-react";
import { cn } from "../lib/utils";

interface CodePreviewProps {
  code: string;
  language: string;
  onClose: () => void;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ code, language, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);
  const [output, setOutput] = useState<string[]>([]);
  
  const isWeb = ["html", "css", "javascript", "typescript", "jsx", "tsx"].includes(language.toLowerCase());
  const isPython = language.toLowerCase() === "python";

  useEffect(() => {
    if (isPython) {
      setOutput(["[Zephyra Python Terminal]", "Initializing environment...", "Running script...", ""]);
      // Simulate python execution for now
      const timer = setTimeout(() => {
        setOutput(prev => [...prev, "Output:", code.includes("print") ? "Hello from Zephyra Python!" : "Script executed successfully.", "", ">>> "]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [code, language]);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
    if (isPython) {
      setOutput(["[Zephyra Python Terminal]", "Restarting...", ""]);
      setTimeout(() => setOutput(prev => [...prev, ">>> "]), 1000);
    }
  };

  const srcDoc = isWeb ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { background: #0f172a; color: white; font-family: sans-serif; padding: 1rem; }
          ${language.toLowerCase() === 'css' ? code : ''}
        </style>
      </head>
      <body>
        ${language.toLowerCase() === 'html' ? code : '<div id="root"></div>'}
        <script>
          try {
            ${language.toLowerCase() === 'javascript' || language.toLowerCase() === 'typescript' ? code : ''}
          } catch (err) {
            document.body.innerHTML += '<pre style="color: #ef4444; margin-top: 1rem;">' + err.message + '</pre>';
          }
        </script>
      </body>
    </html>
  ` : "";

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 z-50 flex flex-col glass-dark border-l border-white/10 transition-all duration-500 ease-in-out",
      isFullscreen ? "w-full" : "w-full md:w-[500px] lg:w-[600px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            {isPython ? <Terminal size={18} /> : <Globe size={18} />}
          </div>
          <div>
            <h3 className="text-sm font-bold">Preview Output</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{language}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
            title={isFullscreen ? "Minimize" : "Maximize"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-red-400"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-zinc-950">
        {isWeb ? (
          <iframe
            key={key}
            srcDoc={srcDoc}
            title="Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts"
          />
        ) : isPython ? (
          <div className="p-6 font-mono text-sm h-full overflow-y-auto custom-scrollbar">
            {output.map((line, i) => (
              <div key={i} className={cn(
                "mb-1",
                line.startsWith(">>>") ? "text-indigo-400" : 
                line.startsWith("[") ? "text-zinc-500" : "text-zinc-300"
              )}>
                {line}
              </div>
            ))}
            <div className="flex items-center gap-2 text-indigo-400">
              <span>{">>>"}</span>
              <span className="w-2 h-4 bg-indigo-400 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
            <Bot size={48} className="opacity-20" />
            <p className="text-sm italic">Preview not available for this language yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
