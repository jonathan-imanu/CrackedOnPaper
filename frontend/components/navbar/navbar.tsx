"use client";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Menu, ArrowUpDown, Medal, X, FileText } from "lucide-react";
import { Logo } from "@/components/logo";
import Link from "next/link";
import AuthButtons from "./auth-buttons";
import { useAuth } from "@/components/auth-provider";

const navigationItems = [
  { name: "Features", link: "/#features", status: "unauthenticated" },
  { name: "How It Works", link: "/#how-it-works", status: "unauthenticated" },
  { name: "Leaderboards", link: "/leaderboards", icon: Medal },
  { name: "H2H", link: "/h2h", icon: ArrowUpDown },
  {
    name: "My Resumes",
    link: "/my-resumes",
    status: "authenticated",
    icon: FileText,
  },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { status } = useAuth();

  // Only re-render when status changes between authenticated/unauthenticated
  // Ignore loading state to prevent unnecessary re-renders
  const effectiveStatus = useMemo(() => {
    if (status === "loading") {
      return "unauthenticated"; // Default to unauthenticated during loading
    }
    return status;
  }, [status]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 shadow-md bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center">
          {/* Left Section - Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Center Section - Navigation */}
          <div className="hidden md:flex flex-1 justify-center space-x-8">
            {navigationItems
              .filter((item) => item.status === effectiveStatus || !item.status)
              .map((item, index) => (
                <Link
                  key={index}
                  href={item.link}
                  className="text-muted-foreground hover:text-foreground transition-colors font-semibold text-base flex items-center gap-1"
                >
                  {item.icon && effectiveStatus === "authenticated" && (
                    <item.icon className="w-4 h-4" />
                  )}
                  {item.name}
                </Link>
              ))}
          </div>

          {/* Right Section - Actions */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            <AuthButtons />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
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
                <AuthButtons isMobile={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
