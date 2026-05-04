import { Terminal, Copy, ArrowRight } from "lucide-react";
import CopyButton from "@/components/CopyButton";

export default function CliDocs() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Reference</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">CLI API</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          The Zerra CLI is your gateway to rapid backend development. Scaffold, manage, and extend your projects with ease.
        </p>
      </div>

      <div className="h-px bg-white/5 w-full my-4" />

      <section id="create" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">create-zerra-app</h2>
        <p className="text-zinc-400">
          The primary command to start a new Zerra project. It features an interactive prompt to help you choose your database, language, and features.
        </p>

        <div className="bg-zinc-900 rounded-xl border border-white/5 p-6 font-mono text-sm group relative">
          <code className="text-blue-400">npx</code> <code className="text-white">create-zerra-app@latest my-app</code>
          <div className="absolute top-4 right-4">
            <CopyButton text="npx create-zerra-app@latest my-app" />
          </div>
        </div>

        <h4 className="font-bold text-sm text-zinc-300">Interactive Options:</h4>
        <ul className="grid md:grid-cols-2 gap-4 list-none p-0">
          <li className="p-4 rounded-xl border border-white/5 bg-zinc-900/30 text-sm text-zinc-400">
            <strong className="text-white block mb-1">Database Selection</strong>
            SQL, MongoDB, Supabase, Firebase, or No-DB.
          </li>
          <li className="p-4 rounded-xl border border-white/5 bg-zinc-900/30 text-sm text-zinc-400">
            <strong className="text-white block mb-1">Language Choice</strong>
            Switch between JavaScript and 100% Type-Safe TypeScript.
          </li>
          <li className="p-4 rounded-xl border border-white/5 bg-zinc-900/30 text-sm text-zinc-400">
            <strong className="text-white block mb-1">Feature Flags</strong>
            Enable logging, validation, and dashboard on the fly.
          </li>
          <li className="p-4 rounded-xl border border-white/5 bg-zinc-900/30 text-sm text-zinc-400">
            <strong className="text-white block mb-1">Auto-Git</strong>
            Optionally initialize a Git repository automatically.
          </li>
        </ul>
      </section>

      <section id="scripts" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Standard Scripts</h2>
        <p className="text-zinc-400">
          Once your project is created, the following scripts are available in your <code className="text-white">package.json</code>:
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <Terminal size={18} className="text-zinc-500" />
              <code className="text-sm font-bold">npm run dev</code>
            </div>
            <span className="text-xs text-zinc-500">Starts server with Hot Reloading</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <Terminal size={18} className="text-zinc-500" />
              <code className="text-sm font-bold">npm run build</code>
            </div>
            <span className="text-xs text-zinc-500">Compiles TypeScript to JS (if applicable)</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <Terminal size={18} className="text-zinc-500" />
              <code className="text-sm font-bold">npm start</code>
            </div>
            <span className="text-xs text-zinc-500">Starts the production server</span>
          </div>
        </div>
      </section>
    </div>
  );
}
