"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const DynamicFavicon = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      favicon.setAttribute(
        "href",
        theme === "dark" ? "/images/logo_dark.png" : "/images/logo_light.png"
      );
    }
  }, [theme]);

  return null;
};

export default DynamicFavicon;
