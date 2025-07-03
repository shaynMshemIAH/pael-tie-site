// app/layout.tsx
import React from "react";

export const metadata = {
  title: "PAEL TIE",
  description: "Subatomic propulsion and energy transformation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
