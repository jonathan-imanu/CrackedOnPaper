"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/navbar/navbar";
import { useAuth } from "@/components/auth-provider";

export default function Login() {
  const { signInWithOAuth } = useAuth();

  const handleOAuthLogin = async (
    provider: "google" | "github" | "linkedin"
  ) => {
    await signInWithOAuth(provider);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-foreground">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 bg-background hover:bg-accent border-border hover:text-foreground hover:scale-105 transition-transform"
                onClick={() => handleOAuthLogin("google")}
              >
                <Image
                  src="/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-3"
                />
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background border-foreground hover:border-foreground/90 hover:text-background hover:scale-105 transition-transform"
                onClick={() => handleOAuthLogin("github")}
              >
                <Github className="w-5 h-5 mr-3" />
                Continue with GitHub
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 hover:text-white hover:scale-105 transition-transform"
                onClick={() => handleOAuthLogin("linkedin")}
              >
                <Linkedin className="w-5 h-5 mr-3" />
                Continue with LinkedIn
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <a
                  href="#"
                  className="font-medium text-primary hover:underline"
                >
                  Sign up
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
