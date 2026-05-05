import Navbar from "@/components/Navbar";
import { Stats, FeatureCard } from "@/components/Marketing";
import { ArrowRight, Terminal, Zap, Shield, Layout, Cpu, Database, Globe, Play } from "lucide-react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

export default function Home() {
  return (
    <main className="min-h-screen pt-32 pb-20 overflow-x-hidden bg-background text-foreground selection:bg-foreground/10">
      <Navbar />
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-foreground/[0.03] blur-[150px] rounded-full -z-10 animate-pulse" />
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 text-center mb-40 relative pt-10">
        

        <h1 className="text-6xl md:text-[140px] font-black tracking-tighter mb-8 bg-gradient-to-b from-foreground via-foreground/90 to-foreground/40 bg-clip-text text-transparent leading-[0.85]">
          Backend. <br /> Perfected.
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto mb-16 leading-relaxed font-medium">
          The production-grade framework for building APIs at lightspeed. 
          Zero-config, fully type-safe, and natively powered by a CLI-first architecture.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-32">
          <Link 
            href="/docs" 
            className="w-full md:w-auto bg-foreground text-background px-10 py-5 rounded-full font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95 text-lg"
          >
            Start Building <ArrowRight size={20} />
          </Link>
          <div className="w-full md:w-auto bg-foreground/[0.02] border border-border rounded-full px-8 py-5 font-mono text-sm text-zinc-400 flex items-center justify-between gap-8 backdrop-blur-2xl group hover:border-foreground/20 transition-all shadow-2xl">
            <span className="flex items-center gap-4">
              <span className="text-zinc-600 font-bold">$</span>
              <span className="group-hover:text-foreground transition-colors font-medium">npx create-zerra-app@latest</span>
            </span>
            <CopyButton text="npx create-zerra-app@latest" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto border-t border-border pt-20">
          <Stats value="~45ms" label="Cold Start" />
          <Stats value="<1s" label="Build Time" />
          <Stats value="Zero" label="Boilerplate" />
          <Stats value="100%" label="Type-Safe" />
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 mb-48">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Unmatched DX.</h2>
          <p className="text-zinc-500 text-xl max-w-2xl mx-auto">Every single feature is obsessively designed to keep you in the flow and ship faster.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[340px]">
          {/* Large Feature */}
          <div className="md:col-span-8 relative group overflow-hidden rounded-[40px] border border-border bg-foreground/[0.02] p-12 flex flex-col justify-end hover:bg-foreground/[0.04] transition-all duration-500 shadow-2xl shadow-black/5">
            <div className="absolute top-12 right-12 text-zinc-800 group-hover:text-zinc-700 transition-colors">
              <Layout size={140} strokeWidth={1} />
            </div>
            <h3 className="text-4xl font-black mb-4 tracking-tight">File-based Routing</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-lg leading-relaxed text-lg">
              Define your API structure simply by creating files. Folders become paths, files become endpoints. 
              Supports index routing, dynamic parameters, and catch-all routes natively.
            </p>
          </div>

          {/* Small Feature */}
          <div className="md:col-span-4 relative group overflow-hidden rounded-[40px] border border-border bg-foreground/[0.02] p-12 flex flex-col justify-end hover:bg-foreground/[0.04] transition-all duration-500 shadow-2xl shadow-black/5">
             <div className="absolute top-12 right-12 text-zinc-800 group-hover:text-zinc-700 transition-colors">
              <Zap size={80} strokeWidth={1} />
            </div>
            <h3 className="text-3xl font-black mb-3 tracking-tight">Instant Boot</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Under 50ms startup time. The fastest in the entire Node.js ecosystem.</p>
          </div>

          {/* Another Small Feature */}
          <div className="md:col-span-4 relative group overflow-hidden rounded-[40px] border border-border bg-foreground/[0.02] p-12 flex flex-col justify-end hover:bg-foreground/[0.04] transition-all duration-500 shadow-2xl shadow-black/5">
            <div className="absolute top-12 right-12 text-zinc-800 group-hover:text-zinc-700 transition-colors">
              <Shield size={80} strokeWidth={1} />
            </div>
            <h3 className="text-3xl font-black mb-3 tracking-tight">Secure</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Built-in rate limiting, automatic cookie parsing, and intelligent CORS management.</p>
          </div>

          {/* Medium Feature */}
          <div className="md:col-span-8 relative group overflow-hidden rounded-[40px] border border-border bg-foreground/[0.02] p-12 flex flex-col justify-end hover:bg-foreground/[0.04] transition-all duration-500 shadow-2xl shadow-black/5">
            <div className="absolute top-12 right-12 text-zinc-800 group-hover:text-zinc-700 transition-colors">
              <Database size={140} strokeWidth={1} />
            </div>
            <h3 className="text-4xl font-black mb-4 tracking-tight">Zero-Config Middlewares</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-lg leading-relaxed text-lg">
              Drop a <code className="bg-foreground/10 px-2 py-1 rounded text-sm text-foreground">_middleware.ts</code> file anywhere in your route tree to globally or locally intercept requests, validate schemas, and manipulate responses.
            </p>
          </div>
        </div>
      </section>

      {/* Dev Console Spotlight */}
      <section className="max-w-6xl mx-auto px-6 mb-48">
        <div className="rounded-[48px] border border-border bg-gradient-to-b from-foreground/[0.05] to-transparent p-[2px] overflow-hidden">
          <div className="rounded-[46px] bg-background p-10 md:p-20 text-center border border-border relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
              The Dev Console.
            </h2>
            <p className="text-zinc-500 text-lg md:text-xl mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
              Test your routes, monitor performance, and debug your application in real-time. 
              Built directly into the core runtime. Accessible at <code className="bg-foreground/5 text-foreground px-3 py-1 rounded-md border border-border">/__zerra</code>.
            </p>
            
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 pb-16 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8 pt-16 text-zinc-500 text-sm">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
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
