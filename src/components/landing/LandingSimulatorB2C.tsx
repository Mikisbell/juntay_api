"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calculator, Gem, Smartphone, Laptop, Car, Wrench } from "lucide-react";
import { motion } from "framer-motion";

const garantias = [
    { id: "oro", name: "Joyas de Oro", icon: Gem, tasaBase: 0.85 },
    { id: "celular", name: "Celular", icon: Smartphone, tasaBase: 0.60 },
    { id: "laptop", name: "Laptop", icon: Laptop, tasaBase: 0.55 },
    { id: "vehiculo", name: "Moto/Auto", icon: Car, tasaBase: 0.70 },
    { id: "herramienta", name: "Herramientas", icon: Wrench, tasaBase: 0.50 },
];

const montos = [500, 1000, 2000, 5000, 10000];

export function LandingSimulatorB2C() {
    const [garantia, setGarantia] = useState<string | null>(null);
    const [monto, setMonto] = useState<number | null>(null);

    const garantiaSeleccionada = garantias.find(g => g.id === garantia);
    const montoEstimado = monto && garantiaSeleccionada
        ? Math.round(monto * garantiaSeleccionada.tasaBase)
        : null;

    const whatsappMessage = garantia && monto
        ? `Hola JUNTAY, quiero empeñar ${garantiaSeleccionada?.name} valorizado en S/${monto}. ¿Cuánto me pueden prestar?`
        : `Hola JUNTAY, quiero simular un préstamo`;

    const whatsappLink = `https://wa.me/51995060806?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <section className="py-20 bg-[#1E3A5F] relative overflow-hidden" id="simulador">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-40 h-40 border border-[#D4AF37] rounded-full" />
                <div className="absolute bottom-10 right-10 w-60 h-60 border border-[#D4AF37] rounded-full" />
                <div className="absolute top-1/2 left-1/2 w-80 h-80 border border-[#D4AF37] rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#1E3A5F] px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <Calculator className="w-4 h-4" />
                        SIMULADOR EXCLUSIVO
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                        ¿Cuánto te podemos prestar?
                    </h2>
                    <p className="text-gray-300 text-lg">
                        Calcula tu préstamo en segundos. Sin compromiso.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl"
                >

                    {/* Paso 1: Tipo de Garantía */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            1. ¿Qué vas a empeñar?
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {garantias.map((g) => (
                                <motion.button
                                    key={g.id}
                                    onClick={() => setGarantia(g.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`p-4 rounded-xl border-2 transition-all text-center ${garantia === g.id
                                            ? "border-[#1E3A5F] bg-[#1E3A5F]/5 text-[#1E3A5F] shadow-lg"
                                            : "border-gray-200 hover:border-[#1E3A5F]/50 text-gray-600"
                                        }`}
                                >
                                    <g.icon className="w-6 h-6 mx-auto mb-2" />
                                    <span className="text-sm font-medium">{g.name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Paso 2: Valor Estimado */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            2. ¿Cuánto vale aproximadamente? (S/)
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {montos.map((m) => (
                                <motion.button
                                    key={m}
                                    onClick={() => setMonto(m)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`px-6 py-3 rounded-xl border-2 font-bold transition-all ${monto === m
                                            ? "border-[#1E3A5F] bg-[#1E3A5F]/5 text-[#1E3A5F] shadow-lg"
                                            : "border-gray-200 hover:border-[#1E3A5F]/50 text-gray-600"
                                        }`}
                                >
                                    S/ {m.toLocaleString()}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Resultado */}
                    {montoEstimado && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#D4AF37]/10 rounded-2xl p-6 mb-8 text-center border-2 border-[#D4AF37]/30"
                        >
                            <p className="text-sm text-[#8B6914] font-medium mb-2">
                                Préstamo estimado para tu {garantiaSeleccionada?.name}:
                            </p>
                            <p className="text-5xl font-black text-[#1E3A5F]">
                                S/ {montoEstimado.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                *Monto referencial. El valor final depende de la evaluación presencial.
                            </p>
                        </motion.div>
                    )}

                    {/* CTA WhatsApp */}
                    <motion.a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <Button
                            className={`w-full h-16 text-xl font-bold rounded-2xl shadow-lg transition-all ${garantia && monto
                                    ? "bg-[#1E3A5F] hover:bg-[#152C4A] text-white shadow-[#1E3A5F]/25"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                            disabled={!garantia || !monto}
                        >
                            <MessageCircle className="w-6 h-6 mr-3" />
                            {montoEstimado ? "Confirmar por WhatsApp" : "Selecciona opciones arriba"}
                        </Button>
                    </motion.a>

                </motion.div>

            </div>
        </section>
    );
}
