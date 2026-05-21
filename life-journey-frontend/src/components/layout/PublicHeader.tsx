"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/#features", label: "Hoe werkt het" },
    { href: "/#trust", label: "Veiligheid" },
    { href: "/kennisbank", label: "Kennisbank" },
    { href: "/faq", label: "Veelgestelde vragen" },
    { href: "/about", label: "Over ons" },
  ];

  return (
    <header className="border-b border-neutral-sand bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/Logo_Bewaardvoorjou.png"
            alt="BewaardVoorJou.nl Logo"
            width={40}
            height={40}
            className="w-10 h-10"
            priority
          />
          <div className="flex flex-col">
            <span className="text-xl font-serif font-semibold text-slate-900 leading-tight">
              BewaardVoorJou.nl
            </span>
            <span className="text-xs text-slate-600 hidden sm:block">
              Vertel het vandaag, bewaar het voor altijd
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-orange transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="hover:text-orange transition-colors font-medium"
          >
            Inloggen
          </Link>
          <Button asChild className="bg-orange hover:bg-orange/90 text-white shadow-md">
            <Link href="/register">Start Gratis</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-slate-700 hover:text-orange transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-sand bg-white">
          <nav className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-slate-700 hover:bg-orange/5 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="block px-4 py-2 text-slate-700 hover:bg-orange/5 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inloggen
            </Link>
            <Button asChild className="w-full bg-orange hover:bg-orange/90 text-white">
              <Link href="/register">Start Gratis</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
