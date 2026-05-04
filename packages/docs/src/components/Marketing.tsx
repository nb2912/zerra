export function Stats({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 group">
      <span className="text-3xl md:text-5xl font-extrabold tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-500">
        {value}
      </span>
      <span className="text-[12px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

export function FeatureCard({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) {
  return (
    <div className="relative group p-8 rounded-2xl border border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all duration-300 overflow-hidden">
      {/* Hover Glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl -z-10" />
      
      {icon && <div className="text-zinc-500 group-hover:text-white transition-colors mb-4">{icon}</div>}
      <h3 className="text-xl font-bold mb-3 text-zinc-200 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-zinc-400 leading-relaxed text-[15px]">{description}</p>
      
      <div className="mt-6 flex items-center gap-2 text-xs font-bold text-zinc-500 group-hover:text-white transition-colors">
        Learn more 
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="translate-y-px group-hover:translate-x-1 transition-transform">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </div>
  );
}
