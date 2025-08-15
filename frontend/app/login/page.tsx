"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient, User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github, Linkedin, Mail, LogOut } from "lucide-react";
import Image from "next/image";

const supabaseProjectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
const supabaseUrl = `https://${supabaseProjectId}.supabase.co`;
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseProjectId || !publicAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, publicAnonKey);

export default function LoginPage() {
  const [user, setUser] = useState<User>();
  const [secretData, setSecretData] = useState<any>();

  useEffect(() => {
    // Whenever the auth state changes, we receive an event and a session object.
    // Save the user from the session object to the state.
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setUser(session?.user);
      } else if (event === "SIGNED_OUT") {
        setUser(undefined);
        setSecretData(undefined);
      }
    });
  }, []);

  // If user is logged in, show the logged in component
  if (user) {
    return (
      <LoggedIn
        user={user}
        secretData={secretData}
        setSecretData={setSecretData}
      />
    );
  }

  // If user is not logged in, show the auth UI
  return <LoggedOut />;
}

function LoggedOut() {
  const handleOAuthLogin = async (
    provider: "google" | "github" | "linkedin"
  ) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
  };

  return (
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
              Don't have an account?{" "}
              <a href="#" className="font-medium text-primary hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoggedIn({
  user,
  secretData,
  setSecretData,
}: {
  user: User;
  secretData: any;
  setSecretData: (data: any) => void;
}) {
  // Perform a request to the backend (with a protected route) to get the secret data
  useEffect(() => {
    const fetchSecretData = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch("http://localhost:8080/secret", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSecretData(data);
        } else {
          console.error("Failed to fetch secret data");
        }
      } catch (error) {
        console.error("Error fetching secret data:", error);
      }
    };

    fetchSecretData();
  }, [setSecretData]);

  // This removes the token from local storage and reloads the page
  const handleSignOut = () => {
    supabase.auth.signOut().then(() => {
      window.location.reload();
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-foreground">
            Welcome, {user.email}!
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            You are successfully authenticated
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Secret Data Display */}
          {secretData && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Secret Data from Backend:</h3>
              <pre className="text-sm text-muted-foreground">
                {JSON.stringify(secretData, null, 2)}
              </pre>
            </div>
          )}

          {/* Sign Out Button */}
          <Button
            variant="outline"
            className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive hover:border-destructive/90 hover:text-destructive-foreground hover:scale-105 transition-transform"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// This function gets the token from local storage.
// Supabase stores the token in local storage so we can access it from there.
const getToken = () => {
  const storageKey = `sb-${supabaseProjectId}-auth-token`;
  const sessionDataString = localStorage.getItem(storageKey);
  const sessionData = JSON.parse(sessionDataString || "null");
  const token = sessionData?.access_token;

  return token;
};
