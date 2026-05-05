export function Step({ children, number, title }: { children: React.ReactNode, number: number, title: string }) {
  return (
    <div className="relative pl-12 pb-12 last:pb-0">
      {/* Line */}
      <div className="absolute left-[19px] top-[34px] bottom-0 w-px bg-white/5 last:hidden" />
      
      {/* Circle */}
      <div className="absolute left-0 top-0 w-10 h-10 rounded-full border border-white/10 bg-zinc-900 flex items-center justify-center text-sm font-black text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        {number}
      </div>
      
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
        <div className="text-zinc-400 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Steps({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-12 flex flex-col">
      {children}
    </div>
  );
}
