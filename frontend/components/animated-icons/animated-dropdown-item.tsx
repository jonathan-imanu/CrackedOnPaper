import { forwardRef } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAnimatedIcon, type AnimatedIconHandle } from "./use-animated-icon";
import { cn } from "@/lib/utils";

interface AnimatedDropdownItemProps {
  icon: React.ComponentType<{
    ref: React.Ref<AnimatedIconHandle>;
    className?: string;
  }>;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
  destructive?: boolean;
}

export const AnimatedDropdownItem = forwardRef<
  HTMLDivElement,
  AnimatedDropdownItemProps
>(
  (
    {
      icon: Icon,
      children,
      onClick,
      className,
      iconClassName,
      destructive = false,
    },
    ref
  ) => {
    const { iconRef, handleMouseEnter, handleMouseLeave } = useAnimatedIcon();

    return (
      <DropdownMenuItem
        ref={ref}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "flex items-center gap-2 cursor-pointer",
          destructive &&
            "text-destructive focus:text-destructive focus:bg-destructive/10",
          className
        )}
      >
        <Icon ref={iconRef} className={cn("w-4 h-4", iconClassName)} />
        <span>{children}</span>
      </DropdownMenuItem>
    );
  }
);

AnimatedDropdownItem.displayName = "AnimatedDropdownItem";
