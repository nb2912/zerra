import Navbar from "@/components/Navbar";
import { ArrowRight, Zap, Shield, Layout, Globe, Cpu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const SHOWCASE_ITEMS = [
  {
    title: "NexFlow API",
    description: "A high-performance real-time data streaming platform built entirely on Zerra. Handling 50k+ requests/sec with sub-5ms latency.",
    category: "Real-time",
    tags: ["WebSockets", "PostgreSQL", "Redis"],
    image: "/showcase-1.png"
  },
  {
    title: "Lumina SaaS",
    description: "Multi-tenant B2B dashboard with complex authentication and dynamic routing for enterprise clients.",
    category: "Enterprise",
    tags: ["Auth", "Dynamic Routes", "Multi-tenancy"],
    image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "EcoStore Backend",
    description: "Headless e-commerce engine focusing on lightning-fast product discovery and secure checkout flows.",
    category: "E-commerce",
    tags: ["Multipart", "Validation", "Payments"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop"
  }
];

export default function Showcase() {
  return (
    <main className="min-h-screen pt-32 pb-20 overflow-x-hidden selection:bg-white/10 selection:text-white">
      <Navbar />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-white/[0.02] blur-[120px] rounded-full -z-10" />

      <section className="max-w-7xl mx-auto px-4 mb-24">
        <div className="flex flex-col gap-4 mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Built with Zerra.
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Discover how developers are using Zerra to build the next generation of high-performance web applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SHOWCASE_ITEMS.map((item) => (
            <div key={item.title} className="group relative flex flex-col rounded-3xl border border-white/5 bg-zinc-900/20 overflow-hidden hover:border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5">
              <div className="aspect-[16/10] relative overflow-hidden bg-zinc-800">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-1">
                  {item.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-[10px] text-zinc-500 font-mono">#{tag}</span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 group-hover:text-white transition-colors">
                  View Case Study
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4">
        <div className="p-12 rounded-[40px] border border-white/5 bg-gradient-to-b from-zinc-900/50 to-transparent text-center">
          <h2 className="text-3xl font-bold mb-4">Building something great?</h2>
          <p className="text-zinc-400 mb-8">We'd love to feature your Zerra project in our showcase.</p>
          <a 
            href="https://github.com/nb2912/zerra/discussions" 
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-all hover:scale-105"
          >
            Submit your Project
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-48 pb-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 pt-16 text-zinc-500 text-sm">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">Z</span>
            </div>
            <span className="font-bold text-white tracking-tighter">Zerra</span>
        </div>
        <p>© 2026 Zerra Framework. MIT Licensed.</p>
        <div className="flex items-center gap-8 font-medium">
           <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
           <a href="https://github.com/nb2912/zerra" target="_blank" className="hover:text-white transition-colors">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
