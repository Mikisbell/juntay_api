import Link from "next/link";
import { Lock } from "lucide-react";

export function LandingFooterB2C() {
    return (
        <footer className="bg-[#1E3A5F] text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4">

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">

                    <div>
                        <span className="text-2xl font-black text-white">JUNTAY</span>
                        <p className="text-sm mt-2 text-gray-400">Casa de Empeño en Huancayo</p>
                        <p className="text-xs mt-1 text-gray-500">RUC: 20601234567 • Regulados por SBS</p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2">
                        <Link
                            href="/login"
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#D4AF37] transition-colors"
                        >
                            <Lock className="w-4 h-4" />
                            Acceso Empleados
                        </Link>
                        <p className="text-xs text-gray-600">
                            © {new Date().getFullYear()} Grupo Rivamez S.A.C.
                        </p>
                    </div>

                </div>

            </div>
        </footer>
    );
}
