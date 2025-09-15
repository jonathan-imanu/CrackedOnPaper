import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStatesProps {
  error: string;
  onRetry: () => void;
  className?: string;
}

export function ErrorStates({ 
  error, 
  onRetry, 
  className 
}: ErrorStatesProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-8 py-24 px-6 min-h-[60vh]", className)}>
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-foreground">
            Something Went Wrong
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed">
            {error || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={onRetry} 
          variant="default" 
          size="lg"
          className="px-8"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}