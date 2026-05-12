import Link from "next/link";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden text-foreground flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatedBackground />
      </div>
      <div className="relative z-20">
        <Navbar />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 text-center -mt-20">
        <h1 className="text-[120px] md:text-[180px] font-extrabold tracking-tighter leading-none mb-2 text-foreground animate-in slide-in-from-bottom-8 fade-in duration-1000">
          404
        </h1>
        <div className="h-px w-24 bg-zinc-800 my-8 animate-in fade-in duration-1000 delay-150 fill-mode-both" />
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300 fill-mode-both">
          Page not found
        </h2>
        <p className="text-zinc-400 mb-10 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-500 fill-mode-both">
          The page you are looking for doesn't exist or has been moved to another route.
        </p>
        
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-700 fill-mode-both">
          <Link 
            href="/" 
            className="bg-foreground text-background px-8 py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.05)]"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
