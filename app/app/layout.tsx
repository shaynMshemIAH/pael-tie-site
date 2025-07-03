import React from "react";
import "./globals.css"; // If using Tailwind or global styles

export const metadata = {
  title: "PAEL TIE",
  description: "Subatomic propulsion | Unified wave function detection and logs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
