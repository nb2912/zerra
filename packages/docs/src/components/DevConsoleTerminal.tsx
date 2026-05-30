"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal, Play, Pause, RotateCcw } from "lucide-react";

interface LogLine {
  time: string;
  text: React.ReactNode;
}

export default function DevConsoleTerminal() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([
    {
      time: "12:44:01",
      text: <span className="text-emerald-500 font-bold">🚀 Zerra Engine started on http://localhost:3000</span>,
    },
    {
      time: "12:44:05",
      text: <span className="text-zinc-400">📁 Mapping routes from: /api</span>,
    },
    {
      time: "12:44:12",
      text: <span className="text-zinc-400 italic">⏰ Scheduled job: cleanup.js [0 0 * * *]</span>,
    },
    {
      time: "12:45:22",
      text: (
        <span className="text-white font-bold tracking-tight">
          <span className="text-emerald-400">[GET]</span> /api/users ➜ <span className="text-emerald-400">200</span> (12ms)
        </span>
      ),
    },
    {
      time: "12:45:30",
      text: (
        <span className="text-white font-bold tracking-tight">
          <span className="text-red-400">[POST]</span> /api/auth ➜ <span className="text-red-400">401</span> (4ms)
        </span>
      ),
    },
  ]);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  useEffect(() => {
    if (!isRunning) return;

    // Startup sequence trigger
    setLogs([
      {
        time: new Date().toLocaleTimeString(),
        text: <span className="text-yellow-400 font-bold">⚡ Booting Zerra server engine...</span>,
      },
    ]);

    const startupTimers = [
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            text: <span className="text-emerald-400 font-bold">🚀 Zerra Engine v1.2.1 initialized on http://localhost:3000</span>,
          },
        ]);
      }, 800),
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            text: <span className="text-zinc-400">📁 Mapped 12 files from /api recursively</span>,
          },
        ]);
      }, 1500),
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            text: <span className="text-purple-400 font-bold">📦 Cron scheduler started (3 active jobs loaded)</span>,
          },
        ]);
      }, 2200),
    ];

    // Live Request Loop simulator after startup completes
    let requestInterval: NodeJS.Timeout;
    const routesList = [
      { method: "GET", path: "/api/users", code: 200, color: "text-emerald-400" },
      { method: "POST", path: "/api/auth/login", code: 200, color: "text-emerald-400" },
      { method: "POST", path: "/api/auth/login", code: 401, color: "text-red-400" },
      { method: "GET", path: "/api/products/[id]", code: 200, color: "text-emerald-400" },
      { method: "PUT", path: "/api/users/profile", code: 204, color: "text-emerald-400" },
      { method: "DELETE", path: "/api/posts/[id]", code: 200, color: "text-emerald-400" },
      { method: "GET", path: "/api/admin/dashboard", code: 403, color: "text-red-400" },
    ];

    const startRequestInterval = () => {
      requestInterval = setInterval(() => {
        const randomRoute = routesList[Math.floor(Math.random() * routesList.length)];
        const latency = Math.floor(Math.random() * 45) + 2;
        const timeStr = new Date().toLocaleTimeString();

        setLogs((prev) => {
          const cutLogs = prev.length > 8 ? prev.slice(prev.length - 8) : prev;
          return [
            ...cutLogs,
            {
              time: timeStr,
              text: (
                <span className="text-white font-bold tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <span className={randomRoute.color}>{`[${randomRoute.method}]`}</span> {randomRoute.path} ➜{" "}
                  <span className={randomRoute.color}>{randomRoute.code}</span> ({latency}ms)
                </span>
              ),
            },
          ];
        });
      }, 1800);
    };

    const runRequestTimer = setTimeout(startRequestInterval, 3000);

    return () => {
      startupTimers.forEach(clearTimeout);
      clearTimeout(runRequestTimer);
      clearInterval(requestInterval);
    };
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    setLogs([
      {
        time: "12:44:01",
        text: <span className="text-emerald-500 font-bold">🚀 Zerra Engine started on http://localhost:3000</span>,
      },
      {
        time: "12:44:05",
        text: <span className="text-zinc-400">📁 Mapping routes from: /api</span>,
      },
      {
        time: "12:44:12",
        text: <span className="text-zinc-400 italic">⏰ Scheduled job: cleanup.js [0 0 * * *]</span>,
      },
      {
        time: "12:45:22",
        text: (
          <span className="text-white font-bold tracking-tight">
            <span className="text-emerald-400">[GET]</span> /api/users ➜ <span className="text-emerald-400">200</span> (12ms)
          </span>
        ),
      },
      {
        time: "12:45:30",
        text: (
          <span className="text-white font-bold tracking-tight">
            <span className="text-red-400">[POST]</span> /api/auth ➜ <span className="text-red-400">401</span> (4ms)
          </span>
        ),
      },
    ]);
  };

  return (
    <div className="relative aspect-video w-full rounded-3xl bg-black border border-border shadow-[0_0_100px_rgba(255,255,255,0.05)] flex flex-col group overflow-hidden text-left transition-all duration-300">
      {/* Terminal Header */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-900/50 relative z-20 select-none">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          <div className="ml-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Terminal size={12} />
            Zerra Engine Console v1.2.1
          </div>
        </div>

        {/* Controls */}
        {isRunning && (
          <div className="flex items-center gap-4 animate-in fade-in duration-300">
            <button
              onClick={() => setIsRunning(false)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Pause Simulation"
            >
              <Pause size={14} />
            </button>
            <button
              onClick={handleReset}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Reset Console"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Terminal Log Area */}
      <div className="p-8 font-mono text-sm leading-relaxed overflow-y-auto flex-grow flex flex-col justify-end">
        <div className="space-y-3">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-4">
              <span className="text-zinc-600 select-none">[{log.time}]</span>
              <div className="flex-grow">{log.text}</div>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        {/* Blinking Cursor */}
        <div className="mt-6 flex gap-3 items-center">
          <span className="text-zinc-600 select-none">&gt;</span>
          <div className={`w-2 h-5 bg-white/50 ${isRunning ? "animate-pulse" : ""}`} />
        </div>
      </div>

      {/* Overlay Play Trigger */}
      {!isRunning && (
        <div 
          onClick={() => setIsRunning(true)}
          className="absolute inset-0 bg-black/35 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center cursor-pointer z-10"
        >
          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all shadow-2xl duration-300">
            <Play className="text-white ml-1" size={28} fill="white" />
          </div>
        </div>
      )}
    </div>
  );
}
