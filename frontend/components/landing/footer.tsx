"use client";

import { Button } from "@/components/ui/button";
import { Github, ExternalLink, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t bg-gradient-to-b from-background to-background/80">
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:20px_20px] text-foreground" />
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Cracked On Paper</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground"></div>
          </div>

          {/* Connect */}
          <div className="space-y-3 md:text-right">
            <div className="flex gap-2 md:justify-end">
              <Button
                variant="outline"
                size="sm"
                className="group h-8 w-8 rounded-lg p-0 transition-all duration-300 hover:scale-105 hover:border-primary"
                asChild
              >
                <Link
                  href="https://github.com/jonathan-imanu/CrackedOnPaper"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-3 w-3" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-2 pt-6 border-t border-border/50">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-1">
              <span>Built with </span>
              <Heart className="h-3 w-3 text-red-500 fill-current" />
              <span>
                by{" "}
                <Link
                  href="https://www.linkedin.com/in/tinbete-ermias/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-4 decoration-primary/60 hover:decoration-primary transition-colors hover:text-primary"
                >
                  Tinbete
                </Link>
                <span className="mx-1 text-muted-foreground/70">&amp;</span>
                <Link
                  href="https://www.linkedin.com/in/jonathan-imanuel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-4 decoration-primary/60 hover:decoration-primary transition-colors hover:text-primary"
                >
                  Jonathan
                </Link>
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <Link
                href="/privacy"
                className="text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1"
              >
                Privacy
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1"
              >
                Terms
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
