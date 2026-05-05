"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="text-zinc-500 hover:text-foreground transition-colors p-1"
      title="Copy to clipboard"
    >
      {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
    </button>
  );
}
