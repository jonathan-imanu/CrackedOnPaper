import { Versus } from "@/features/h2h/versus";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function Loading() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 xl:gap-10 2xl:gap-16">
      {/* Left Resume Card Skeleton */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-1xl 2xl:max-w-4xl">
        <Card className="group hover:shadow-lg transition-all duration-300 border shadow-2xl">
          {/* Feedback Button Skeleton */}
          <div className="absolute top-3 right-3 z-10">
            <Skeleton className="h-8 w-8 rounded-md bg-muted" />
          </div>

          <CardHeader className="pb-0">
            <div className="flex items-start justify-between mb-0">
              <div className="pr-24">
                <Skeleton className="h-6 w-48 mb-2 bg-muted" />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full bg-muted" />
                <Skeleton className="h-6 w-16 rounded-full bg-muted" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded bg-muted" />
                  <Skeleton className="h-4 w-16 bg-muted" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-5 w-5 rounded-full bg-muted" />
                  <Skeleton className="h-4 w-12 bg-muted" />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Resume Image Skeleton */}
            <div className="w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              <Skeleton className="h-full w-full bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Versus Component */}
      <Versus handleSkip={() => {}} isVoting={false} isSkipping={false} />

      {/* Right Resume Card Skeleton */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-1xl 2xl:max-w-4xl">
        <Card className="group hover:shadow-lg transition-all duration-300 border shadow-2xl">
          {/* Feedback Button Skeleton */}
          <div className="absolute top-3 right-3 z-10">
            <Skeleton className="h-8 w-8 rounded-md bg-muted" />
          </div>

          <CardHeader className="pb-0">
            <div className="flex items-start justify-between mb-0">
              <div className="pr-24">
                <Skeleton className="h-6 w-52 mb-2 bg-muted" />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24 rounded-full bg-muted" />
                <Skeleton className="h-6 w-18 rounded-full bg-muted" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4 rounded bg-muted" />
                  <Skeleton className="h-4 w-20 bg-muted" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-5 w-5 rounded-full bg-muted" />
                  <Skeleton className="h-4 w-14 bg-muted" />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Resume Image Skeleton */}
            <div className="w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              <Skeleton className="h-full w-full bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}