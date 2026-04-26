"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pencarian", label: "Isi Kuisioner" },
  { href: "/login", label: "Login" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: "#155d9b" }}>
      <div className="w-full px-4 md:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105 duration-300">
            {/* Leaf icon */}
            <svg className="w-9 h-9 shrink-0 drop-shadow-md" viewBox="0 0 28 28" fill="none">
              <path
                d="M20 6C14 7 10 12 8 18C7.5 19.5 7 21 6.5 22.5L8 23L9 21C9.5 21.2 10 21.3 10.5 21.3C14.5 21.3 18 18 18 14C21 13.5 23 11 23 8V6H20Z"
                fill="#8BC34A"
              />
              <path d="M10 16C13 16 16 13 16 10" stroke="white" strokeWidth="1.2" fill="none" opacity="0.6" />
            </svg>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white tracking-widest uppercase drop-shadow-md">
                  Tracer
                </span>
                <span className="text-2xl font-light text-white/90 tracking-wider">
                  Study
                </span>
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-white/80 tracking-widest uppercase">
                PPG dan Studi Lanjut
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 transition-all rounded"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="sm:hidden p-2 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-white/15 py-2 pb-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
