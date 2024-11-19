"use client";

import useMounted from "@/hooks/useMounted";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const Header: React.FC = () => {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();

  if (!mounted) return null;

  const src =
    resolvedTheme === "dark"
      ? "/images/logo_dark.png"
      : "/images/logo_light.png";

  return (
    <header className="sticky top-0 w-full border-b border-gray-200 dark:border-gray-800 bg-background z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={src}
            alt="TriplePosts Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="font-mono font-bold text-xl">
            Triple<span className="text-blue-500">Posts</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
