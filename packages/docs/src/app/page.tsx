import Navbar from "@/components/Navbar";
import { Stats, FeatureCard } from "@/components/Marketing";
import { ArrowRight, Terminal, Zap, Shield, Layout, Cpu, Database, Globe } from "lucide-react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

export default function Home() {
  return (
    <main className="min-h-screen pt-32 pb-20 overflow-x-hidden selection:bg-white/10 selection:text-white">
      <Navbar />
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-white/[0.03] blur-[120px] rounded-full -z-10 animate-pulse" />
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 text-center mb-48 relative">
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-10 bg-gradient-to-b from-white via-white to-zinc-600 bg-clip-text text-transparent leading-[0.9]">
          Backend <br /> Simplified.
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
          The production-grade framework for building APIs at lightspeed. 
          Zero-config, type-safe, and CLI-first.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-5 mb-32">
          <Link 
            href="/docs" 
            className="w-full md:w-auto bg-white text-black px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] active:scale-95"
          >
            Get Started <ArrowRight size={20} />
          </Link>
          <div className="w-full md:w-auto bg-black/40 border border-white/10 rounded-xl px-6 py-4 font-mono text-sm text-zinc-300 flex items-center justify-between gap-8 backdrop-blur-xl group hover:border-white/20 transition-all hover:bg-black/60 shadow-2xl">
            <span className="flex items-center gap-3">
              <span className="text-zinc-600">$</span>
              <span className="group-hover:text-white transition-colors">npx create-zerra-app@latest</span>
            </span>
            <CopyButton text="npx create-zerra-app@latest" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/5 pt-16">
          <Stats value="~45ms" label="Startup" />
          <Stats value="<1s" label="Build" />
          <Stats value="0" label="Config" />
          <Stats value="100%" label="Type-Safe" />
        </div>
      </section>

      {/* Bento Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 mb-48">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">Unmatched DX.</h2>
          <p className="text-zinc-500 text-lg">Every feature is designed to keep you in the flow.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
          {/* Large Feature */}
          <div className="md:col-span-8 relative group overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/20 p-10 flex flex-col justify-end hover:bg-zinc-900/40 transition-all duration-500">
            <div className="absolute top-10 right-10 opacity-20 group-hover:opacity-40 transition-opacity">
              <Layout size={120} strokeWidth={1} />
            </div>
            <h3 className="text-3xl font-bold mb-4">File-based Routing</h3>
            <p className="text-zinc-400 max-w-md leading-relaxed">
              Define your API structure by creating files. Folders are paths, files are endpoints. 
              Supports index files, dynamic parameters, and catch-all routes out of the box.
            </p>
          </div>

          {/* Small Feature */}
          <div className="md:col-span-4 relative group overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/20 p-10 flex flex-col justify-end hover:bg-zinc-900/40 transition-all duration-500">
             <div className="absolute top-10 right-10 opacity-20 group-hover:opacity-40 transition-opacity">
              <Zap size={64} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Instant Boot</h3>
            <p className="text-sm text-zinc-400">Under 50ms startup time. Fastest in the ecosystem.</p>
          </div>

          {/* Another Small Feature */}
          <div className="md:col-span-4 relative group overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/20 p-10 flex flex-col justify-end hover:bg-zinc-900/40 transition-all duration-500">
            <div className="absolute top-10 right-10 opacity-20 group-hover:opacity-40 transition-opacity">
              <Shield size={64} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Secure</h3>
            <p className="text-sm text-zinc-400">Built-in CSRF, Rate Limiting, and CORS management.</p>
          </div>

          {/* Medium Feature */}
          <div className="md:col-span-8 relative group overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/20 p-10 flex flex-col justify-end hover:bg-zinc-900/40 transition-all duration-500">
            <div className="absolute top-10 right-10 opacity-20 group-hover:opacity-40 transition-opacity">
              <Database size={80} strokeWidth={1} />
            </div>
            <h3 className="text-3xl font-bold mb-4">Native Database Connectors</h3>
            <p className="text-zinc-400 max-w-md leading-relaxed">
              Zerra ships with high-performance drivers for Postgres, MongoDB, and Supabase. 
              Auto-injection into your request handlers.
            </p>
          </div>
        </div>
      </section>

      {/* Dev Console Spotlight */}
      <section className="max-w-5xl mx-auto px-4 mb-48">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/50 to-transparent p-1 px-1 overflow-hidden">
          <div className="rounded-[22px] bg-black p-8 md:p-16 text-center border border-white/5 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">The Dev Console.</h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
              Test your routes, monitor performance, and debug your application in real-time. 
              Built directly into the core runtime. Accessible at <code className="text-white">/__zerra</code>.
            </p>
            <div className="aspect-video w-full rounded-2xl bg-zinc-900/50 border border-white/5 shadow-2xl flex items-center justify-center group cursor-pointer hover:bg-zinc-900 transition-colors">
              <div className="flex flex-col items-center gap-4 text-zinc-600 group-hover:text-zinc-300 transition-colors">
                <Layout size={48} strokeWidth={1} />
                <span className="text-sm font-bold tracking-widest uppercase">Click to preview dashboard</span>
              </div>
            </div>
          </div>
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
