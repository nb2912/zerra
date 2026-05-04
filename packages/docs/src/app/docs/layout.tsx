import Navbar from "@/components/Navbar";
import Link from "next/link";

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

import HelpfulFeedback from "@/components/HelpfulFeedback";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-4 pt-24 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 h-[calc(100vh-6rem)] overflow-y-auto sticky top-24 pb-12 shrink-0 scrollbar-hide">
          <div className="flex flex-col gap-8">
            {/* Search Placeholder */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-white transition-colors">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input 
                type="text" 
                placeholder="Search documentation..." 
                className="w-full bg-zinc-900/50 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:block">
                <kbd className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded border border-white/5 font-sans">⌘K</kbd>
              </div>
            </div>

            {DOCS_NAV.map((section) => (
              <div key={section.title} className="flex flex-col gap-3">
                <h4 className="text-[12px] font-bold text-zinc-500 uppercase tracking-[0.1em]">{section.title}</h4>
                <div className="flex flex-col gap-0.5 border-l border-white/5 ml-0.5 pl-4">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-[14px] text-zinc-400 hover:text-white py-1.5 transition-colors relative group"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 pb-24">
          <div className="max-w-[800px] mx-auto lg:mx-0">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8 font-medium">
              <span>Docs</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              <span className="text-zinc-300">Getting Started</span>
            </nav>

            <article className="prose prose-invert prose-zinc max-w-none">
              {children}
            </article>

            {/* Pagination Placeholder */}
            <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
              <Link href="/docs" className="flex flex-col gap-1 group">
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">Previous</span>
                <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">← Introduction</span>
              </Link>
              <Link href="/docs/routing" className="flex flex-col gap-1 items-end group">
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">Next</span>
                <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors text-right">Routing →</span>
              </Link>
            </div>
          </div>
        </main>

        {/* Right Sidebar (On this page) */}
        <aside className="hidden xl:block w-64 shrink-0 h-[calc(100vh-6rem)] sticky top-24">
          <div className="flex flex-col gap-4">
            <h4 className="text-[12px] font-bold text-white uppercase tracking-wider">On this page</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-zinc-400 mb-8">
              <a href="#installation" className="hover:text-white transition-colors">Installation</a>
              <a href="#scaffolding" className="hover:text-white transition-colors">Scaffolding a project</a>
              <a href="#development" className="hover:text-white transition-colors">Start Developing</a>
              <a href="#next-steps" className="hover:text-white transition-colors">Next Steps</a>
            </nav>

            <HelpfulFeedback />
          </div>
        </aside>
      </div>
    </div>
  );
}
