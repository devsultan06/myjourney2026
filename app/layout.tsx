import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My2026Journey - Track Your Year of Growth",
  description:
    "A personal productivity and life-tracking platform for 2026. Track reading, coding, jobs, projects, and more.",
  keywords: ["productivity", "tracking", "2026", "goals", "life-tracking"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
