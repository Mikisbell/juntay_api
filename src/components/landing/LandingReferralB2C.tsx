import { Gift, Users, Banknote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingReferralB2C() {
    const whatsappLink = "https://wa.me/51995060806?text=Hola%20JUNTAY,%20quiero%20participar%20en%20el%20programa%20Refiere%20y%20Gana";

    return (
        <section className="py-16 bg-gradient-to-r from-[#D4AF37] to-[#B8962E]">
            <div className="max-w-5xl mx-auto px-4">

                <div className="grid md:grid-cols-2 gap-10 items-center">

                    {/* Left: Info */}
                    <div className="text-[#1E3A5F]">
                        <div className="inline-flex items-center gap-2 bg-white/30 px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <Gift className="w-4 h-4" />
                            PROGRAMA EXCLUSIVO
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black mb-4">
                            ¡Refiere y Gana S/50!
                        </h2>

                        <p className="text-[#1E3A5F]/80 text-lg mb-8 leading-relaxed">
                            Recomienda JUNTAY a un amigo y gana <strong className="text-[#1E3A5F]">S/50 en efectivo</strong> por cada persona que obtenga un préstamo con nosotros.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span>Tu amigo obtiene su préstamo</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                                <span>Nos dice que tú lo referiste</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                                    <Banknote className="w-5 h-5" />
                                </div>
                                <span><strong>Tú recibes S/50 en efectivo</strong></span>
                            </div>
                        </div>

                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <Button className="h-14 px-8 bg-[#1E3A5F] hover:bg-[#152C4A] text-white font-bold text-lg rounded-xl shadow-lg">
                                Quiero Participar
                            </Button>
                        </a>
                    </div>

                    {/* Right: Big Number */}
                    <div className="text-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-10 border border-white/30">
                            <p className="text-[#1E3A5F]/80 text-sm uppercase tracking-widest mb-2">Ganas por cada referido</p>
                            <p className="text-8xl md:text-9xl font-black text-[#1E3A5F] leading-none">
                                S/50
                            </p>
                            <p className="text-[#1E3A5F]/70 mt-4">Sin límite de referidos</p>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}
