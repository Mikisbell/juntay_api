"use client";

import Image from "next/image";
import { Camera, MessageCircle, Banknote, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
    {
        icon: Camera,
        title: "1. Toma una foto",
        desc: "Fotografía tu artículo con buena luz. Mientras más claro, mejor cotización.",
        image: "/landing/appraisal.png",
    },
    {
        icon: MessageCircle,
        title: "2. Envía por WhatsApp",
        desc: "Mándanos las fotos al 995 060 806. Te respondemos en minutos con tu oferta.",
        image: "/landing/private-appraisal.png",
    },
    {
        icon: Banknote,
        title: "3. Recoge tu efectivo",
        desc: "Ven a nuestro local con tu DNI. Firmas y sales con el dinero en la mano.",
        image: "/landing/hero-cash.png",
    },
];

export function LandingProcessB2C() {
    return (
        <section className="py-20 bg-white" id="process">
            <div className="max-w-7xl mx-auto px-4">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-flex items-center gap-2 bg-[#1E3A5F]/10 text-[#1E3A5F] px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <CheckCircle className="w-4 h-4" />
                        PROCESO SIMPLE
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                        En 3 pasos tienes tu dinero
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Sin colas, sin papeleo, sin complicaciones. Más de <strong className="text-[#1E3A5F]">500 clientes</strong> ya lo comprobaron.
                    </p>
                </motion.div>

                <div className="space-y-16 lg:space-y-24">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${index % 2 === 1 ? "lg:grid-flow-dense" : ""
                                }`}
                        >
                            {/* Image */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className={`relative rounded-2xl overflow-hidden shadow-xl ${index % 2 === 1 ? "lg:col-start-2" : ""
                                    }`}
                            >
                                <Image
                                    src={step.image}
                                    alt={step.title}
                                    width={600}
                                    height={400}
                                    className="w-full h-64 lg:h-80 object-cover"
                                />
                                <div className="absolute top-4 left-4 bg-[#D4AF37] text-[#1E3A5F] w-10 h-10 rounded-full flex items-center justify-center font-black text-lg">
                                    {index + 1}
                                </div>
                            </motion.div>

                            {/* Content */}
                            <div className={index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}>
                                <div className="w-16 h-16 bg-[#1E3A5F]/10 rounded-2xl flex items-center justify-center mb-6">
                                    <step.icon className="w-8 h-8 text-[#1E3A5F]" />
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    {step.desc}
                                </p>

                                {/* Micro-benefit for each step */}
                                <div className="mt-6 flex items-center gap-2 text-sm text-[#D4AF37] font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    {index === 0 && "Puedes enviar varias fotos para mejor cotización"}
                                    {index === 1 && "Respuesta garantizada en menos de 10 minutos"}
                                    {index === 2 && "Abiertos de lunes a sábado 9am - 7pm"}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
