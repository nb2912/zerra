import { Key, ShieldCheck } from "lucide-react";

export default function AuthenticationDocs() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Concepts</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Authentication</h1>
        <p className="text-xl text-zinc-400 leading-relaxed">
          Secure your Zerra application using industry-standard authentication strategies. Zerra is built to work seamlessly with JWT, Sessions, and Passport.
        </p>
      </div>

      <div className="h-px bg-white/5 w-full my-4" />

      <section id="middleware-auth" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">The Middleware Pattern</h2>
        <p className="text-zinc-400">
          The most common way to handle authentication in Zerra is through the **Middleware Pattern**. By placing an <code className="text-white">_middleware.js</code> file in a directory, you can protect every route inside it.
        </p>

        <div className="bg-zinc-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="bg-white/5 px-4 py-2 border-b border-white/5 text-xs text-zinc-400 font-mono">
            api/protected/_middleware.js
          </div>
          <div className="p-6">
            <pre className="text-sm font-mono text-zinc-300">
{`import { verifyToken } from '../../services/auth';

export default async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Attach user info to req object for handlers
  req.user = verifyToken(token);
  
  await next();
}`}
            </pre>
          </div>
        </div>
      </section>

      <section id="strategies" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Recommended Strategies</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
            <Key className="text-zinc-500 mb-4" size={24} />
            <h4 className="font-bold mb-2">JWT (JSON Web Tokens)</h4>
            <p className="text-sm text-zinc-400">Perfect for stateless APIs. Fast, scalable, and easy to implement with the <code className="text-white">jsonwebtoken</code> package.</p>
          </div>
          <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
            <ShieldCheck className="text-zinc-500 mb-4" size={24} />
            <h4 className="font-bold mb-2">API Keys</h4>
            <p className="text-sm text-zinc-400">Simple and effective for service-to-service communication or public API access.</p>
          </div>
        </div>
      </section>

      <section id="plugins" className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Auth via Plugins</h2>
        <p className="text-zinc-400">
          For more complex authentication (like OAuth or Passport), you can register an **Auth Plugin** in your <code className="text-white">zerra.config.js</code>. This allows you to decorate the <code className="text-white">req</code> object globally.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors cursor-pointer group">
          <h4 className="font-bold mb-2 group-hover:text-white transition-colors">Plugins</h4>
          <p className="text-sm text-zinc-400">Learn how to extend Zerra with custom plugins.</p>
          <div className="mt-4 text-zinc-300 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Read Plugins Docs →
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors cursor-pointer group">
          <h4 className="font-bold mb-2 group-hover:text-white transition-colors">CLI Reference</h4>
          <p className="text-sm text-zinc-400">Commands for managing your Zerra app.</p>
          <div className="mt-4 text-zinc-300 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            CLI API →
          </div>
        </div>
      </div>
    </div>
  );
}
