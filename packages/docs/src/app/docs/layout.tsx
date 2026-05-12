"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ExternalLink, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const DOCS_NAV = [
  {
    title: "Framework",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Getting Started", href: "/docs/getting-started" },
      { title: "Project Structure", href: "/docs/structure" },
    ],
  },
  {
    title: "Concepts",
    items: [
      { title: "Routing", href: "/docs/routing" },
      { title: "Middleware", href: "/docs/middleware" },
      { title: "Validation", href: "/docs/validation" },
      { title: "Authentication", href: "/docs/auth" },
    ],
  },
  {
    title: "Reference",
    items: [
      { title: "CLI API", href: "/docs/cli" },
      { title: "Zerra Config", href: "/docs/config" },
      { title: "Plugins", href: "/docs/plugins" },
    ],
  },
];

import Search from "@/components/Search";
import HelpfulFeedback from "@/components/HelpfulFeedback";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const article = document.querySelector('article');
    if (!article) return;

    const elements = Array.from(article.querySelectorAll('h2, h3'));
    const discoveredHeadings = elements.map((el) => {
      const text = el.textContent || "";
      let id = el.id;
      
      // Auto-generate ID if missing
      if (!id) {
        id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        el.id = id;
      }
      
      return {
        id,
        text,
        level: parseInt(el.tagName.replace('H', ''))
      };
    });

    setHeadings(discoveredHeadings);

    // Intersection Observer for highlighting active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66%' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname, children]);

  return (
    <div className="min-h-screen bg-background selection:bg-foreground/10">
      <Navbar />
      <div className="max-w-[1440px] mx-auto px-6 pt-24 flex gap-12 text-foreground">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-background border-r border-border p-6 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:border-none lg:p-0 lg:bg-transparent lg:block lg:w-64 lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24 lg:pb-12 lg:shrink-0 overflow-y-auto scrollbar-hide ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between lg:hidden mb-8">
            <Link href="/" className="font-bold text-[15px] tracking-tight">Zerra</Link>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-zinc-500 hover:text-foreground">
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col gap-10">
            <Search />

            {DOCS_NAV.map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                <h4 className="text-[12px] font-bold text-foreground/50 uppercase tracking-[0.15em] ml-1">{section.title}</h4>
                <div className="flex flex-col gap-1 border-l border-border">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`text-[14px] py-1.5 px-4 transition-all relative flex items-center gap-2 -ml-px border-l ${
                          isActive 
                            ? "text-foreground font-semibold border-foreground" 
                            : "text-zinc-500 dark:text-zinc-400 hover:text-foreground border-transparent hover:border-border"
                        }`}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-4 mt-4 pt-8 border-t border-border">
              <h4 className="text-[12px] font-bold text-foreground/50 uppercase tracking-[0.15em] ml-1">Community</h4>
              <a href="https://github.com/nb2912/zerra" target="_blank" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-foreground flex items-center gap-2 px-1">
                GitHub <ExternalLink size={14} className="opacity-50" />
              </a>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 pb-24">
          <div className="max-w-[800px] mx-auto lg:mx-0">
            {/* Breadcrumbs & Mobile Menu Toggle */}
            <div className="flex items-center justify-between mb-10">
              <nav className="flex items-center gap-2 text-[13px] text-zinc-500 font-medium overflow-x-auto whitespace-nowrap scrollbar-hide">
                <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
                <ChevronRight size={14} className="shrink-0 opacity-40" />
                <span className="text-zinc-700 dark:text-zinc-200 truncate">
                  {pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Introduction'}
                </span>
              </nav>
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -mr-2 text-zinc-500 hover:text-foreground flex items-center gap-2 text-sm font-medium"
              >
                <Menu size={16} />
                Menu
              </button>
            </div>

            <article className="prose prose-zinc dark:prose-invert max-w-none prose-pre:bg-foreground/5 prose-pre:border prose-pre:border-border prose-pre:rounded-xl">
              {children}
            </article>

            {/* Pagination */}
            {/* Pagination */}
            <div className="mt-20 pt-10 border-t border-border grid grid-cols-2 gap-4">
              {(() => {
                const flatNav = DOCS_NAV.flatMap(section => section.items);
                const currentIndex = flatNav.findIndex(item => item.href === pathname);
                const prev = currentIndex > 0 ? flatNav[currentIndex - 1] : null;
                const next = currentIndex < flatNav.length - 1 ? flatNav[currentIndex + 1] : null;

                return (
                  <>
                    {prev ? (
                      <Link href={prev.href} className="group p-4 rounded-xl border border-border hover:bg-foreground/5 transition-all flex flex-col gap-2">
                        <span className="text-xs text-zinc-500 group-hover:text-zinc-400">Previous</span>
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-foreground transition-colors">← {prev.title}</span>
                      </Link>
                    ) : <div />}
                    
                    {next ? (
                      <Link href={next.href} className="group p-4 rounded-xl border border-border hover:bg-foreground/5 transition-all flex flex-col gap-2 items-end text-right">
                        <span className="text-xs text-zinc-500 group-hover:text-zinc-400">Next</span>
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-foreground transition-colors">{next.title} →</span>
                      </Link>
                    ) : <div />}
                  </>
                );
              })()}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:block w-64 shrink-0 h-[calc(100vh-6rem)] sticky top-24">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="text-[12px] font-bold text-foreground/50 uppercase tracking-[0.1em]">On this page</h4>
              <nav className="flex flex-col text-[13px] text-zinc-500 dark:text-zinc-400 border-l border-border">
                {headings.length > 0 ? headings.map((h) => (
                  <a 
                    key={h.id}
                    href={`#${h.id}`} 
                    className={`hover:text-foreground transition-colors border-l -ml-px pl-4 py-1.5 ${
                      activeId === h.id 
                        ? "text-foreground border-foreground font-medium" 
                        : "border-transparent hover:border-border"
                    } ${h.level === 3 ? 'ml-3' : ''}`}
                  >
                    {h.text}
                  </a>
                )) : (
                  <span className="pl-4 py-1.5 text-zinc-600 italic">No headings found</span>
                )}
              </nav>
            </div>

            <HelpfulFeedback />
          </div>
        </aside>
      </div>
    </div>
  );
}
