import { Navbar } from "@/components/landing/navbar/navbar";
import { Hero } from "@/components/landing/hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
    </div>
  );
}
