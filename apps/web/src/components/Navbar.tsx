"use client";

import React from "react";
import Link from "next/link";
import { Code2 } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-black">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-blue-500" />
          <span className="font-bold tracking-tight">Aura</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">Problems</Link>
          <Link href="#" className="text-sm text-zinc-400 hover:text-white">Contests</Link>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <button className="text-sm font-medium text-white hover:opacity-80 transition-opacity">Sign In</button>
        </div>
      </div>
    </nav>
  );
}
