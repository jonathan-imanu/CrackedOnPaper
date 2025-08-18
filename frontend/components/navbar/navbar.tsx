"use client";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { TrendingUpDownIcon } from "@/components/animated-icons/trending-up-down";
import { UsersIcon } from "@/components/animated-icons/users";
import { FileTextIcon } from "@/components/animated-icons/file-text";
import AuthButtons from "./auth-buttons";

const navigationItems = [
  { name: "Leaderboards", link: "/leaderboards", icon: UsersIcon },
  { name: "H2H", link: "/h2h", icon: TrendingUpDownIcon },
  { name: "My Resumes", link: "/my-resumes", icon: FileTextIcon },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const iconRefs = useRef<any[]>([]);

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
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className="group text-muted-foreground hover:text-foreground transition-colors font-semibold text-base flex items-center gap-2"
                onMouseEnter={() => {
                  if (iconRefs.current[index]) {
                    iconRefs.current[index].startAnimation();
                  }
                }}
                onMouseLeave={() => {
                  if (iconRefs.current[index]) {
                    iconRefs.current[index].stopAnimation();
                  }
                }}
              >
                {item.icon && (
                  <item.icon
                    size={16}
                    ref={(el: any) => {
                      iconRefs.current[index] = el;
                    }}
                  />
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
                  className="group text-muted-foreground hover:text-foreground transition-colors font-semibold text-lg flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                  onMouseEnter={() => {
                    if (iconRefs.current[index]) {
                      iconRefs.current[index].startAnimation();
                    }
                  }}
                  onMouseLeave={() => {
                    if (iconRefs.current[index]) {
                      iconRefs.current[index].stopAnimation();
                    }
                  }}
                >
                  {item.icon && (
                    <item.icon
                      size={18}
                      ref={(el: any) => {
                        iconRefs.current[index] = el;
                      }}
                    />
                  )}
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
