"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LandingNavbarSaaS() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 z-50">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tighter">
                JUNTAY<span className="text-[#D4AF37]">.io</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link
                href="#features"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Características
              </Link>
              <Link
                href="/demo"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Ver Demo
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Precios
              </Link>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-white hover:text-[#D4AF37] transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link href="/start">
                <Button className="bg-white text-[#0B1120] hover:bg-slate-200 font-bold rounded-lg px-4 lg:px-5 text-sm">
                  Crear Cuenta
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden z-50 p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={closeMobileMenu}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[280px] bg-[#0B1120] border-l border-white/10 z-40 md:hidden"
            >
              <div className="flex flex-col h-full pt-20 px-6">
                {/* Navigation Links */}
                <nav className="flex flex-col gap-1 mb-8">
                  <Link
                    href="#features"
                    onClick={closeMobileMenu}
                    className="text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-colors"
                  >
                    Características
                  </Link>
                  <Link
                    href="/demo"
                    onClick={closeMobileMenu}
                    className="text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-colors"
                  >
                    Ver Demo Cliente
                  </Link>
                  <Link
                    href="#pricing"
                    onClick={closeMobileMenu}
                    className="text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-colors"
                  >
                    Precios
                  </Link>
                </nav>

                {/* Mobile CTAs */}
                <div className="flex flex-col gap-3 mt-auto mb-8">
                  <Link href="/login" onClick={closeMobileMenu}>
                    <Button
                      variant="outline"
                      className="w-full border-white/10 text-white hover:bg-white/5 font-medium h-12"
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/start" onClick={closeMobileMenu}>
                    <Button className="w-full bg-white text-[#0B1120] hover:bg-slate-200 font-bold h-12">
                      Crear Cuenta
                    </Button>
                  </Link>
                </div>

                {/* Footer Info */}
                <div className="border-t border-white/10 pt-6 pb-6">
                  <p className="text-xs text-slate-500 text-center">
                    JUNTAY © 2026 - Sistema de Gestión
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
