import { AlertCircle, Terminal } from "lucide-react";

export default function ErrorsDocs() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Concepts</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Error Handling</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Zerra features a robust, standardized error handling system out of the box, eliminating the need for repetitive try/catch blocks.
        </p>
      </div>

      <div className="h-px bg-white/5 w-full my-4" />

      <section id="the-zerra-error-class" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">The ZerraError Class</h2>
        <p className="text-zinc-400">
          The <code className="text-white">ZerraError</code> class allows you to throw HTTP errors directly from your route handlers. The framework catches these errors globally and formats them into a clean JSON response.
        </p>

        <div className="bg-zinc-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-xs text-zinc-400 font-mono">
            api/users/[id].js
          </div>
          <div className="p-6">
            <pre className="text-sm font-mono text-zinc-300">
{`import { ZerraError } from 'zerra';

export default async function getUser(req, res) {
  const user = await db.findUser(req.params.id);

  if (!user) {
    throw ZerraError.NotFound("User does not exist");
  }

  res.json({ user });
}`}
            </pre>
          </div>
        </div>
      </section>

      <section id="available-methods" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Available Methods</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
            <h4 className="font-bold mb-2">ZerraError.BadRequest()</h4>
            <p className="text-sm text-zinc-400">Returns a 400 Bad Request status. Used for invalid input.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
            <h4 className="font-bold mb-2">ZerraError.Unauthorized()</h4>
            <p className="text-sm text-zinc-400">Returns a 401 Unauthorized status. Used for unauthenticated requests.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
            <h4 className="font-bold mb-2">ZerraError.Forbidden()</h4>
            <p className="text-sm text-zinc-400">Returns a 403 Forbidden status. Used when access is denied.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
            <h4 className="font-bold mb-2">ZerraError.NotFound()</h4>
            <p className="text-sm text-zinc-400">Returns a 404 Not Found status. Used for missing resources.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
