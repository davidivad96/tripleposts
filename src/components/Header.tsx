"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Header = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.target instanceof HTMLElement &&
          mutation.attributeName === "class"
        ) {
          setTheme(
            mutation.target.classList.contains("dark") ? "dark" : "light"
          );
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={
              theme === "dark"
                ? "/images/logo_dark.png"
                : "/images/logo_light.png"
            }
            alt="DualPosts Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="font-mono font-bold text-xl">
            Dual<span className="text-blue-500">Posts</span>
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
