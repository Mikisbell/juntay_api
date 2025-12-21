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
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1E3A5F] hover:bg-[#152C4A] text-white pl-5 pr-6 py-4 rounded-full shadow-2xl shadow-[#1E3A5F]/40 transition-all hover:scale-105 group"
        >
            <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
                <MessageCircle className="w-7 h-7" />
            </motion.div>
            <span className="font-bold text-lg hidden sm:inline">¿Tienes dudas?</span>

            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-[#D4AF37] animate-ping opacity-20" />
        </motion.a>
    );
}
