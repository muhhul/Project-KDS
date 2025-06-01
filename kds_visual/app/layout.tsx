import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import CustomCursor from "@/app/_components/custom-cursor";
import CursorTrail from "@/app/_components/cursor-trail";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Biodiversity Visualization",
  description:
    "Visualize biodiversity through phylogenetic trees and geographic distribution maps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfairDisplay.variable} ${inter.className}`}
      >
        {children}
        <CustomCursor />
        <CursorTrail />
      </body>
    </html>
  );
}
