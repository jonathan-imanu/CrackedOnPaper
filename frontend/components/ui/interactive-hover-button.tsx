import React from "react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "icon" | "iconPosition"
  > {
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  rounded?: boolean;
  size?: "sm" | "md" | "lg";
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(
  (
    {
      children,
      className,
      rounded = true,
      size = "md",
      icon,
      iconPosition,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "p-1 px-4 text-sm",
      md: "p-2 px-6 text-base",
      lg: "p-3 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "group relative w-auto cursor-pointer overflow-hidden border bg-background text-center font-semibold",
          rounded ? "rounded-full" : "rounded-md",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary transition-all duration-300 group-hover:scale-[100.8]"></div>
          <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
            {children}
          </span>
        </div>
        <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
          {icon && iconPosition === "left" && icon}
          <span>{children}</span>
          {icon && iconPosition === "right" && icon}
        </div>
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";
