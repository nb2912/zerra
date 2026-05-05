export function Stats({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-2 group">
      <span className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent group-hover:to-foreground transition-all duration-500">
        {value}
      </span>
      <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.25em]">{label}</span>
    </div>
  );
}

export function FeatureCard({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) {
  return (
    <div className="relative group p-8 rounded-3xl border border-border bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all duration-500 overflow-hidden shadow-lg shadow-black/5">
      {/* Hover Glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl -z-10" />
      
      {icon && <div className="text-zinc-500 group-hover:text-foreground transition-colors mb-6">{icon}</div>}
      <h3 className="text-2xl font-bold mb-3 text-foreground tracking-tight">{title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-[15px]">{description}</p>
      
      <div className="mt-8 flex items-center gap-2 text-xs font-bold text-zinc-500 group-hover:text-foreground transition-colors">
        Learn more 
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="translate-y-px group-hover:translate-x-1 transition-transform">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  );
}
