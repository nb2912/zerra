import { ToggleLeft, Layers } from "lucide-react";

export default function ConfigDocs() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Reference</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Zerra Config</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          The <code className="text-white">zerra.config.json</code> file is the brain of your application. Use it to toggle core features and register plugins.
        </p>
      </div>

      <div className="h-px bg-white/5 w-full my-4" />

      <section id="structure" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Configuration Structure</h2>
        <p className="text-zinc-400">
          The configuration file lives at the root of your project. It consists of two main blocks: <code className="text-white">features</code> and <code className="text-white">plugins</code>.
        </p>

        <div className="bg-zinc-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="p-6">
            <pre className="text-sm font-mono text-zinc-300">
{`{
  "features": {
    "logging": true,
    "validation": true,
    "dashboard": true,
    "dynamicRouting": true,
    "middleware": true,
    "dotenv": true,
    "multipart": true,
    "errors": true
  },
  "plugins": [
    "./plugins/auth.js"
  ]
}`}
            </pre>
          </div>
        </div>
      </section>

      <section id="features" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><ToggleLeft size={24} className="text-zinc-500" /> Feature Flags</h2>
        <div className="grid gap-4">
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50 flex justify-between items-center">
            <div>
              <code className="text-sm font-bold text-white">logging</code>
              <p className="text-xs text-zinc-500 mt-1">Enables beautiful request logging in the terminal.</p>
            </div>
            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 font-bold">DEFAULT: TRUE</span>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50 flex justify-between items-center">
            <div>
              <code className="text-sm font-bold text-white">dashboard</code>
              <p className="text-xs text-zinc-500 mt-1">Enables the Dev Console at /__zerra.</p>
            </div>
            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 font-bold">DEFAULT: TRUE</span>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/50 flex justify-between items-center">
            <div>
              <code className="text-sm font-bold text-white">validation</code>
              <p className="text-xs text-zinc-500 mt-1">Toggles built-in schema validation logic.</p>
            </div>
            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 font-bold">DEFAULT: TRUE</span>
          </div>
        </div>
      </section>

      <section id="plugins" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Layers size={24} className="text-zinc-500" /> Plugins Array</h2>
        <p className="text-zinc-400">
          Plugins are loaded relative to the project root. They can be local files or installed npm packages.
        </p>
      </section>
    </div>
  );
}
