import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ValidationDocs() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Concepts</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Validation</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Zerra features a built-in, zero-dependency validation engine. Define your data requirements directly on your route handler.
        </p>
      </div>

      <div className="h-px bg-white/5 w-full my-4" />

      <section id="schema-usage" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Defining a Schema</h2>
        <p className="text-zinc-400">
          To validate incoming request bodies, export a <code className="text-white">schema</code> object alongside your default handler. Zerra will automatically validate the types before your code even runs.
        </p>

        <div className="bg-zinc-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-xs text-zinc-400 font-mono">
            api/users/create.js
          </div>
          <div className="p-6">
            <pre className="text-sm font-mono text-zinc-300">
{`export const schema = {
  name: 'string',
  age: 'number',
  isAdmin: 'boolean'
};

export default async function handler(req, res) {
  // If we're here, req.body is already validated!
  const { name, age } = req.body;
  
  res.json({ success: true });
}`}
            </pre>
          </div>
        </div>
      </section>

      <section id="error-handling" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Error Handling</h2>
        <p className="text-zinc-400">
          If a request fails validation, Zerra automatically returns a <code className="text-white">400 Bad Request</code> with a detailed JSON response explaining which fields were incorrect.
        </p>

        <div className="bg-black/40 border border-red-500/20 rounded-xl p-6 font-mono text-xs text-red-200/80">
{`{
  "error": "Validation Failed",
  "details": [
    "Expected 'age' to be 'number', got 'string'"
  ]
}`}
        </div>
      </section>

      <section id="supported-types" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Supported Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/30 flex items-center gap-3">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-sm font-mono">string</span>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/30 flex items-center gap-3">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-sm font-mono">number</span>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/30 flex items-center gap-3">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-sm font-mono">boolean</span>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/30 flex items-center gap-3">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-sm font-mono">object</span>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/30 flex items-center gap-3">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-sm font-mono">undefined</span>
          </div>
        </div>
      </section>

      <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 mt-12">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle size={20} className="text-zinc-500" />
          <h4 className="font-bold">Pro Tip: Auto-Swagger</h4>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Zerra uses these schemas to automatically generate your API documentation. You don't have to write a single line of Swagger/OpenAPI code.
        </p>
      </div>
    </div>
  );
}
