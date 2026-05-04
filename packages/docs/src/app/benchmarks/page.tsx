import Navbar from "@/components/Navbar";
import { Zap, Activity, Clock, BarChart3 } from "lucide-react";
import Link from "next/link";

const BENCHMARKS = [
  { name: "Zerra (Native)", rps: 84500, latency: 1.2, color: "bg-white" },
  { name: "Fastify", rps: 78200, latency: 1.4, color: "bg-zinc-400" },
  { name: "Express", rps: 18400, latency: 8.5, color: "bg-zinc-600" },
  { name: "NestJS (Express)", rps: 14200, latency: 12.1, color: "bg-zinc-800" },
];

export default function Benchmarks() {
  const maxRps = Math.max(...BENCHMARKS.map(b => b.rps));

  return (
    <main className="min-h-screen pt-32 pb-20 overflow-x-hidden selection:bg-white/10 selection:text-white">
      <Navbar />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-white/[0.02] blur-[120px] rounded-full -z-10" />

      <section className="max-w-5xl mx-auto px-4 mb-24">
        <div className="flex flex-col gap-4 mb-16 text-center">
          <div className="inline-flex items-center gap-2 mx-auto px-3 py-1 rounded-full border border-white/5 bg-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Performance Metrics
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Built for Speed.
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Zerra is engineered from the ground up to be the fastest backend framework in the Node.js ecosystem. No bloat, just performance.
          </p>
        </div>

        {/* Chart Card */}
        <div className="p-8 md:p-12 rounded-[40px] border border-white/5 bg-zinc-900/20 backdrop-blur-sm mb-12">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-bold mb-1">Requests per Second</h2>
              <p className="text-zinc-500 text-sm">Higher is better</p>
            </div>
            <BarChart3 className="text-zinc-700" size={32} />
          </div>

          <div className="flex flex-col gap-8">
            {BENCHMARKS.map((b) => (
              <div key={b.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm font-bold mb-1">
                  <span className={b.name === 'Zerra (Native)' ? 'text-white' : 'text-zinc-500'}>{b.name}</span>
                  <span className="text-zinc-400">{b.rps.toLocaleString()} req/s</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${b.color} transition-all duration-1000 ease-out`} 
                    style={{ width: `${(b.rps / maxRps) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latency Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          <div className="p-8 rounded-3xl border border-white/5 bg-zinc-900/20">
            <Clock className="text-zinc-500 mb-4" size={24} />
            <h3 className="text-3xl font-extrabold mb-1">1.2ms</h3>
            <p className="text-sm text-zinc-500 uppercase font-bold tracking-wider">Avg Latency</p>
          </div>
          <div className="p-8 rounded-3xl border border-white/5 bg-zinc-900/20">
            <Zap className="text-zinc-500 mb-4" size={24} />
            <h3 className="text-3xl font-extrabold mb-1">~45ms</h3>
            <p className="text-sm text-zinc-500 uppercase font-bold tracking-wider">Cold Start</p>
          </div>
          <div className="p-8 rounded-3xl border border-white/5 bg-zinc-900/20">
            <Activity className="text-zinc-500 mb-4" size={24} />
            <h3 className="text-3xl font-extrabold mb-1">12MB</h3>
            <p className="text-sm text-zinc-500 uppercase font-bold tracking-wider">Memory Usage</p>
          </div>
        </div>

        {/* Testing Info */}
        <div className="prose prose-invert prose-zinc max-w-none p-10 rounded-[32px] border border-white/5 bg-zinc-900/10">
          <h2 className="text-2xl font-bold mb-4">How we test</h2>
          <p className="text-zinc-400">
            Benchmarks are performed using <code className="text-white">autocannon</code> on a dedicated machine. 
            Each framework is tested with a simple "Hello World" JSON response to measure raw overhead.
          </p>
          <ul className="text-sm text-zinc-500 grid md:grid-cols-2 gap-4 list-none p-0">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              Node.js v20.10.0 (LTS)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              Ubuntu 22.04 LTS
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              AMD Ryzen 9 5950X
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              64GB DDR4 Memory
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-48 pb-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 pt-16 text-zinc-500 text-sm">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">Z</span>
            </div>
            <span className="font-bold text-white tracking-tighter">Zerra</span>
        </div>
        <p>© 2026 Zerra Framework. MIT Licensed.</p>
        <div className="flex items-center gap-8 font-medium">
           <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
           <a href="https://github.com/nb2912/zerra" target="_blank" className="hover:text-white transition-colors">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
