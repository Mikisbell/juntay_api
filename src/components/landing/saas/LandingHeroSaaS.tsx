"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, Globe, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function LandingHeroSaaS() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden bg-[#0B1120]">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-[#1E3A5F]/20 rounded-full blur-[120px] -translate-x-1/2" />
            </div>

            <div className="max-w-7xl mx-auto px-4 text-center">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-1.5 rounded-full text-sm font-medium border border-[#D4AF37]/20 mb-8"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    Nuevo: Módulo de Inversionsitas 2.0
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight"
                >
                    Tu Casa de Empeño, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-amber-200">
                        en Piloto Automático
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Juntay es el sistema operativo todo-en-uno que digitaliza tus contratos, controla tu caja y te regala una <span className="text-white font-semibold">Web Premium</span> para captar clientes.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/start">
                        <Button className="h-14 px-8 bg-[#D4AF37] hover:bg-[#B5952F] text-[#0B1120] text-lg font-bold rounded-xl shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-105">
                            Empezar Gratis
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>

                    <Link href="/demo">
                        <Button variant="outline" className="h-14 px-8 border-white/10 text-white hover:bg-white/5 text-lg font-medium rounded-xl">
                            <Globe className="w-5 h-5 mr-2 text-slate-400" />
                            Ver Web de Ejemplo
                        </Button>
                    </Link>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto"
                >
                    <FeatureCard
                        icon={LayoutDashboard}
                        title="Dashboard Total"
                        desc="Controla caja, intereses y pagos desde un solo lugar."
                    />
                    <FeatureCard
                        icon={Globe}
                        title="Tu Propia Web"
                        desc="Cada cuenta incluye una Landing Page optimizada para SEO."
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Seguridad Bancaria"
                        desc="Contratos digitales y trazabilidad completa de activos."
                    />
                </motion.div>

            </div>
        </section>
    );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-left hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-[#1E3A5F]/50 rounded-xl flex items-center justify-center mb-4 border border-white/10">
                <Icon className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400">{desc}</p>
        </div>
    );
}
