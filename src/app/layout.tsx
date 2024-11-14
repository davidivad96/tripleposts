import DynamicFavicon from "@/components/DynamicFavicon";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ThemeToggle from "@/components/ThemeToggle";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import localFont from "next/font/local";
import { PropsWithChildren } from "react";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DualPosts",
  description: "Write once, post twice",
};

type RootLayoutProps = PropsWithChildren;

const RootLayout = ({ children }: RootLayoutProps) => (
  <ClerkProvider>
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <DynamicFavicon />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  </ClerkProvider>
);

export default RootLayout;
