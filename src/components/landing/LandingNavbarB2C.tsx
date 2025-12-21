"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LandingNavbarB2C() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo + Tagline */}
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/landing/logo.png"
                            alt="JUNTAY"
                            width={100}
                            height={32}
                            className="h-8 w-auto"
                        />
                        <div className="hidden sm:block border-l border-gray-300 pl-3">
                            <span className="text-xs font-medium text-[#D4AF37] uppercase tracking-wider">
                                Casa de Empeño
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#simulador" className="text-sm font-medium text-gray-600 hover:text-[#1E3A5F] transition-colors">
                            Simulador
                        </a>
                        <a href="#process" className="text-sm font-medium text-gray-600 hover:text-[#1E3A5F] transition-colors">
                            ¿Cómo funciona?
                        </a>
                        <a href="#assets" className="text-sm font-medium text-gray-600 hover:text-[#1E3A5F] transition-colors">
                            Qué aceptamos
                        </a>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-4">
                        <a
                            href="https://wa.me/51995060806?text=Hola%20JUNTAY,%20necesito%20un%20pr%C3%A9stamo%20r%C3%A1pido"
                            className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#152C4A] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#1E3A5F]/20 hover:scale-105"
                        >
                            <Phone className="w-4 h-4" />
                            <span className="hidden sm:inline">995 060 806</span>
                            <span className="sm:hidden">Llamar</span>
                        </a>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-600"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100"
                    >
                        <div className="px-4 py-4 space-y-3">
                            <a
                                href="#simulador"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-2 text-gray-700 font-medium"
                            >
                                Simulador
                            </a>
                            <a
                                href="#process"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-2 text-gray-700 font-medium"
                            >
                                ¿Cómo funciona?
                            </a>
                            <a
                                href="#assets"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-2 text-gray-700 font-medium"
                            >
                                Qué aceptamos
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
