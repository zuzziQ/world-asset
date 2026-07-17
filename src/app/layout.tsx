import type { Metadata } from "next";
import ClientLayoutShell from "@/components/ClientLayoutShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Asset Management",
  description: "StoryMee IP Universe Ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased font-sans`}
    >
      <body className="min-h-full bg-black text-white">
        <ClientLayoutShell>{children}</ClientLayoutShell>
      </body>
    </html>
  );
}

