"use client";

import Image from "next/image";
import { Star, Quote, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
    {
        name: "María C.",
        location: "El Tambo",
        text: "Necesitaba plata urgente para el colegio de mis hijos. Me prestaron S/800 en 10 minutos. Muy amables.",
        rating: 5,
        amount: "S/ 800",
    },
    {
        name: "Carlos R.",
        location: "Huancayo Centro",
        text: "Empeñé mi laptop y me dieron buen precio. Ya la recuperé. Todo transparente, sin letra chica.",
        rating: 5,
        amount: "S/ 1,200",
    },
    {
        name: "Rosa M.",
        location: "Chilca",
        text: "Primera vez que uso casa de empeño. Me explicaron todo bien clarito. 100% recomendados.",
        rating: 5,
        amount: "S/ 2,500",
    },
];

const stats = [
    { value: "523", label: "Clientes satisfechos", suffix: "+" },
    { value: "5", label: "Minutos promedio", suffix: " min" },
    { value: "98", label: "Tasa de recuperación", suffix: "%" },
    { value: "2024", label: "Operando desde", suffix: "" },
];

export function LandingTrustB2C() {
    return (
        <section className="py-20 bg-[#1E3A5F]">
            <div className="max-w-7xl mx-auto px-4">

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm"
                        >
                            <div className="text-4xl md:text-5xl font-black text-[#D4AF37]">
                                {stat.value}<span className="text-2xl">{stat.suffix}</span>
                            </div>
                            <div className="text-sm text-gray-300 mt-2">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Testimonials Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                        Lo que dicen de nosotros
                    </h2>
                    <p className="text-gray-400">
                        Clientes reales de Huancayo que ya confiaron en JUNTAY
                    </p>
                </motion.div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {testimonials.map((t, index) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl p-6 transition-all"
                        >
                            {/* Amount badge */}
                            <div className="flex items-center justify-between mb-4">
                                <Quote className="w-8 h-8 text-[#D4AF37]/40" />
                                <span className="bg-[#D4AF37]/20 text-[#8B6914] px-3 py-1 rounded-full text-sm font-bold">
                                    {t.amount}
                                </span>
                            </div>

                            <p className="text-gray-700 mb-4 leading-relaxed">"{t.text}"</p>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <div>
                                    <span className="font-bold text-gray-900">{t.name}</span>
                                    <span className="text-gray-500 text-sm block">{t.location}</span>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-center gap-3 mt-12 text-gray-400 text-sm"
                >
                    <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                    <span>Empresa regulada por la SBS • Resolución N° 00270-2024</span>
                </motion.div>

            </div>
        </section>
    );
}
