import { Button } from "@/components/ui/button";

export interface VersusProps {
  handleSkip: () => void;
  isVoting: boolean;
  isSkipping: boolean;
}

export function Versus({ handleSkip, isVoting, isSkipping }: VersusProps) {
  return (
    <div className="flex flex-row lg:flex-col items-center gap-2 xl:gap-3 2xl:gap-4">
    <div className="bg-foreground text-background rounded-full w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center font-bold text-base lg:text-lg shadow-lg">
      VS
    </div>
    <div className="flex flex-row items-center justify-center gap-4">
      <Button 
        variant="accent" 
        size="sm"
        className="px-3 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium"
        onClick={handleSkip}
        disabled={isVoting || isSkipping}
      >
        Skip
      </Button>
    </div>
  </div>
  );
}