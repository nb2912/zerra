

export default function RoutingDocs() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Concepts</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Routing</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Zerra uses a file-based router inspired by modern frontend frameworks. Your API structure is defined by your directory structure.
        </p>
      </div>

      <div className="h-px bg-white/5 w-full my-4" />

      <section id="basics" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">The Basics</h2>
        <p className="text-zinc-400">
          Any file created inside the <code className="text-white bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">/api</code> directory automatically becomes an endpoint. 
          Zerra supports nested folders and index files.
        </p>

        <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">File Path</div>
            <div className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Route</div>
            
            <div className="font-mono text-zinc-300">api/index.js</div>
            <div className="font-mono text-white">GET /</div>
            
            <div className="font-mono text-zinc-300">api/users.js</div>
            <div className="font-mono text-white">GET /users</div>
            
            <div className="font-mono text-zinc-300">api/posts/index.js</div>
            <div className="font-mono text-white">GET /posts</div>
            
            <div className="font-mono text-zinc-300">api/v1/auth/login.js</div>
            <div className="font-mono text-white">GET /v1/auth/login</div>
          </div>
        </div>
      </section>

      <section id="dynamic-routes" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Dynamic Routes</h2>
        <p className="text-zinc-400">
          To handle dynamic parameters, use square brackets in your filename. These parameters are automatically parsed and available in <code className="text-white">req.params</code>.
        </p>

        <div className="bg-zinc-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-xs text-zinc-400 font-mono">
            api/users/[id].js
          </div>
          <div className="p-6">
            <pre className="text-sm font-mono text-zinc-300">
{`export default async function handler(req, res) {
  const { id } = req.params;
  
  res.json({
    message: \`Fetching user with ID: \${id}\`
  });
}`}
            </pre>
          </div>
        </div>
      </section>

      <section id="methods" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Handling Methods</h2>
        <p className="text-zinc-400">
          By default, a handler responds to <code className="text-white">GET</code> requests. To handle other methods, you can check <code className="text-white">req.method</code>.
        </p>

        <div className="bg-zinc-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-xs text-zinc-400 font-mono">
            api/posts.js
          </div>
          <div className="p-6">
            <pre className="text-sm font-mono text-zinc-300">
{`export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle creation
    return res.status(201).json(req.body);
  }

  // Handle list
  res.json([]);
}`}
            </pre>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors cursor-pointer group">
          <h4 className="font-bold mb-2 group-hover:text-white transition-colors">Middleware</h4>
          <p className="text-sm text-zinc-400">Learn how to intercept requests before they reach your handler.</p>
          <div className="mt-4 text-zinc-300 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Read Middleware Docs →
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors cursor-pointer group">
          <h4 className="font-bold mb-2 group-hover:text-white transition-colors">Validation</h4>
          <p className="text-sm text-zinc-400">Add Zod or Joi schemas to your routes for type-safety.</p>
          <div className="mt-4 text-zinc-300 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Schema Validation →
          </div>
        </div>
      </div>
    </div>
  );
}
