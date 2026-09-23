import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Design Canvas",
  description: "A lightweight canvas editor — rectangles, circles, and text.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}