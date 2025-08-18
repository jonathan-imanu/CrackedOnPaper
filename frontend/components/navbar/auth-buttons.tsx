"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeSwitcher from "./theme-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthButtonsProps {
  isMobile?: boolean;
}

export const AuthButtons = ({ isMobile }: AuthButtonsProps) => {
  const { user, status, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Loading state (show skeleton of authenticated state)
  if (status === "loading") {
    return (
      <div
        className={`flex items-center ${
          isMobile ? "flex-col space-y-2" : "space-x-4"
        }`}
      >
        <ThemeSwitcher />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10 rounded-full" />{" "}
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (status === "unauthenticated") {
    return (
      <div
        className={`flex items-center ${
          isMobile ? "flex-col space-y-2" : "space-x-4"
        }`}
      >
        <ThemeSwitcher />
        <Button
          variant="ghost"
          size="lg"
          className={`font-semibold text-base px-6 py-2 ${
            isMobile ? "w-full justify-start" : ""
          }`}
          onClick={() => router.push("/login")}
        >
          Login
        </Button>
        <Button
          size="lg"
          className={`font-bold text-base px-8 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${
            isMobile ? "w-full justify-start" : ""
          }`}
          onClick={() => router.push("/login")}
        >
          Get Started
        </Button>
      </div>
    );
  }

  // Authenticated state
  return (
    <div
      className={`flex items-center ${
        isMobile ? "flex-col space-y-2" : "space-x-4"
      }`}
    >
      <ThemeSwitcher />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user?.profile?.avatar_url}
                alt={user?.profile?.name || user?.email || "User"}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user?.profile?.name?.charAt(0) ||
                  user?.email?.charAt(0) ||
                  "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.profile?.name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AuthButtons;
