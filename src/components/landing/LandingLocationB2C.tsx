"use client";

import { MapPin, Clock, Phone } from "lucide-react";
import { motion } from "framer-motion";

export function LandingLocationB2C() {
    return (
        <section className="py-16 bg-[#1E3A5F]/5">
            <div className="max-w-7xl mx-auto px-4">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                        Encuéntranos en El Tambo
                    </h2>
                    <p className="text-lg text-gray-600">
                        Local propio. Ven cuando quieras.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">

                    {/* Info Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                    >
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-[#1E3A5F]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-[#1E3A5F]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Dirección</h3>
                                    <p className="text-gray-600">Jiron Cahuide 298</p>
                                    <p className="text-gray-600">El Tambo, Huancayo</p>
                                    <p className="text-sm text-[#D4AF37] font-medium mt-1">A 2 cuadras de la plaza</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-[#1E3A5F]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-6 h-6 text-[#1E3A5F]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Horario</h3>
                                    <p className="text-gray-600">Lunes a Sábado: 9am - 7pm</p>
                                    <p className="text-gray-600">Domingos: Cerrado</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-[#D4AF37]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                                    <a href="https://wa.me/51995060806" className="text-[#1E3A5F] font-bold text-lg hover:text-[#D4AF37] transition-colors">
                                        995 060 806
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Map */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm h-[350px] border border-gray-100"
                    >
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.621742403613!2d-75.22744822504629!3d-12.069654188169128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e964e50a5db25%3A0x63318f7823521631!2sJir%C3%B3n%20Cahuide%20298%2C%20Huancayo%2012007!5e0!3m2!1ses!2spe!4v1703000000000!5m2!1ses!2spe"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full"
                        />
                    </motion.div>

                </div>

            </div>
        </section>
    );
}
