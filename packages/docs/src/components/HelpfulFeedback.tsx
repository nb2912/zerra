"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function HelpfulFeedback() {
  const [feedback, setFeedback] = useState<null | "yes" | "no">(null);

  if (feedback) {
    return (
      <div className="mt-12 p-6 rounded-xl border border-border bg-foreground/5 animate-in fade-in zoom-in duration-300">
        <p className="text-sm font-medium text-foreground mb-1">Thank you for your feedback!</p>
        <p className="text-xs text-zinc-500">We'll use this to improve the documentation.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 p-6 rounded-xl border border-border bg-foreground/5 transition-all hover:border-foreground/10">
      <h5 className="text-sm font-bold text-foreground mb-4">Was this helpful?</h5>
      <div className="flex gap-3">
        <button 
          onClick={() => setFeedback("yes")}
          className="flex items-center gap-2 text-xs bg-foreground/5 hover:bg-foreground/10 px-4 py-2 rounded-lg transition-all active:scale-95 text-zinc-500 hover:text-foreground"
        >
          <ThumbsUp size={14} /> Yes
        </button>
        <button 
          onClick={() => setFeedback("no")}
          className="flex items-center gap-2 text-xs bg-foreground/5 hover:bg-foreground/10 px-4 py-2 rounded-lg transition-all active:scale-95 text-zinc-500 hover:text-foreground"
        >
          <ThumbsDown size={14} /> No
        </button>
      </div>
    </div>
  );
}
