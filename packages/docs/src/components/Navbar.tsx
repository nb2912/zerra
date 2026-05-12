"use client";

import Link from "next/link";
import Search from "./Search";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";


export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-foreground rounded-md flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(120,120,120,0.2)]">
              <span className="text-background font-black text-lg tracking-tighter">Z</span>
            </div>
            <span className="font-bold text-[15px] tracking-tight text-foreground">Zerra</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
            <Link href="/docs" className="hover:text-foreground transition-colors relative group">
              Docs
              <span className="absolute -bottom-[19px] left-0 w-full h-px bg-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/showcase" className="hover:text-foreground transition-colors">Showcase</Link>
            <Link href="/benchmarks" className="hover:text-foreground transition-colors">Benchmarks</Link>
            <Link href="/compare" className="hover:text-foreground transition-colors">Compare</Link>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden sm:block">
            <Search />
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <a 
              href="https://github.com/nb2912/zerra" 
              target="_blank"
              className="p-2 text-zinc-500 hover:text-foreground transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
            <Link 
              href="/docs/getting-started" 
              className="bg-foreground text-background px-4 py-1.5 rounded-full text-[13px] font-bold hover:opacity-90 transition-all hover:shadow-[0_0_20px_rgba(120,120,120,0.1)] hidden sm:block"
            >
              Install
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 -mr-2 text-zinc-500 hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bg-background border-b border-border p-6 flex flex-col gap-6 shadow-2xl z-50 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-4 text-sm font-medium">
            <Link href="/docs" className="text-zinc-400 hover:text-foreground transition-colors p-2 -mx-2 rounded-lg hover:bg-white/5">Docs</Link>
            <Link href="/showcase" className="text-zinc-400 hover:text-foreground transition-colors p-2 -mx-2 rounded-lg hover:bg-white/5">Showcase</Link>
            <Link href="/benchmarks" className="text-zinc-400 hover:text-foreground transition-colors p-2 -mx-2 rounded-lg hover:bg-white/5">Benchmarks</Link>
            <Link href="/compare" className="text-zinc-400 hover:text-foreground transition-colors p-2 -mx-2 rounded-lg hover:bg-white/5">Compare</Link>
            <Link href="/docs/getting-started" className="text-zinc-400 hover:text-foreground transition-colors p-2 -mx-2 rounded-lg hover:bg-white/5">Install</Link>
          </div>
          
          <div className="sm:hidden pt-4 border-t border-border">
            <Search />
          </div>
        </div>
      )}
    </nav>
  );
}
