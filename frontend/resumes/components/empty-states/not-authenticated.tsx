import { ArrowRight, Lock, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Navbar } from "@/components/navbar/navbar";

function NotAuthenticated() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] py-10 sm:py-16 px-2 sm:px-4 w-full">
      <div className="text-center w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Sign In Required
        </h2>
        <p className="text-muted-foreground mb-8 text-base sm:text-lg max-w-5xl mx-auto">
          You need to be signed in to view and manage your resumes. Create an
          account or sign in to get started.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          <Button
            variant="default"
            size="lg"
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 border-2 border-primary font-semibold"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </Button>
          <InteractiveHoverButton
            icon={<ArrowRight className="w-6 h-6" />}
            iconPosition="right"
            size="md"
            rounded={false}
            onClick={() => router.push("/login")}
          >
            Get Started
          </InteractiveHoverButton>
        </div>
      </div>
    </div>
  );
}

export function NotAuthenticatedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <NotAuthenticated />
      </div>
    </div>
  );
}
