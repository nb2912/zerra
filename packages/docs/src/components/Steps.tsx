export function Step({ children, number, title }: { children: React.ReactNode, number: number, title: string }) {
  return (
    <div className="relative pl-12 pb-12 last:pb-0">
      {/* Line */}
      <div className="absolute left-[19px] top-[34px] bottom-0 w-px bg-border last:hidden" />
      
      {/* Circle */}
      <div className="absolute left-0 top-0 w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center text-sm font-black text-foreground shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        {number}
      </div>
      
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-foreground tracking-tight">{title}</h3>
        <div className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

interface StepsProps {
  children?: React.ReactNode;
  items?: { title: string; content: React.ReactNode }[];
}

export default function Steps({ children, items }: StepsProps) {
  return (
    <div className="my-12 flex flex-col">
      {items ? (
        items.map((item, index) => (
          <Step key={index} number={index + 1} title={item.title}>
            {item.content}
          </Step>
        ))
      ) : (
        children
      )}
    </div>
  );
}
