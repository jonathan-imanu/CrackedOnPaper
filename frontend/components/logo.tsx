import { FileCode } from "lucide-react";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg">
          <FileCode className="w-5 h-5 text-white drop-shadow" />
        </span>
        <span className="text-2xl font-bold">Cracked On Paper</span>
      </div>
    </Link>
  );
};
