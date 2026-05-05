import Skeleton, { SkeletonText } from "@/components/Skeleton";

export default function BenchmarksLoading() {
  return (
    <main className="min-h-screen pt-32 pb-20 bg-background">
      <section className="max-w-5xl mx-auto px-6 mb-24">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-6 mb-20 text-center">
          <Skeleton className="w-40 h-8 mx-auto rounded-full" />
          <Skeleton className="w-3/4 h-24 mx-auto rounded-2xl" />
          <SkeletonText lines={2} className="max-w-2xl mx-auto" />
        </div>

        {/* Chart Card Skeleton */}
        <div className="p-8 md:p-16 rounded-[48px] border border-border bg-foreground/[0.02] mb-12">
          <div className="flex items-center justify-between mb-16">
            <div className="space-y-3">
              <Skeleton className="w-48 h-8 rounded-lg" />
              <Skeleton className="w-64 h-4 rounded-md" />
            </div>
            <Skeleton className="w-12 h-12 rounded-2xl" />
          </div>

          <div className="flex flex-col gap-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="w-32 h-6" />
                  <Skeleton className="w-24 h-6" />
                </div>
                <Skeleton className="h-4 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Latency Cards Skeleton */}
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-10 rounded-[40px] border border-border bg-foreground/[0.02] space-y-6">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="w-32 h-12" />
              <Skeleton className="w-24 h-4" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
