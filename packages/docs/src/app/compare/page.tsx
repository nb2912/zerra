import Navbar from "@/components/Navbar";
import { Check, X, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const COMPARISON_DATA = [
  { feature: "File-based Routing", zerra: true, express: false, fastify: false, nestjs: false },
  { feature: "Built-in Dev Console", zerra: true, express: false, fastify: false, nestjs: false },
  { feature: "Zero-Config Middleware", zerra: true, express: false, fastify: true, nestjs: true },
  { feature: "Auto Schema Validation", zerra: true, express: false, fastify: true, nestjs: true },
  { feature: "Cold Start < 50ms", zerra: true, express: true, fastify: true, nestjs: false },
  { feature: "Built-in CLI Generator", zerra: true, express: false, fastify: true, nestjs: true },
  { feature: "Type-Safe by Default", zerra: true, express: false, fastify: false, nestjs: true },
];

export default function Compare() {
  return (
    <main className="min-h-screen pt-32 pb-20 overflow-x-hidden bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 mb-32 text-center">
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent leading-none">
          Zerra vs. <br /> The World.
        </h1>
        <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
          How does Zerra stack up against the industry giants? We&apos;ve compared every major feature to help you decide.
        </p>
      </section>

      {/* Comparison Table */}
      <section className="max-w-6xl mx-auto px-6 mb-48">
        <div className="rounded-[40px] border border-border bg-foreground/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-foreground/[0.03]">
                  <th className="p-8 text-sm font-bold uppercase tracking-widest text-zinc-500">Feature</th>
                  <th className="p-8 text-center bg-foreground/5">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
                          <span className="text-background font-black text-xs">Z</span>
                       </div>
                       <span className="text-lg font-black text-foreground">Zerra</span>
                    </div>
                  </th>
                  <th className="p-8 text-center text-zinc-500 font-bold">Express</th>
                  <th className="p-8 text-center text-zinc-500 font-bold">Fastify</th>
                  <th className="p-8 text-center text-zinc-500 font-bold">NestJS</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((row) => (
                  <tr key={row.feature} className="border-b border-border/50 hover:bg-foreground/[0.01] transition-colors">
                    <td className="p-8 font-bold text-zinc-400">{row.feature}</td>
                    <td className="p-8 text-center bg-foreground/[0.02]">
                       {row.zerra ? <Check className="mx-auto text-emerald-500" size={24} /> : <X className="mx-auto text-zinc-800" size={24} />}
                    </td>
                    <td className="p-8 text-center">
                       {row.express ? <Check className="mx-auto text-emerald-500/50" size={20} /> : <X className="mx-auto text-zinc-800" size={20} />}
                    </td>
                    <td className="p-8 text-center">
                       {row.fastify ? <Check className="mx-auto text-emerald-500/50" size={20} /> : <X className="mx-auto text-zinc-800" size={20} />}
                    </td>
                    <td className="p-8 text-center">
                       {row.nestjs ? <Check className="mx-auto text-emerald-500/50" size={20} /> : <X className="mx-auto text-zinc-800" size={20} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* DX Showdown */}
      <section className="max-w-6xl mx-auto px-6 mb-48">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">DX Showdown.</h2>
          <p className="text-zinc-500 text-xl">See how Zerra simplifies the most common backend tasks.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Zerra Way */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center">
                  <span className="text-background font-black text-xs">Z</span>
               </div>
               <h3 className="text-2xl font-bold">The Zerra Way</h3>
            </div>
            <div className="rounded-3xl border border-border bg-black p-8 font-mono text-sm leading-relaxed shadow-2xl overflow-hidden">
               <div className="text-zinc-500 mb-4">{"// api/users/[id].js"}</div>
               <div className="text-foreground">
                 <span className="text-purple-400">export default async</span> (req, res) ={">"} {"{"} <br />
                 &nbsp;&nbsp;<span className="text-purple-400">const</span> {"{ id }"} = req.params; <br />
                 &nbsp;&nbsp;res.json({"{"} userId: id {"}"}); <br />
                 {"}"}; <br />
                 <br />
                 <span className="text-purple-400">export const</span> schema = {"{"} <br />
                 &nbsp;&nbsp;id: <span className="text-emerald-400">&apos;string&apos;</span> <br />
                 {"}"};
               </div>
            </div>
            <p className="text-zinc-500 text-sm italic">Routing, params, and validation in 5 lines of code.</p>
          </div>

          {/* Express Way */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center">
                  <span className="text-white font-black text-xs">Ex</span>
               </div>
               <h3 className="text-2xl font-bold text-zinc-400">The Express Way</h3>
            </div>
            <div className="rounded-3xl border border-border bg-black p-8 font-mono text-sm leading-relaxed opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all overflow-hidden">
               <div className="text-zinc-500 mb-4">{"// routes/users.js"}</div>
               <div className="text-foreground">
                 <span className="text-purple-400">const</span> express = require(<span className="text-emerald-400">&apos;express&apos;</span>); <br />
                 <span className="text-purple-400">const</span> router = express.Router(); <br />
                 <span className="text-purple-400">const</span> validate = require(<span className="text-emerald-400">&apos;./middleware/validate&apos;</span>); <br />
                 <br />
                 router.get(<span className="text-emerald-400">&apos;/:id&apos;</span>, validate(idSchema), (req, res) ={">"} {"{"} <br />
                 &nbsp;&nbsp;<span className="text-purple-400">const</span> userId = req.params.id; <br />
                 &nbsp;&nbsp;res.json({"{"} userId {"}"}); <br />
                 {"}"}); <br />
                 <br />
                 module.exports = router;
               </div>
            </div>
            <p className="text-zinc-500 text-sm italic">Requires manual routing, middleware imports, and boilerplates.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 mb-48">
        <div className="p-20 rounded-[64px] bg-foreground text-background text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 text-background/10">
              <Zap size={200} strokeWidth={3} />
           </div>
           
           <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 relative z-10">
             Ready to switch?
           </h2>
           <p className="text-background/60 text-xl mb-12 max-w-2xl mx-auto font-medium relative z-10">
             Join the developers building faster, more reliable APIs with Zerra. 
             Migrating from Express or Fastify takes minutes.
           </p>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
              <Link href="/docs/getting-started" className="bg-background text-foreground px-10 py-5 rounded-full font-black text-lg flex items-center gap-2 hover:scale-105 transition-all">
                Get Started <ArrowRight size={20} />
              </Link>
              <a href="https://github.com/nb2912/zerra" target="_blank" className="border-2 border-background/20 text-background px-10 py-5 rounded-full font-black text-lg hover:bg-background hover:text-foreground transition-all">
                View on GitHub
              </a>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 pb-16 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8 pt-16 text-zinc-500 text-sm">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-background font-black text-sm tracking-tighter">Z</span>
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">Zerra</span>
        </div>
        <p className="font-medium text-zinc-600 italic">© 2026 Zerra Framework. MIT Licensed.</p>
        <div className="flex items-center gap-8 font-semibold">
           <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
           <a href="https://github.com/nb2912/zerra" target="_blank" className="hover:text-foreground transition-colors">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
