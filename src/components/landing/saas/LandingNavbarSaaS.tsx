"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function LandingNavbarSaaS() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black text-white tracking-tighter">
                            JUNTAY<span className="text-[#D4AF37]">.io</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Características
                        </Link>
                        <Link href="/demo" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Ver Demo Cliente
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Precios
                        </Link>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-white hover:text-[#D4AF37] transition-colors">
                            Iniciar Sesión
                        </Link>
                        <Link href="/start">
                            <Button className="bg-white text-[#0B1120] hover:bg-slate-200 font-bold rounded-lg px-5">
                                Crear Cuenta
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
