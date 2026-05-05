import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-foreground/5 border border-border/50",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({ className, lines = 1 }: { className?: string, lines?: number }) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton 
                    key={i} 
                    className={cn(
                        "h-2", 
                        i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"
                    )} 
                />
            ))}
        </div>
    )
}

export function SkeletonCircle({ className }: { className?: string }) {
    return (
        <Skeleton className={cn("rounded-full aspect-square", className)} />
    )
}
