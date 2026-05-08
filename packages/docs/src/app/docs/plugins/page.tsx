import { Puzzle, Box, Sparkles } from "lucide-react";

export default function PluginsDocs() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Reference</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Plugins</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          The plugin system allows you to extend the Zerra core with custom logic, decorators, and global middleware.
        </p>
      </div>

      <div className="h-px bg-white/5 w-full my-4" />

      <section id="structure" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">What is a Plugin?</h2>
        <p className="text-zinc-400">
          A Zerra plugin is a simple JavaScript function that receives the <code className="text-white">zerra</code> instance. You can use this instance to add global middleware or &quot;decorate&quot; the request/response objects.
        </p>

        <div className="bg-zinc-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-xs text-zinc-400 font-mono">
            plugins/my-plugin.js
          </div>
          <div className="p-6">
            <pre className="text-sm font-mono text-zinc-300">
{`export default function myPlugin(zerra) {
  // 1. Add global middleware
  zerra.use((req, res, next) => {
    console.log('Global middleware triggered');
    next();
  });

  // 2. Decorate response object
  zerra.decorate('res', 'success', function(data) {
    this.status(200).json({ status: 'success', data });
  });
}`}
            </pre>
          </div>
        </div>
      </section>

      <section id="api" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Plugin API</h2>
        <div className="grid gap-6">
          <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
            <h4 className="font-bold mb-3 flex items-center gap-2 text-white"><Box size={18} /> zerra.use(fn)</h4>
            <p className="text-sm text-zinc-400">Registers a global middleware that runs on <strong>every</strong> request, before any file-based middleware.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
            <h4 className="font-bold mb-3 flex items-center gap-2 text-white"><Sparkles size={18} /> zerra.decorate(target, name, fn)</h4>
            <p className="text-sm text-zinc-400 mb-4">Adds custom methods to <code className="text-white">req</code> or <code className="text-white">res</code>.</p>
            <ul className="text-xs text-zinc-500 list-disc pl-4 flex flex-col gap-2">
              <li><code className="text-zinc-300">target</code>: &apos;req&apos; or &apos;res&apos;</li>
              <li><code className="text-zinc-300">name</code>: The method name (e.g. &apos;json&apos;)</li>
              <li><code className="text-zinc-300">fn</code>: The function implementation</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="p-6 rounded-2xl border border-blue-500/10 bg-blue-500/5 mt-12">
        <h4 className="font-bold mb-2 flex items-center gap-2"><Puzzle size={18} /> Community Plugins</h4>
        <p className="text-sm text-blue-100/70 leading-relaxed">
          The Zerra community is building plugins for Database connections (Prisma), Authentication (Auth.js), and much more. Stay tuned!
        </p>
      </div>
    </div>
  );
}
