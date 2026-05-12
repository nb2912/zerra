import Navbar from "@/components/Navbar";
import { Stats } from "@/components/Marketing";
import { Zap, Shield, Layout, Database } from "lucide-react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import DynamicTerminal from "@/components/DynamicTerminal";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function Home() {
  return (
    <main className="relative min-h-screen pt-32 pb-20 overflow-x-hidden text-foreground selection:bg-foreground/10">
      <div className="absolute inset-0 z-0">
        <AnimatedBackground />
      </div>
      <Navbar />
      


      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 text-center mb-40 relative z-10 pt-24 md:pt-32 flex flex-col items-center">
        
        {/* Minimalist Title */}
        <h1 className="text-5xl md:text-6xl lg:text-[80px] font-bold tracking-tight mb-6 text-foreground animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150 fill-mode-both leading-tight">
          The CLI-first Backend Framework
        </h1>
        
        {/* Clean Description */}
        <p className="text-base md:text-lg lg:text-xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal animate-in slide-in-from-bottom-6 fade-in duration-1000 delay-300 fill-mode-both">
          Used by top engineering teams, Zerra enables you to create <span className="text-foreground font-medium">high-performance APIs</span> with the power of file-based routing.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-500 fill-mode-both w-full sm:w-auto">
          <Link 
            href="/docs" 
            className="w-full sm:w-auto bg-foreground text-background px-6 py-3 rounded-lg font-medium flex items-center justify-center hover:bg-zinc-200 transition-colors"
          >
            Start Building
          </Link>
          <Link 
            href="/docs/getting-started" 
            className="w-full sm:w-auto bg-transparent border border-zinc-800 hover:bg-zinc-900 rounded-lg px-6 py-3 font-medium text-foreground flex items-center justify-center transition-colors"
          >
            Read Docs
          </Link>
        </div>

        {/* CLI Command */}
        <div className="mt-10 text-zinc-500 font-mono text-[13px] flex items-center justify-center gap-4 animate-in fade-in duration-1000 delay-700 fill-mode-both group">
          <span className="group-hover:text-zinc-400 transition-colors">~ npx create-zerra-app@latest</span>
          <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
            <CopyButton text="npx create-zerra-app@latest" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto border-t border-border pt-12 md:pt-20">
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
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[300px] md:auto-rows-[340px]">
          {/* Large Feature */}
          <div className="md:col-span-8 relative group overflow-hidden rounded-[40px] border border-border bg-foreground/[0.02] p-8 md:p-12 flex flex-col justify-end hover:bg-foreground/[0.04] transition-all duration-500 shadow-2xl shadow-black/5">
            <div className="absolute top-6 right-6 md:top-12 md:right-12 text-zinc-800/40 md:text-zinc-800 group-hover:text-zinc-700 transition-colors z-0">
              <Layout size={80} className="md:w-[140px] md:h-[140px]" strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-black mb-3 md:mb-4 tracking-tight">File-based Routing</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-lg leading-relaxed text-base md:text-lg">
                Define your API structure simply by creating files. Folders become paths, files become endpoints. 
                Supports index routing, dynamic parameters, and catch-all routes natively.
              </p>
            </div>
          </div>

          {/* Small Feature */}
          <div className="md:col-span-4 relative group overflow-hidden rounded-[40px] border border-border bg-foreground/[0.02] p-8 md:p-12 flex flex-col justify-end hover:bg-foreground/[0.04] transition-all duration-500 shadow-2xl shadow-black/5">
             <div className="absolute top-8 right-8 md:top-12 md:right-12 text-zinc-800 group-hover:text-zinc-700 transition-colors">
              <Zap size={64} className="md:w-20 md:h-20" strokeWidth={1} />
            </div>
            <h3 className="text-3xl font-black mb-3 tracking-tight">Instant Boot</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Under 50ms startup time. The fastest in the entire Node.js ecosystem.</p>
          </div>

          {/* Another Small Feature */}
          <div className="md:col-span-4 relative group overflow-hidden rounded-[40px] border border-border bg-foreground/[0.02] p-8 md:p-12 flex flex-col justify-end hover:bg-foreground/[0.04] transition-all duration-500 shadow-2xl shadow-black/5">
            <div className="absolute top-8 right-8 md:top-12 md:right-12 text-zinc-800 group-hover:text-zinc-700 transition-colors">
              <Shield size={64} className="md:w-20 md:h-20" strokeWidth={1} />
            </div>
            <h3 className="text-3xl font-black mb-3 tracking-tight">Secure</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Built-in rate limiting, automatic cookie parsing, and intelligent CORS management.</p>
          </div>

          {/* Medium Feature */}
          <div className="md:col-span-8 relative group overflow-hidden rounded-[40px] border border-border bg-foreground/[0.02] p-8 md:p-12 flex flex-col justify-end hover:bg-foreground/[0.04] transition-all duration-500 shadow-2xl shadow-black/5">
            <div className="absolute top-6 right-6 md:top-12 md:right-12 text-zinc-800/40 md:text-zinc-800 group-hover:text-zinc-700 transition-colors z-0">
              <Database size={80} className="md:w-[140px] md:h-[140px]" strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-black mb-3 md:mb-4 tracking-tight">Zero-Config Middlewares</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-lg leading-relaxed text-base md:text-lg">
                Drop a <code className="bg-foreground/10 px-2 py-1 rounded text-sm text-foreground">_middleware.ts</code> file anywhere in your route tree to globally or locally intercept requests, validate schemas, and manipulate responses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dev Console Spotlight */}
      <section className="max-w-6xl mx-auto px-6 mb-32 md:mb-48">
        <div className="rounded-[32px] md:rounded-[48px] border border-border bg-gradient-to-b from-foreground/[0.05] to-transparent p-[2px] overflow-hidden">
          <div className="rounded-[30px] md:rounded-[46px] bg-background p-6 md:p-20 text-center border border-border relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] md:w-1/2 h-[2px] bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />
            
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
              The Dev Console.
            </h2>
            <p className="text-zinc-500 text-lg md:text-xl mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
              Test your routes, monitor performance, and debug your application in real-time. 
              Built directly into the core runtime. Accessible at <code className="bg-foreground/5 text-foreground px-3 py-1 rounded-md border border-border">/__zerra</code>.
            </p>
            
            <DynamicTerminal />
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

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Zerra",
            "operatingSystem": "Cross-platform",
            "applicationCategory": "DeveloperApplication",
            "description": "Production-grade backend framework built for speed and DX.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "author": {
              "@type": "Organization",
              "name": "Zerra"
            }
          })
        }}
      />
    </main>
  );
}
