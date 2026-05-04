import { Terminal, Copy } from "lucide-react";
import CopyButton from "@/components/CopyButton";

export default function GettingStarted() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Guide</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Getting Started</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Learn how to scaffold your first Zerra application and start building production-ready APIs in seconds.
        </p>
      </div>

      <div className="h-px bg-white/5 w-full my-4" />

      <section id="installation" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Installation</h2>
        <p className="text-zinc-400">
          The easiest way to start a new project is with the Zerra CLI. It will prompt you for your database, language, and feature preferences.
        </p>
        
        <div className="relative group" id="scaffolding">
          <div className="bg-zinc-900 rounded-xl p-6 font-mono text-sm border border-white/5 flex items-center justify-between">
            <span className="text-white flex items-center gap-3">
              <span className="text-zinc-600">$</span> npx create-zerra-app my-app
            </span>
            <CopyButton text="npx create-zerra-app my-app" />
          </div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-white/0 via-white/5 to-white/0 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-xl -z-10" />
        </div>
      </section>

      <section id="development" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Start Developing</h2>
        <p className="text-zinc-400">
          Once the installation is complete, move into your project directory and start the development server.
        </p>
        
        <div className="bg-zinc-900 rounded-xl p-6 font-mono text-sm border border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-zinc-600">$</span>
            <span className="text-white">cd my-app</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-600">$</span>
            <span className="text-white">npm run dev</span>
          </div>
        </div>

        <p className="text-zinc-400">
          Your server will start (usually in less than 50ms!) and the <span className="text-white font-medium">Dev Console</span> will be available at <code className="bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5 text-sm text-zinc-300">http://localhost:3000/__zerra</code>.
        </p>
      </section>

      <div id="next-steps" className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
          <h4 className="font-bold mb-2">Next Steps</h4>
          <p className="text-sm text-zinc-400">Learn how file-based routing works in Zerra.</p>
          <div className="mt-4 text-white text-sm font-bold flex items-center gap-1">
            Read Routing Docs →
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
          <h4 className="font-bold mb-2">Database Setup</h4>
          <p className="text-sm text-zinc-400">Configure PostgreSQL, MongoDB, or Supabase.</p>
          <div className="mt-4 text-white text-sm font-bold flex items-center gap-1">
            Connect Database →
          </div>
        </div>
      </div>
    </div>
  );
}
