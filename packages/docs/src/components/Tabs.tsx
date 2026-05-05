"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  value: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
}

export default function Tabs({ tabs, defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value);

  return (
    <div className="my-8 flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-white/5 pb-0.5 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all relative whitespace-nowrap",
                isActive 
                  ? "text-white" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
      <div className="animate-in fade-in duration-300">
        {tabs.find((t) => t.value === activeTab)?.content}
      </div>
    </div>
  );
}
