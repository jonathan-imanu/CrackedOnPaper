import { forwardRef } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAnimatedIcon, type AnimatedIconHandle } from "./use-animated-icon";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

interface AnimatedButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  icon: React.ComponentType<{
    ref: React.Ref<AnimatedIconHandle>;
    className?: string;
  }>;
  children?: React.ReactNode;
  iconClassName?: string;
  iconOnly?: boolean;
  asChild?: boolean;
}

export const AnimatedButton = forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(
  (
    {
      icon: Icon,
      children,
      iconClassName,
      iconOnly = false,
      className,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const { iconRef, handleMouseEnter, handleMouseLeave } = useAnimatedIcon();

    return (
      <Button
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(className)}
        variant={variant}
        size={size}
        asChild={asChild}
        {...props}
      >
        <Icon
          ref={iconRef}
          className={cn(iconOnly ? "w-4 h-4" : "w-4 h-4 mr-2", iconClassName)}
        />
        {children}
      </Button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";
