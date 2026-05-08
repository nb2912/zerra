import { Shield, Zap } from "lucide-react";

export default function MiddlewareDocs() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Concepts</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Middleware</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Middleware allows you to run code before a request is handled by your route. Use it for authentication, logging, or transforming requests.
        </p>
      </div>

      <div className="h-px bg-white/5 w-full my-4" />

      <section id="basics" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">The _middleware file</h2>
        <p className="text-zinc-400">
          In Zerra, middleware is defined by creating a file named <code className="text-white bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">_middleware.js</code> (or <code className="text-white">.ts</code>) inside any directory within the <code className="text-white">/api</code> folder.
        </p>

        <div className="bg-zinc-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-xs text-zinc-400 font-mono">
            api/admin/_middleware.js
          </div>
          <div className="p-6">
            <pre className="text-sm font-mono text-zinc-300">
{`export default async function middleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // If everything is fine, call next()
  await next();
}`}
            </pre>
          </div>
        </div>
      </section>

      <section id="cascading" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Recursive Execution</h2>
        <p className="text-zinc-400">
          Zerra&apos;s middleware system is **top-down and recursive**. If you have a middleware in <code className="text-white">/api/_middleware.js</code> and another in <code className="text-white">/api/users/_middleware.js</code>, both will run in order when accessing a user route.
        </p>
        
        <div className="p-6 rounded-2xl border border-blue-500/10 bg-blue-500/5 text-sm text-blue-100/70">
          <strong>Order of execution:</strong> Root Middleware → Sub-directory Middleware → Route Handler.
        </div>
      </section>

      <section id="usage-examples" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Common Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/30">
            <h4 className="font-bold mb-2 flex items-center gap-2"><Shield size={16} /> Auth Guard</h4>
            <p className="text-xs text-zinc-500">Protect entire directory branches with a single middleware file.</p>
          </div>
          <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/30">
            <h4 className="font-bold mb-2 flex items-center gap-2"><Zap size={16} /> Performance</h4>
            <p className="text-xs text-zinc-500">Attach timing headers or cache identifiers to the request object.</p>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors cursor-pointer group">
          <h4 className="font-bold mb-2 group-hover:text-white transition-colors">Validation</h4>
          <p className="text-sm text-zinc-400">Enforce data integrity with built-in schemas.</p>
          <div className="mt-4 text-zinc-300 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Read Validation Docs →
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors cursor-pointer group">
          <h4 className="font-bold mb-2 group-hover:text-white transition-colors">Authentication</h4>
          <p className="text-sm text-zinc-400">Implement JWT or Session based auth.</p>
          <div className="mt-4 text-zinc-300 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Auth Strategies →
          </div>
        </div>
      </div>
    </div>
  );
}
