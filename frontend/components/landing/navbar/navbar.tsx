"use client";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "./theme-switcher";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useRouter } from "next/navigation";

const navigationItems = [
  { name: "Features", link: "#features" },
  { name: "How It Works", link: "#how-it-works" },
  { name: "Leaderboards", link: "#leaderboards" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 shadow-md bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className="text-muted-foreground hover:text-foreground transition-colors font-semibold text-base"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="lg"
              className="font-semibold text-base px-6 py-2"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
            <Button
              size="lg"
              className="font-bold text-base px-8 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              onClick={() => router.push("/login")}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col space-y-4 pt-4">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.link}
                  className="text-muted-foreground hover:text-foreground transition-colors font-semibold text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="lg"
                  className="justify-start font-semibold text-base"
                  asChild
                  onClick={() => router.push("/login")}
                >
                  Login
                </Button>

                <Link href="/login">
                  <Button
                    size="lg"
                    className="justify-start font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    asChild
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
