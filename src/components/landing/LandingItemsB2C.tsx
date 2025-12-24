"use client";

import { Smartphone, Laptop, Watch, Gem, Wrench, Bike } from "lucide-react";
import { motion } from "framer-motion";

const items = [
    { icon: Gem, name: "Joyas de Oro", desc: "Anillos, cadenas, aretes" },
    { icon: Watch, name: "Relojes", desc: "Cualquier marca" },
    { icon: Smartphone, name: "Celulares", desc: "iPhone, Samsung, Xiaomi" },
    { icon: Laptop, name: "Laptops", desc: "HP, Lenovo, Dell, Mac" },
    { icon: Wrench, name: "Herramientas", desc: "Taladros, soldadoras" },
    { icon: Bike, name: "Motos", desc: "Con documentos al día" },
];

export function LandingItemsB2C() {
    return (
        <section className="py-16 bg-white dark:bg-[#0B1120]" id="assets">
            <div className="max-w-7xl mx-auto px-4">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
                        ¿Qué puedes empeñar?
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-slate-400">
                        Aceptamos casi todo lo que tenga valor. Aquí los más comunes:
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="bg-gray-50 hover:bg-[#D4AF37]/10 border border-gray-100 hover:border-[#D4AF37]/30 dark:bg-slate-900 dark:border-white/10 dark:hover:bg-[#D4AF37]/20 rounded-2xl p-6 text-center transition-all group cursor-default"
                        >
                            <div className="w-14 h-14 mx-auto mb-4 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:bg-[#1E3A5F]/10 dark:group-hover:bg-[#D4AF37]/20 transition-all">
                                <item.icon className="w-7 h-7 text-[#1E3A5F] group-hover:text-[#D4AF37] dark:text-blue-300 dark:group-hover:text-[#D4AF37] transition-colors" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center text-gray-500 mt-8 text-sm"
                >
                    ¿Tienes algo diferente? <span className="text-[#D4AF37] font-semibold">Escríbenos y te cotizamos</span>
                </motion.p>

            </div>
        </section>
    );
}
