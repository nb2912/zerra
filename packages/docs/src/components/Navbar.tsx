"use client";

import Link from "next/link";
import { Code } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-black font-bold text-xl">Z</span>
            </div>
            <span className="font-bold text-xl tracking-tighter">Zerra</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-[14px] font-medium text-zinc-400">
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/showcase" className="hover:text-white transition-colors">Showcase</Link>
            <Link href="/benchmarks" className="hover:text-white transition-colors">Benchmarks</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-500 text-sm cursor-pointer hover:border-white/20 transition-colors">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>Search...</span>
            <kbd className="ml-4 text-[10px] font-sans opacity-50">⌘K</kbd>
          </div>

          <Link 
            href="/docs/getting-started" 
            className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
