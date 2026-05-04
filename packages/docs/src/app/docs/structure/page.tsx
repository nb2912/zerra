import { Folder, File, ChevronRight } from "lucide-react";

export default function ProjectStructure() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Framework</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Project Structure</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Zerra projects are organized by convention. This structure ensures that your code remains modular, testable, and easy to navigate as your API grows.
        </p>
      </div>

      <div className="h-px bg-white/5 w-full my-4" />

      <section id="overview" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Directory Overview</h2>
        <p className="text-zinc-400">
          When you scaffold a new project using <code className="text-white">create-zerra-app</code>, the following structure is generated:
        </p>

        <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-8 font-mono text-sm leading-relaxed">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-white">
              <Folder size={18} className="text-zinc-500" /> my-app
            </div>
            <div className="flex flex-col gap-2 ml-6 border-l border-white/10 pl-6">
              <div className="flex items-center gap-3 text-white">
                <Folder size={18} className="text-blue-400/80" /> api
                <span className="text-zinc-500 text-[11px] uppercase tracking-wider ml-2 font-sans font-bold">Routes & Handlers</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Folder size={18} className="text-purple-400/80" /> services
                <span className="text-zinc-500 text-[11px] uppercase tracking-wider ml-2 font-sans font-bold">Business Logic</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Folder size={18} className="text-green-400/80" /> plugins
                <span className="text-zinc-500 text-[11px] uppercase tracking-wider ml-2 font-sans font-bold">Extensions</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <File size={18} className="text-zinc-600" /> zerra.config.js
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <File size={18} className="text-zinc-600" /> package.json
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <File size={18} className="text-zinc-600" /> .env
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="api" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">The /api directory</h2>
        <p className="text-zinc-400 leading-relaxed">
          This is where your routes live. Every file in this directory is mapped to a URL path. Zerra automatically discovers these files and registers them as endpoints.
        </p>
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-4">
          <div className="shrink-0 mt-1">
            <ChevronRight size={16} className="text-blue-400" />
          </div>
          <p className="text-sm text-blue-100/80">
            Files prefixed with an underscore (e.g., <code className="text-white">_middleware.js</code>) are excluded from routing but used for logic.
          </p>
        </div>
      </section>

      <section id="services" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">The /services directory</h2>
        <p className="text-zinc-400 leading-relaxed">
          Services are shared logic layers like Database clients, Mailers, or external API wrappers. By colocating them in <code className="text-white">/services</code>, you can easily import them into any route handler.
        </p>
      </section>

      <section id="plugins" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">The /plugins directory</h2>
        <p className="text-zinc-400 leading-relaxed">
          Plugins allow you to extend the Zerra core. This is where you register global middleware, authentication strategies (like Passport or JWT), and custom error handlers.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors cursor-pointer group">
          <h4 className="font-bold mb-2 group-hover:text-white transition-colors">Configuration</h4>
          <p className="text-sm text-zinc-400">Customize your runtime with zerra.config.js.</p>
          <div className="mt-4 text-zinc-300 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View Config Options →
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors cursor-pointer group">
          <h4 className="font-bold mb-2 group-hover:text-white transition-colors">CLI API</h4>
          <p className="text-sm text-zinc-400">Master the Zerra command-line tools.</p>
          <div className="mt-4 text-zinc-300 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            CLI Reference →
          </div>
        </div>
      </div>
    </div>
  );
}
