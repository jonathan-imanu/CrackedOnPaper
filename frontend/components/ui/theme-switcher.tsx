"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const THEME_STORAGE_KEY = "theme";

const themes = [
  {
    key: "system",
    icon: Monitor,
    label: "System theme",
  },
  {
    key: "light",
    icon: Sun,
    label: "Light theme",
  },
  {
    key: "dark",
    icon: Moon,
    label: "Dark theme",
  },
];

export type ThemeSwitcherProps = {
  value?: "light" | "dark" | "system";
  onChange?: (theme: "light" | "dark" | "system") => void;
  defaultValue?: "light" | "dark" | "system";
  className?: string;
};

function getInitialTheme(defaultValue: "light" | "dark" | "system") {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  }
  return defaultValue;
}

export const ThemeSwitcher = ({
  value,
  onChange,
  defaultValue = "system",
  className,
}: ThemeSwitcherProps) => {
  const [mounted, setMounted] = useState(false);
  const [initialTheme, setInitialTheme] = useState<"light" | "dark" | "system">(
    defaultValue
  );

  useEffect(() => {
    setMounted(true);
    setInitialTheme(getInitialTheme(defaultValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [theme, setTheme] = useControllableState<"light" | "dark" | "system">({
    defaultProp: initialTheme,
    prop: value,
    onChange,
  });

  useEffect(() => {
    if (mounted && theme) {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme, mounted]);

  const handleThemeClick = useCallback(
    (themeKey: "light" | "dark" | "system") => {
      setTheme(themeKey);
    },
    [setTheme]
  );

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border",
        className
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;

        return (
          <button
            aria-label={label}
            className="relative h-6 w-6 rounded-full"
            key={key}
            onClick={() => handleThemeClick(key as "light" | "dark" | "system")}
            type="button"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-secondary"
                layoutId="activeTheme"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                "relative z-10 m-auto h-4 w-4",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
