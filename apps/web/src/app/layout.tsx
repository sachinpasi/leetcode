import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Aura | Elite Code Judge",
  description: "Secure, scalable, and professional algorithmic challenge platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-zinc-200 antialiased font-sans">
        <div className="relative min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          
          {/* Subtle background glow */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/5 blur-[120px] pointer-events-none -z-10" />
        </div>
      </body>
    </html>
  );
}
