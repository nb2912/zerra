export default function SwaggerDocs() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Concepts</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Auto-Generated API Docs</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Zerra automatically generates interactive Swagger/OpenAPI documentation for your entire application with zero extra configuration.
        </p>
      </div>

      <div className="h-px bg-white/5 w-full my-4" />

      <section id="how-it-works" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">How It Works</h2>
        <p className="text-zinc-400">
          Zerra crawls your <code className="text-white">/api</code> directory and inspects your file-based routes and exported schemas. It then builds a full OpenAPI specification on the fly and hosts it at <code className="text-white">/__zerra/docs</code>.
        </p>

        <div className="bg-zinc-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-xs text-zinc-400 font-mono">
            api/products.js
          </div>
          <div className="p-6">
            <pre className="text-sm font-mono text-zinc-300">
{`export const POST = async (req, res) => {
  res.json({ success: true });
};

// Zerra uses this schema to generate the Swagger request body!
export const schema = {
  name: 'string',
  price: 'number',
  inStock: 'boolean'
};`}
            </pre>
          </div>
        </div>
      </section>

      <section id="accessing-docs" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Accessing Your Docs</h2>
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
          <p className="text-zinc-400 mb-4">
            Simply navigate to your developer console endpoint in the browser while running your app in development mode:
          </p>
          <code className="bg-black border border-white/10 px-4 py-2 rounded text-emerald-400 font-mono">
            http://localhost:3000/__zerra/docs
          </code>
        </div>
      </section>
    </div>
  );
}
