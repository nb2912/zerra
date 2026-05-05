"use client";

import { useState, useEffect, useCallback } from "react";
import { Search as SearchIcon, FileText, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const DOCS_NAV = [
  { title: "Introduction", href: "/docs", description: "Learn about Zerra's core philosophy and features." },
  { title: "Getting Started", href: "/docs/getting-started", description: "Scaffold your first project in seconds." },
  { title: "Project Structure", href: "/docs/structure", description: "Understand the folder layout of a Zerra app." },
  { title: "Routing", href: "/docs/routing", description: "Master file-based and dynamic routing." },
  { title: "Middleware", href: "/docs/middleware", description: "Protect and intercept your API requests." },
  { title: "Validation", href: "/docs/validation", description: "Automatic schema-based input validation." },
  { title: "Authentication", href: "/docs/auth", description: "Set up JWT and session-based auth." },
  { title: "CLI API", href: "/docs/cli", description: "Reference for all create-zerra-app commands." },
  { title: "Zerra Config", href: "/docs/config", description: "Tweak and tune your runtime engine." },
  { title: "Plugins", href: "/docs/plugins", description: "Extend Zerra with custom global middleware." },
];

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [os, setOs] = useState<"mac" | "win">("mac");
  const router = useRouter();

  useEffect(() => {
    const isMac = navigator.userAgent.toLowerCase().includes("mac");
    setOs(isMac ? "mac" : "win");

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredItems = query === "" 
    ? [] 
    : DOCS_NAV.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);

  const handleSelect = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex-1 max-w-sm bg-foreground/5 border border-border rounded-lg py-1.5 pl-3 pr-2 text-sm text-zinc-500 hover:text-foreground hover:border-foreground/20 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <SearchIcon size={14} className="group-hover:text-foreground transition-colors" />
          <span>Search documentation</span>
        </div>
        <kbd className="text-[10px] bg-foreground/10 text-zinc-500 px-1.5 py-0.5 rounded border border-border font-sans">
          {os === "mac" ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <SearchIcon size={18} className="text-zinc-500" />
              <input 
                autoFocus
                type="text" 
                placeholder="What are you looking for?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-zinc-600 text-base"
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[10px] bg-foreground/10 text-zinc-500 px-2 py-1 rounded border border-border uppercase font-bold tracking-widest hover:text-foreground transition-colors"
              >
                Esc
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2">
              {filteredItems.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {filteredItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleSelect(item.href)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-foreground/5 text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-foreground/10 flex items-center justify-center text-zinc-500 group-hover:text-foreground transition-colors">
                          <FileText size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-foreground">{item.title}</div>
                          <div className="text-[11px] text-zinc-500 line-clamp-1 group-hover:text-zinc-400 transition-colors">{item.description}</div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-400 dark:text-zinc-700 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              ) : query !== "" ? (
                <div className="p-8 text-center text-zinc-500 italic text-sm">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-600 text-sm">
                  Start typing to search...
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border bg-foreground/5 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-foreground/10 border border-border text-zinc-400">↵</span> Select</span>
                <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 rounded bg-foreground/10 border border-border text-zinc-400">↑↓</span> Navigate</span>
              </div>
              <div>Search by Zerra</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
