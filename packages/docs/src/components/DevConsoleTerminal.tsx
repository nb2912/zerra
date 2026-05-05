import React from "react";
import { Terminal, Play } from "lucide-react";

export default function DevConsoleTerminal() {
  return (
    <div className="relative aspect-video w-full rounded-3xl bg-black border border-border shadow-[0_0_100px_rgba(255,255,255,0.05)] flex flex-col group overflow-hidden text-left">
      {/* Terminal Header */}
      <div className="h-12 border-b border-white/10 flex items-center px-6 gap-3 bg-zinc-900/50">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <div className="ml-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <Terminal size={12} />
          Zerra Engine Console v1.2.1
        </div>
      </div>

      <div className="p-8 font-mono text-sm leading-relaxed overflow-hidden">
        <div className="flex gap-4 mb-4">
          <span className="text-zinc-600">{"["}12:44:01{"]"}</span>
          <span className="text-emerald-500 font-bold">🚀 Zerra Engine started on http://localhost:3000</span>
        </div>
        <div className="flex gap-4 mb-2 opacity-80">
          <span className="text-zinc-600">{"["}12:44:05{"]"}</span>
          <span className="text-zinc-400">📁 Mapping routes from: /api</span>
        </div>
        <div className="flex gap-4 mb-2">
          <span className="text-zinc-600">{"["}12:44:12{"]"}</span>
          <span className="text-zinc-400 italic">⏰ Scheduled job: cleanup.js [0 0 * * *]</span>
        </div>
        
        <div className="mt-8 space-y-2">
          <div className="flex gap-4">
            <span className="text-zinc-600">{"["}12:45:22{"]"}</span>
            <span className="text-white font-bold tracking-tight"><span className="text-emerald-400">[GET]</span> /api/users ➜ <span className="text-emerald-400">200</span> (12ms)</span>
          </div>
          <div className="flex gap-4">
            <span className="text-zinc-600">{"["}12:45:30{"]"}</span>
            <span className="text-white font-bold tracking-tight"><span className="text-red-400">[POST]</span> /api/auth ➜ <span className="text-red-400">401</span> (4ms)</span>
          </div>
        </div>

        {/* Blinking Cursor */}
        <div className="mt-6 flex gap-3 items-center">
          <span className="text-zinc-600">{">"}</span>
          <div className="w-2 h-5 bg-white/50 animate-pulse" />
        </div>
      </div>

      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all cursor-pointer shadow-2xl opacity-0 group-hover:opacity-100 duration-300">
          <Play className="text-white ml-1" size={28} fill="white" />
        </div>
      </div>
    </div>
  );
}
