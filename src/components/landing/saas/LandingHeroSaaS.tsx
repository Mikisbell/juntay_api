"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, Globe, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function LandingHeroSaaS() {
  return (
    <section className="relative pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden bg-[#0B1120]">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[400px] sm:h-[600px] md:h-[800px] bg-[#1E3A5F]/20 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] -translate-x-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-[#D4AF37]/20 mb-6 sm:mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="hidden xs:inline">
            Nuevo: Módulo de Inversionistas 2.0
          </span>
          <span className="xs:hidden">Inversionistas 2.0</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-tight px-2"
        >
          Tu Casa de Empeño, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-amber-200">
            en Piloto Automático
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-400 max-w-xl md:max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4"
        >
          Juntay es el sistema operativo todo-en-uno que digitaliza tus
          contratos, controla tu caja y te regala una{" "}
          <span className="text-white font-semibold">Web Premium</span> para
          captar clientes.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
        >
          <Link href="/start" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-[#D4AF37] hover:bg-[#B5952F] text-[#0B1120] text-base sm:text-lg font-bold rounded-xl shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-105 active:scale-95">
              Empezar Gratis
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </Link>

          <Link href="/demo" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 border-white/10 text-white hover:bg-white/5 text-base sm:text-lg font-medium rounded-xl"
            >
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-slate-400" />
              Ver Demo
            </Button>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 md:mt-20 max-w-5xl mx-auto px-4"
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
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 sm:p-6 rounded-xl sm:rounded-2xl text-left hover:bg-white/10 transition-colors cursor-default">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1E3A5F]/50 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 border border-white/10">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37]" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
