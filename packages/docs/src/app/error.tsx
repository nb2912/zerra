"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative min-h-screen overflow-hidden text-foreground flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatedBackground />
      </div>
      <div className="relative z-20">
        <Navbar />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 text-center -mt-20">
        <h1 className="text-6xl md:text-[80px] font-extrabold tracking-tighter leading-none mb-4 text-foreground animate-in slide-in-from-bottom-8 fade-in duration-1000">
          500
        </h1>
        <div className="h-px w-24 bg-red-900/50 my-8 animate-in fade-in duration-1000 delay-150 fill-mode-both" />
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300 fill-mode-both">
          Something went wrong
        </h2>
        <p className="text-zinc-400 mb-10 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-500 fill-mode-both">
          An unexpected error occurred while trying to process your request.
        </p>
        
        <div className="flex gap-4 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-700 fill-mode-both">
          <button 
            onClick={() => reset()}
            className="bg-foreground text-background px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.05)]"
          >
            Try Again
          </button>
          <Link 
            href="/" 
            className="bg-transparent border border-zinc-800 text-foreground px-6 py-3 rounded-lg font-medium hover:bg-zinc-900 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
