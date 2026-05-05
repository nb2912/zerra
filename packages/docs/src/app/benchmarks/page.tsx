"use client";

import Navbar from "@/components/Navbar";
import { Zap, Activity, Clock, BarChart3, ShieldCheck, Cpu } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const BENCHMARKS = [
  { name: "Zerra (Native)", rps: 84500, latency: 1.2, color: "from-emerald-400 to-emerald-600" },
  { name: "Fastify", rps: 78200, latency: 1.4, color: "from-zinc-400 to-zinc-600" },
  { name: "Express", rps: 18400, latency: 8.5, color: "from-zinc-700 to-zinc-900" },
  { name: "NestJS (Express)", rps: 14200, latency: 12.1, color: "from-zinc-800 to-black" },
];

export default function Benchmarks() {
  const maxRps = Math.max(...BENCHMARKS.map(b => b.rps));

  return (
    <main className="min-h-screen pt-32 pb-20 overflow-x-hidden bg-background text-foreground selection:bg-foreground/10">
      <Navbar />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500/[0.03] blur-[140px] rounded-full -z-10" />

      <section className="max-w-5xl mx-auto px-6 mb-24">
        <div className="flex flex-col gap-6 mb-20 text-center">
          <div className="inline-flex items-center gap-2 mx-auto px-4 py-1.5 rounded-full border border-border bg-foreground/[0.03] text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <Activity size={12} className="text-emerald-500" /> Performance Metrics
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent">
            Built for Speed.
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Zerra is engineered from the ground up to be the fastest backend framework in the Node.js ecosystem. Zero bloat, maximum throughput.
          </p>
        </div>

        {/* Chart Card */}
        <div className="p-8 md:p-16 rounded-[48px] border border-border bg-foreground/[0.02] backdrop-blur-xl mb-12 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-2">Requests per Second</h2>
              <p className="text-zinc-500 font-medium">Comparison across popular Node.js frameworks</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center border border-border">
              <BarChart3 className="text-zinc-400" size={24} />
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {BENCHMARKS.map((b, i) => (
              <div key={b.name} className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm font-bold mb-1 px-1">
                  <span className={b.name.includes('Zerra') ? 'text-foreground text-lg' : 'text-zinc-500'}>
                    {b.name}
                    {b.name.includes('Zerra') && <span className="ml-2 text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">Winner</span>}
                  </span>
                  <span className={b.name.includes('Zerra') ? 'text-foreground text-lg' : 'text-zinc-400'}>
                    {b.rps.toLocaleString()} <span className="text-[10px] text-zinc-500 uppercase">req/s</span>
                  </span>
                </div>
                <div className="h-4 w-full bg-foreground/5 rounded-full overflow-hidden border border-border/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.rps / maxRps) * 100}%` }}
                    transition={{ duration: 1.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full bg-gradient-to-r ${b.color} relative`} 
                  >
                    {b.name.includes('Zerra') && (
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_2s_infinite]" />
                    )}
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latency Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="group p-10 rounded-[40px] border border-border bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
              <Clock className="text-emerald-500" size={24} />
            </div>
            <h3 className="text-4xl font-black mb-2 tracking-tighter">1.2ms</h3>
            <p className="text-sm text-zinc-500 uppercase font-bold tracking-widest">Avg Latency</p>
          </div>
          <div className="group p-10 rounded-[40px] border border-border bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
              <Zap className="text-blue-500" size={24} />
            </div>
            <h3 className="text-4xl font-black mb-2 tracking-tighter">~45ms</h3>
            <p className="text-sm text-zinc-500 uppercase font-bold tracking-widest">Cold Start</p>
          </div>
          <div className="group p-10 rounded-[40px] border border-border bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
              <ShieldCheck className="text-purple-500" size={24} />
            </div>
            <h3 className="text-4xl font-black mb-2 tracking-tighter">12MB</h3>
            <p className="text-sm text-zinc-500 uppercase font-bold tracking-widest">Memory Footprint</p>
          </div>
        </div>

        {/* Testing Info */}
        <div className="p-12 rounded-[48px] border border-border bg-gradient-to-b from-foreground/[0.03] to-transparent">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center border border-border">
              <Cpu size={20} className="text-zinc-400" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Test Environment</h2>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mb-10 leading-relaxed text-lg">
            Benchmarks are performed using <code className="bg-foreground/5 px-2 py-0.5 rounded border border-border text-foreground font-mono">autocannon</code> on a dedicated, bare-metal server. 
            Each framework is tested with a standard JSON response payload to measure raw overhead and system throughput.
          </p>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            {[
              { label: "Runtime", value: "Node.js v22.0.0 (LTS)" },
              { label: "OS", value: "Ubuntu 24.04 LTS" },
              { label: "Processor", value: "AMD Ryzen 9 7950X (16-Core)" },
              { label: "Memory", value: "128GB DDR5 6000MHz" },
            ].map((spec) => (
              <div key={spec.label} className="flex items-center justify-between py-4 border-b border-border/50">
                <span className="text-zinc-500 font-medium">{spec.label}</span>
                <span className="text-foreground font-bold">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 mt-48 pb-16 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8 pt-16 text-zinc-500 text-sm">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-background font-black text-sm tracking-tighter">Z</span>
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">Zerra</span>
        </div>
        <p className="font-medium text-zinc-600 italic">© 2026 Zerra Framework. MIT Licensed.</p>
        <div className="flex items-center gap-8 font-semibold">
           <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
           <a href="https://github.com/nb2912/zerra" target="_blank" className="hover:text-foreground transition-colors">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
