"use client";

import { Button } from "@/components/ui/button";
import { Upload, Trophy } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Top center glow */}
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-3xl opacity-40 bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--primary)/0.4)_0%,transparent_70%)]" />
        {/* Bottom glow */}
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[500px] blur-2xl opacity-20 bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--secondary)/0.3)_0%,transparent_70%)]" />
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:14px_14px] text-foreground" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Headline + subheading */}
        <div className="mx-auto mb-16 max-w-5xl">
          <h1 className="text-balance text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            See if you&apos;re actually{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/70 bg-clip-text text-transparent">
                cracked
              </span>
              {/* Subtle underline accent */}
              <span className="absolute left-0 bottom-1 h-[3px] w-full bg-primary/20 rounded-full" />
            </span>
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-1 text-2xl md:text-3xl text-muted-foreground">
            On paper at least.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            className="group rounded-full px-8 py-6 text-lg font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Upload className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Upload Resume
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="group rounded-full px-8 py-6 text-lg font-semibold border-2 hover:bg-background/60 backdrop-blur"
          >
            <Trophy className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            View Leaderboards
          </Button>
        </div>
      </div>
    </section>
  );
}
