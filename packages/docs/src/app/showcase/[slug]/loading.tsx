import Skeleton, { SkeletonText } from "@/components/Skeleton";

export default function CaseStudyLoading() {
  return (
    <main className="min-h-screen pt-32 pb-20 bg-background text-foreground">
      <article className="max-w-4xl mx-auto px-6">
        <Skeleton className="w-40 h-6 mb-12 rounded-lg" />

        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-24 h-6 rounded-full" />
            <Skeleton className="w-24 h-6 rounded-full" />
          </div>
          
          <Skeleton className="w-3/4 h-16 mb-8 rounded-2xl" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-16 h-3 rounded-full" />
                <Skeleton className="w-24 h-6 rounded-md" />
              </div>
            ))}
          </div>
        </header>

        <section className="space-y-12 mb-20">
          <SkeletonText lines={3} className="max-w-none mb-12" />

          <div className="space-y-4">
            <Skeleton className="w-48 h-10 rounded-lg" />
            <SkeletonText lines={4} />
          </div>

          <Skeleton className="w-full h-32 rounded-[24px]" />

          <div className="space-y-4">
            <Skeleton className="w-48 h-10 rounded-lg" />
            <SkeletonText lines={2} />
          </div>

          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-32 h-6" />
                  <Skeleton className="w-full h-4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <Skeleton className="w-full h-64 rounded-[48px]" />
      </article>
    </main>
  );
}
