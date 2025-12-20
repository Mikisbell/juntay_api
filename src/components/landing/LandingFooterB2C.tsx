import Link from "next/link";
import { Lock } from "lucide-react";

export function LandingFooterB2C() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">

                    <div>
                        <span className="text-2xl font-black text-white italic tracking-tighter">JUNTAY</span>
                        <p className="text-sm mt-2">Préstamos con garantía prendaria.</p>
                    </div>

                    <div className="text-sm">
                        <p>&copy; {new Date().getFullYear()} Grupo Rivamez. Todos los derechos reservados.</p>
                        <p className="mt-1">Jiron Cahuide 298, El Tambo, Huancayo.</p>
                    </div>

                    <div className="flex gap-4 text-sm">
                        <Link href="/login" className="flex items-center gap-2 hover:text-white transition-colors">
                            <Lock className="w-4 h-4" />
                            Acceso Staff
                        </Link>
                    </div>

                </div>
            </div>
        </footer>
    );
}
