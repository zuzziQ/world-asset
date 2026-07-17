"use client";

import React from "react";
import { RefreshCw, X } from "lucide-react";

interface TunnelTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: string[];
}

export function TunnelTerminal({ isOpen, onClose, logs }: TunnelTerminalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-black border border-purple-500/30 rounded-2xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex justify-between items-center border-b border-purple-500/20 pb-2 mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5 font-mono">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Google Flow Tunnel Active
        </span>
        <button 
          onClick={onClose}
          className="text-neutral-500 hover:text-white transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="h-44 bg-black/60 rounded-xl p-3 overflow-y-auto font-mono text-[9px] text-purple-300 space-y-1.5 border border-white/5 custom-scrollbar">
        {logs.map((log, idx) => (
          <div key={idx} className="leading-relaxed">{log}</div>
        ))}
      </div>
    </div>
  );
}
