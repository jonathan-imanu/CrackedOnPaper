"use client";

import { ThemeSwitcher as KiboThemeSwitcher } from "@/components/ui/theme-switcher";
import { useTheme } from "next-themes";
import { useEffect } from "react";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <KiboThemeSwitcher
      defaultValue="system"
      onChange={(val) => setTheme(val)}
      value={(theme as "light" | "dark" | "system") ?? "system"}
    />
  );
};

export default ThemeSwitcher;
