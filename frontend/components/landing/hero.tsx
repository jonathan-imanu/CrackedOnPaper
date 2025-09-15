"use client";

import { Button } from "@/components/ui/button";
import { Upload, ArrowRight } from "lucide-react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";
import Image from "next/image";
import Link from "next/link";
import { InteractiveHoverButton } from "../ui/interactive-hover-button";

export function Hero() {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  const resumeItems = [
    // TODO: ADD TINBETE'S RESUME TO CDN THEN UPDATE ONE OF THESE LINKS!
    {
      title: "Software Engineer",
      image:
        `${cdnUrl}/constants/jakesresume.jpeg`,
      className:
        "absolute -top-10 -left-70 rotate-[-12deg] md:-top-20 md:left-[-5%] md:rotate-[-12deg]",
    },
    {
      title: "Backend Developer",
      image:
        `${cdnUrl}/constants/JonathanManuelResume.pdf`,
      className:
      "absolute -bottom-10 -right-70 rotate-[18deg] md:-bottom-20 md:left-[8%] md:rotate-[18deg]",
        
    },
    {
      title: "Marketing Analyst",
      image:
        `${cdnUrl}/constants/marketingresume.png`,
      className:
      "hidden absolute bottom-0 left-[88%] rotate-[12deg] md:left-[88%] md:rotate-[12deg] lg:block",
       
    },
    {
      title: "Investment Banker",
      image:
        `${cdnUrl}/constants/investment-banking.jpg`,
      className:
        "hidden absolute -top-40 left-[35%] rotate-[-8deg] md:left-[35%] md:rotate-[-8deg] lg:block",
    },
    {
      title: "Data Scientist",
      image:
        `${cdnUrl}/constants/datascience.png`,
      className:
        "absolute -bottom-60 left-[5%] rotate-[-12deg] md:left-[45%] md:rotate-[-12deg]",
    },
    {
      title: "UX Designer",
      image:
        `${cdnUrl}/constants/uxdesigner.png`,
      className:
        "hidden absolute -top-30 left-[75%] rotate-[14deg] md:left-[75%] md:rotate-[14deg] lg:block",
    },
  ];

  console.log(process.env.NEXT_PUBLIC_CDN_URL);

  return (
    <DraggableCardContainer className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-3xl opacity-40 bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--primary)/0.4)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[500px] blur-2xl opacity-20 bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--secondary)/0.3)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:radial-gradient(currentColor_1px,transparent_2px)] [background-size:14px_14px] text-foreground" />
      </div>

      {resumeItems.map((item, index) => (
        <DraggableCardBody
          key={index}
          className={`${item.className} hover:cursor-pointer`}
        >
          <Image
            src={item.image}
            alt={item.title}
            width={320}
            height={400}
            className="pointer-events-none object-contain h-full w-full"
          />
          <h3 className="mt-4 text-center text-lg font-bold text-foreground dark:text-foreground">
            {item.title}
          </h3>
        </DraggableCardBody>
      ))}

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="mx-auto mb-16 max-w-5xl">
          <h1 className="text-balance text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            See if you&apos;re actually{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/70 bg-clip-text text-transparent">
                cracked
              </span>
              <span className="absolute left-0 bottom-1 h-[3px] w-full bg-primary/20 rounded-full" />
            </span>
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-1 text-2xl md:text-3xl text-muted-foreground">
            On paper at least.
          </p>
        </div>

        <div className="flex flex-row justify-center items-center gap-4 sm:gap-6 max-w-2xl mx-auto px-4 sm:px-0">
          <Link href="/h2h" className="w-full sm:w-auto">
            <InteractiveHoverButton
              icon={
                <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:text-foreground" />
              }
              iconPosition="right"
              className="px-6 py-4 sm:px-7 sm:py-2 font-bold text-lg sm:text-xl rounded-full shadow-xl transition-all duration-300 hover:shadow-2xl w-full sm:w-auto min-h-[56px] sm:min-h-0"
              color="accent"
            >
              <p className="group-hover:text-foreground group-hover:text-foreground">
                Start Voting
              </p>
            </InteractiveHoverButton>
          </Link>
          <Link href="/my-resumes" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="group relative overflow-hidden rounded-full px-8 py-6 sm:px-10 sm:py-6 text-lg font-bold shadow-xl transition-all duration-300 hover:shadow-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary/90 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-transparent before:to-white/20 before:translate-x-[-100%] before:transition-transform before:duration-700 hover:before:translate-x-[100%] w-full sm:w-auto min-h-[56px] sm:min-h-0"
            >
              <Upload className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:scale-110" />
              Upload Resume
            </Button>
          </Link>
        </div>
      </div>
    </DraggableCardContainer>
  );
}
