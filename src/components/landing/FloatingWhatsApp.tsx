"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function FloatingWhatsApp() {
    const whatsappLink = "https://wa.me/51995060806?text=Hola%20JUNTAY,%20necesito%20un%20pr%C3%A9stamo%20r%C3%A1pido";

    return (
        <motion.a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 200 }}

            className="fixed bottom-6 right-6 z-50 flex items-center justify-center bg-[#1E3A5F] hover:bg-[#152C4A] text-white w-12 h-12 rounded-full shadow-lg shadow-[#1E3A5F]/30 transition-all hover:scale-110 group"
            title="¿Tienes dudas? Contáctanos"
        >
            <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
                <MessageCircle className="w-6 h-6" />
            </motion.div>

            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-[#D4AF37] animate-ping opacity-20" />
        </motion.a>
    );
}
