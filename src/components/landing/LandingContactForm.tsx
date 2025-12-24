"use client";

import { useState } from "react";
import { registrarLead } from "@/lib/actions/landing-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, Send } from "lucide-react";
import { motion } from "framer-motion";

export function LandingContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        const res = await registrarLead(formData);
        setIsSubmitting(false);

        if (res?.error) {
            alert(res.error); // Simple alert for landing
        } else {
            setIsSuccess(true);
        }
    }

    if (isSuccess) {
        return (
            <section className="py-20 bg-[#0B1120] relative overflow-hidden" id="contacto">
                <div className="max-w-md mx-auto px-4 text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/5 backdrop-blur-xl border border-[#D4AF37]/30 rounded-3xl p-8"
                    >
                        <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-[#D4AF37]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">¡Solicitud Recibida!</h3>
                        <p className="text-slate-300 mb-6">Un asesor de <span className="text-[#D4AF37]">JUNTAY</span> analizará tu caso y te escribirá en unos minutos.</p>
                        <Button
                            onClick={() => setIsSuccess(false)}
                            variant="outline"
                            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B1120]"
                        >
                            Volver
                        </Button>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 bg-[#0B1120] relative" id="contacto">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1E3A5F]/20 rounded-full blur-[100px] -z-10" />

            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                        Consigue tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-amber-200">Oferta Ahora</span>
                    </h2>
                    <p className="text-lg text-slate-400">
                        Déjanos tus datos y te contactaremos con una propuesta preliminar.
                    </p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
                >
                    {/* Gold accent line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] via-amber-200 to-[#D4AF37]" />

                    <form action={handleSubmit} className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-300">Tu Nombre</label>
                            <Input
                                name="nombre"
                                placeholder="Ej: Juan Pérez"
                                required
                                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-[#D4AF37] h-12 rounded-xl"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-300">WhatsApp / Teléfono</label>
                            <Input
                                name="telefono"
                                type="tel"
                                placeholder="999 000 000"
                                required
                                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-[#D4AF37] h-12 rounded-xl"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-300">¿Qué artículo tienes?</label>
                            <Input
                                name="articulo"
                                placeholder="Ej: Anillo de oro, Laptop HP..."
                                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-[#D4AF37] h-12 rounded-xl"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-300">Monto deseado (aprox)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">S/</span>
                                <Input
                                    name="monto"
                                    type="number"
                                    placeholder="1000"
                                    className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-[#D4AF37] h-12 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <label className="text-sm font-medium text-slate-300">Mensaje opcional</label>
                            <Textarea
                                name="mensaje"
                                placeholder="Detalles extra sobre tu artículo..."
                                className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-[#D4AF37] min-h-[100px] rounded-xl"
                            />
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-14 bg-[#D4AF37] hover:bg-[#B5952F] text-[#0B1120] text-lg font-bold rounded-xl shadow-lg shadow-[#D4AF37]/20 transition-all"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Enviar Solicitud
                                        <Send className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                            <p className="text-center text-xs text-slate-500 mt-4">
                                Al enviar, aceptas ser contactado por WhatsApp. Tus datos están protegidos.
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}
