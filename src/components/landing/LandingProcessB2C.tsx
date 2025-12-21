"use client";

import { Camera, MessageCircle, Banknote } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
    {
        icon: Camera,
        title: "1. Toma una foto",
        desc: "Fotografía tu artículo con buena luz. Mientras más claro, mejor cotización.",
    },
    {
        icon: MessageCircle,
        title: "2. Envía por WhatsApp",
        desc: "Mándanos las fotos al 995 060 806. Te respondemos en minutos con tu oferta.",
    },
    {
        icon: Banknote,
        title: "3. Recoge tu dinero",
        desc: "Ven a nuestro local en El Tambo con tu DNI. Firmas y te llevas el efectivo.",
    },
];

export function LandingProcessB2C() {
    return (
        <section className="py-16 bg-[#1E3A5F]/5" id="process">
            <div className="max-w-7xl mx-auto px-4">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                        Así de fácil es
                    </h2>
                    <p className="text-lg text-gray-600">
                        Sin colas, sin papeleo, sin complicaciones
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15 }}
                            className="relative"
                        >
                            {/* Connector line for desktop */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-[#D4AF37]/30" />
                            )}

                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-xl relative z-10 transition-shadow border border-gray-100 hover:border-[#D4AF37]/30"
                            >
                                <div className="w-16 h-16 mx-auto mb-6 bg-[#1E3A5F]/10 rounded-2xl flex items-center justify-center">
                                    <step.icon className="w-8 h-8 text-[#1E3A5F]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-600">{step.desc}</p>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
