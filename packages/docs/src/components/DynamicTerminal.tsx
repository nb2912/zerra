"use client";

import dynamic from "next/dynamic";

const DevConsoleTerminal = dynamic(() => import("@/components/DevConsoleTerminal"), {
  loading: () => (
    <div className="relative aspect-video w-full rounded-3xl bg-zinc-900 animate-pulse border border-border" />
  ),
  ssr: false,
});

export default function DynamicTerminal() {
  return <DevConsoleTerminal />;
}
