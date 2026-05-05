import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "warning" | "success" | "error";

interface CalloutProps {
  children: React.ReactNode;
  type?: CalloutType;
  title?: string;
}

const icons = {
  info: <Info className="text-blue-400" size={18} />,
  warning: <AlertTriangle className="text-amber-400" size={18} />,
  success: <CheckCircle2 className="text-emerald-400" size={18} />,
  error: <XCircle className="text-rose-400" size={18} />,
};

const styles = {
  info: "border-blue-500/20 bg-blue-500/5",
  warning: "border-amber-500/20 bg-amber-500/5",
  success: "border-emerald-500/20 bg-emerald-500/5",
  error: "border-rose-500/20 bg-rose-500/5",
};

export default function Callout({ children, type = "info", title }: CalloutProps) {
  return (
    <div className={cn(
      "my-6 flex gap-4 rounded-xl border p-4 text-sm leading-relaxed",
      styles[type]
    )}>
      <div className="mt-0.5 shrink-0">{icons[type]}</div>
      <div className="flex flex-col gap-1">
        {title && <div className="font-bold text-white">{title}</div>}
        <div className="text-zinc-400">{children}</div>
      </div>
    </div>
  );
}
