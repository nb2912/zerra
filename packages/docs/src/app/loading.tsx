import React from "react";
import Skeleton from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6">
      <div className="relative w-24 h-24 mb-8">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-2 border-foreground/5 rounded-2xl" />
        {/* Animated Loading Element */}
        <div className="absolute inset-0 border-2 border-t-foreground border-r-transparent border-b-transparent border-l-transparent rounded-2xl animate-spin" />
        {/* Center Logo/Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <span className="text-background font-black text-lg tracking-tighter">Z</span>
            </div>
        </div>
      </div>
      
      {/* Skeleton-like Text */}
      <div className="space-y-4 w-full max-w-xs">
        <Skeleton className="h-2 w-3/4 mx-auto rounded-full" />
        <Skeleton className="h-2 w-1/2 mx-auto rounded-full" />
      </div>
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-foreground/5 blur-[80px] rounded-full -z-10" />
    </div>
  );
}
