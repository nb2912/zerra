import Navbar from "@/components/Navbar";
import { ArrowLeft, Clock, Zap, Shield, Globe } from "lucide-react";
import Link from "next/link";
import Callout from "@/components/Callout";
import Steps from "@/components/Steps";

interface CaseStudyData {
  title: string;
  duration: string;
  scale: string;
  industry: string;
  security: string;
  description: string;
  challenge: string;
  results: {
    metric1: string;
    label1: string;
    metric2: string;
    label2: string;
  };
}

const CASE_STUDIES: Record<string, CaseStudyData> = {
  "nexflow-api": {
    title: "NexFlow API",
    duration: "4 Months",
    scale: "50k req/s",
    industry: "FinTech",
    security: "SOC2",
    description: "The NexFlow team needed a backend solution that could handle extreme bursts of traffic during global market events without sacrificing developer velocity.",
    challenge: "Traditional frameworks were introducing too much latency (average 15-20ms) due to heavy abstraction layers. With a target of sub-5ms response times, the team needed a framework that stayed out of the way.",
    results: {
      metric1: "90%",
      label1: "Reduction in server costs due to lower memory footprint.",
      metric2: "3.5x",
      label2: "Faster time-to-market for new feature releases."
    }
  },
  "lumina-saas": {
    title: "Lumina SaaS",
    duration: "6 Months",
    scale: "1M+ Users",
    industry: "Enterprise",
    security: "ISO27001",
    description: "Lumina required a complex multi-tenant architecture with high-security requirements and granular permission management.",
    challenge: "Managing dynamic routes for thousands of custom subdomains while maintaining a centralized authentication system was becoming a maintenance nightmare.",
    results: {
      metric1: "Zero",
      label1: "Security breaches since migrating to Zerra's built-in auth middleware.",
      metric2: "45%",
      label2: "Improvement in dashboard load times for global users."
    }
  },
  "ecostore-backend": {
    title: "EcoStore Backend",
    duration: "3 Months",
    scale: "200k SKUs",
    industry: "E-commerce",
    security: "PCI-DSS",
    description: "EcoStore needed a headless commerce engine that could handle massive product catalogs and lightning-fast search queries.",
    challenge: "The previous monolithic backend was struggling to keep up with peak holiday traffic, causing slow checkout flows and lost revenue.",
    results: {
      metric1: "12ms",
      label1: "Average search response time across 200k unique product listings.",
      metric2: "2x",
      label2: "Increase in checkout conversion rates during Black Friday."
    }
  }
};

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = CASE_STUDIES[slug] || CASE_STUDIES["nexflow-api"];

  return (
    <main className="min-h-screen pt-32 pb-20 bg-background text-foreground">
      <Navbar />

      <article className="max-w-4xl mx-auto px-6">
        <Link 
          href="/showcase" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-foreground transition-colors mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Showcase
        </Link>

        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-foreground/5 border border-border text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Case Study
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            {data.title}
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-border">
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Duration</div>
              <div className="font-bold flex items-center gap-2">
                <Clock size={14} className="text-zinc-400" /> {data.duration}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Scale</div>
              <div className="font-bold flex items-center gap-2">
                <Zap size={14} className="text-zinc-400" /> {data.scale}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Industry</div>
              <div className="font-bold flex items-center gap-2">
                <Globe size={14} className="text-zinc-400" /> {data.industry}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Security</div>
              <div className="font-bold flex items-center gap-2">
                <Shield size={14} className="text-zinc-400" /> {data.security}
              </div>
            </div>
          </div>
        </header>

        <section className="prose prose-zinc dark:prose-invert max-w-none mb-20">
          <p className="text-xl leading-relaxed text-zinc-400 mb-12">
            {data.description}
          </p>

          <h2>The Challenge</h2>
          <p>
            {data.challenge}
          </p>

          <Callout type="warning" title="Performance Bottleneck">
            Prior to Zerra, the system was hitting a technical wall that prevented further scaling of the user base.
          </Callout>

          <h2>The Solution</h2>
          <p>
            By leveraging Zerra&apos;s high-performance engine and developer-first abstractions, the team successfully migrated their core infrastructure.
          </p>

          <Steps items={[
            {
              title: "Migration",
              content: "Phased rollout of Zerra services alongside legacy systems to ensure zero downtime."
            },
            {
              title: "Optimization",
              content: "Fine-tuning Zerra's built-in validation and routing for the specific use case."
            },
            {
              title: "Scaling",
              content: "Horizontal scaling achieved with Zerra's stateless architecture and optimized memory footprint."
            }
          ]} />

          <h2>Results</h2>
          <div className="grid md:grid-cols-2 gap-8 not-prose my-12">
            <div className="p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10">
              <div className="text-4xl font-black text-emerald-500 mb-2">{data.results.metric1}</div>
              <p className="text-sm text-zinc-400 font-medium">{data.results.label1}</p>
            </div>
            <div className="p-8 rounded-[32px] bg-blue-500/5 border border-blue-500/10">
              <div className="text-4xl font-black text-blue-500 mb-2">{data.results.metric2}</div>
              <p className="text-sm text-zinc-400 font-medium">{data.results.label2}</p>
            </div>
          </div>
        </section>

        <div className="p-12 rounded-[48px] border border-border bg-foreground/[0.03] text-center mb-24">
          <h3 className="text-2xl font-bold mb-4">Want these results?</h3>
          <p className="text-zinc-500 mb-8">Start building with Zerra today and experience the future of API development.</p>
          <Link 
            href="/docs/getting-started" 
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all hover:scale-105"
          >
            Get Started Now
          </Link>
        </div>
      </article>

      <footer className="max-w-7xl mx-auto px-6 pb-16 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8 pt-16 text-zinc-500 text-sm">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-background font-black text-sm tracking-tighter">Z</span>
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">Zerra</span>
        </div>
        <p className="font-medium text-zinc-600 italic">© 2026 Zerra Framework. MIT Licensed.</p>
        <div className="flex items-center gap-8 font-semibold">
           <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
           <a href="https://github.com/nb2912/zerra" target="_blank" className="hover:text-foreground transition-colors">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
