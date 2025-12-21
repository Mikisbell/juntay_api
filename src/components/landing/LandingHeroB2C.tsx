"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MessageCircle, Shield, UserX, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Colores de marca JUNTAY (del logo)
// Navy: #1E3A5F / Gold: #D4AF37

export function LandingHeroB2C() {
    const whatsappLink = "https://wa.me/51995060806?text=Hola%20JUNTAY,%20necesito%20un%20pr%C3%A9stamo.%20Tengo%20para%20empe%C3%B1ar:%20";

    return (
        <section className="relative pt-24 pb-20 overflow-hidden">
            {/* Background Gradient Mesh - Navy/Gold tones */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#1E3A5F]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#D4AF37]/15 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-amber-100 rounded-full blur-[80px] opacity-40" />
            </div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left: Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="order-2 lg:order-1"
                    >
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 bg-[#1E3A5F]/10 text-[#1E3A5F] px-3 py-1.5 rounded-full text-xs font-bold"
                            >
                                <Shield className="w-3 h-3" />
                                Regulados SBS
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center gap-2 bg-[#D4AF37]/20 text-[#8B6914] px-3 py-1.5 rounded-full text-xs font-bold"
                            >
                                <UserX className="w-3 h-3" />
                                Sin Infocorp
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold"
                            >
                                <Clock className="w-3 h-3" />
                                5 minutos
                            </motion.span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
                            Préstamo al instante
                            <span className="block text-[#1E3A5F]">
                                con tu garantía
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
                            Empeña tus <strong className="text-gray-900">joyas, celulares, laptops o vehículos</strong> y llévate efectivo hoy mismo.
                        </p>

                        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4 mb-8">
                            <p className="text-[#8B6914] font-medium text-sm">
                                ✨ <strong>No revisamos centrales de riesgo.</strong> Todos son bienvenidos.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <motion.a
                                href="#simulador"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button className="w-full sm:w-auto h-14 px-8 bg-[#1E3A5F] hover:bg-[#152C4A] text-white text-lg font-bold rounded-xl shadow-lg shadow-[#1E3A5F]/25">
                                    Simular mi Préstamo
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </motion.a>
                            <motion.a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button variant="outline" className="w-full sm:w-auto h-14 px-8 border-2 border-[#1E3A5F] text-[#1E3A5F] text-lg font-bold rounded-xl hover:bg-[#1E3A5F]/5">
                                    <MessageCircle className="w-5 h-5 mr-2 text-[#D4AF37]" />
                                    WhatsApp
                                </Button>
                            </motion.a>
                        </div>

                        {/* Micro-copy */}
                        <p className="text-sm text-gray-500 mt-6">
                            📍 Jiron Cahuide 298, El Tambo, Huancayo
                        </p>
                    </motion.div>

                    {/* Right: Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="order-1 lg:order-2 relative"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-300/50 border border-white/50">
                            <Image
                                src="/landing/hero-cash.png"
                                alt="Cliente recibiendo dinero en JUNTAY"
                                width={800}
                                height={600}
                                className="w-full h-auto object-cover"
                                priority
                            />

                            {/* Floating Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-gray-100"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center">
                                        <span className="text-2xl">💰</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">María de El Tambo</p>
                                        <p className="text-sm text-gray-500">Recibió S/ 2,500 en 8 minutos</p>
                                    </div>
                                    <div className="ml-auto text-[#D4AF37] text-sm font-bold">
                                        Hoy
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Decorative blob */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#1E3A5F] rounded-full blur-3xl opacity-10 -z-10" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
