import { Instrument_Sans } from "next/font/google"; // Use modern font if possible, or fallback
import "@/src/app/globals.css";

const font = Instrument_Sans({ subsets: ["latin"] });

export const metadata = {
    title: "Juntay - Tu Casa de Empeño Digital",
    description: "Gestiona tu casa de empeño con seguridad de nivel bancario. Sistema SaaS Nº1 en Perú.",
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`min-h-screen bg-black text-white ${font.className}`}>
            {/* Navbar placeholder */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="text-xl font-bold text-gold-500 tracking-tighter">
                        JUNTAY
                    </div>
                    <div className="flex gap-4">
                        <button className="text-sm font-medium text-white/80 hover:text-white">Login</button>
                        <button className="bg-gold-500 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gold-400 transition-colors">
                            Empezar Gratis
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-16">
                {children}
            </main>

            {/* Footer minimal */}
            <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">
                © 2026 Juntay Inc. Security First.
            </footer>
        </div>
    );
}
