import { ArrowRight, Zap, Shield, Layout, Cpu } from "lucide-react";
import Link from "next/link";

export default function Introduction() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Documentation</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Introduction</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Welcome to the Zerra documentation. Zerra is a production-grade backend framework designed for speed, simplicity, and a world-class developer experience.
        </p>
      </div>

      <div className="h-px bg-white/5 w-full my-4" />

      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Zap size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">Blazing Fast</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Zero-bundle overhead and native ESM support means your server starts in under 50ms. No more waiting for builds.
          </p>
        </div>
        
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Layout size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">CLI-First</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Generate routes, services, and models directly from your terminal. Stop writing boilerplate, start writing logic.
          </p>
        </div>
        
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Shield size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">Secure by Default</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Built-in CSRF protection, secure headers, and a robust plugin system for authentication and authorization.
          </p>
        </div>
        
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Cpu size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">Native TypeScript</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            First-class TypeScript support with zero configuration. Get full type-safety from your request body to your database.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Why Zerra?</h2>
        <div className="prose prose-invert prose-zinc">
          <p>
            Building backends today is too complex. You spend hours setting up routers, choosing validation libraries, and configuring environments. Zerra changes that by providing a <strong>convention-based</strong> framework that makes the right choices for you.
          </p>
          <ul>
            <li>File-based routing (like Next.js)</li>
            <li>Colocated business logic and services</li>
            <li>Auto-generated Swagger/OpenAPI documentation</li>
            <li>Integrated Dev Console for real-time monitoring</li>
          </ul>
        </div>
      </section>

      <div className="mt-12 flex justify-end">
        <Link 
          href="/docs/getting-started" 
          className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition-colors"
        >
          Quick Start Guide <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
