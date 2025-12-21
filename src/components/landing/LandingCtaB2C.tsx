import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function LandingCtaB2C() {
    const whatsappLink = "https://wa.me/51995060806?text=Hola%20JUNTAY,%20quiero%20empe%C3%B1ar%20algo%20y%20necesito%20dinero%20r%C3%A1pido";

    return (
        <section className="py-16 bg-[#D4AF37]">
            <div className="max-w-3xl mx-auto px-4 text-center">

                <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                    ¿Listo para conseguir tu dinero?
                </h2>
                <p className="text-[#1E3A5F]/80 text-lg mb-8">
                    Escríbenos ahora y recibe tu cotización gratis en minutos
                </p>

                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button className="h-16 px-12 bg-[#1E3A5F] hover:bg-[#152C4A] text-white text-xl font-bold rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95">
                        <MessageCircle className="w-7 h-7 mr-3" />
                        Escribir por WhatsApp
                    </Button>
                </a>

                <p className="text-[#1E3A5F]/70 text-sm mt-6">
                    Jiron Cahuide 298, El Tambo • Lun-Sáb 9am-7pm
                </p>

            </div>
        </section>
    );
}
