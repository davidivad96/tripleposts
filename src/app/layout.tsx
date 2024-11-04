import Header from "@/components/Header";
import ThemeToggle from "@/components/ThemeToggle";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
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
    <html lang="en" className="light h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}
      >
        <Header />
        <div className="flex-1 overflow-hidden">{children}</div>
        <ThemeToggle />
      </body>
    </html>
  </ClerkProvider>
);

export default RootLayout;
