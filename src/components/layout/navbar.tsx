"use client";

import Link from "next/link";
import { CherokeeBankLogo } from "./logo";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#050810]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
        <CherokeeBankLogo size="small" />
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
          <Link href="/about" className="hover:text-[#D4AF37] transition-colors">About</Link>
          <Link href="/careers" className="hover:text-[#D4AF37] transition-colors">Careers</Link>
          <Link href="/support" className="hover:text-[#D4AF37] transition-colors">Support</Link>
          <Link href="/legal" className="hover:text-[#D4AF37] transition-colors">Legal</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold border border-white/10 rounded-lg hover:bg-white/5 transition-all text-white/80"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="btn-gold px-4 py-2 text-sm rounded-lg"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
