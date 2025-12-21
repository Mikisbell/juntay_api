"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
    {
        name: "María C.",
        text: "Necesitaba plata urgente para el colegio de mis hijos. Me prestaron S/800 en 10 minutos. Muy amables.",
        rating: 5,
    },
    {
        name: "Carlos R.",
        text: "Empeñé mi laptop y me dieron buen precio. Ya la recuperé. Todo transparente.",
        rating: 5,
    },
    {
        name: "Rosa M.",
        text: "Primera vez que uso casa de empeño. Me explicaron todo bien clarito. Recomendados.",
        rating: 5,
    },
];

export function LandingTrustB2C() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap justify-center gap-8 mb-16 pb-16 border-b border-gray-100"
                >
                    <div className="text-center">
                        <div className="text-4xl font-black text-[#1E3A5F]">+500</div>
                        <div className="text-sm text-gray-500 mt-1">Clientes satisfechos</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black text-[#1E3A5F]">5 min</div>
                        <div className="text-sm text-gray-500 mt-1">Tiempo promedio</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black text-[#D4AF37]">SBS</div>
                        <div className="text-sm text-gray-500 mt-1">Empresa regulada</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black text-[#1E3A5F]">2024</div>
                        <div className="text-sm text-gray-500 mt-1">En Huancayo desde</div>
                    </div>
                </motion.div>

                {/* Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                        Lo que dicen nuestros clientes
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {testimonials.map((t, index) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-gray-50 hover:bg-[#D4AF37]/5 rounded-2xl p-6 transition-colors border border-transparent hover:border-[#D4AF37]/20"
                        >
                            <Quote className="w-8 h-8 text-[#D4AF37]/40 mb-4" />
                            <p className="text-gray-700 mb-4 leading-relaxed">"{t.text}"</p>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900">{t.name}</span>
                                <div className="flex gap-1">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
