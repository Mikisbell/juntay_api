import Link from "next/link";
import { Lock } from "lucide-react";

export function LandingFooterB2C() {
    return (
        <footer className="bg-[#0F1E33] text-gray-400 py-16 pb-24 border-t border-white/5 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-white/10 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Col 1: Brand */}
                    <div className="md:col-span-2">
                        <span className="text-2xl font-black text-white tracking-tight">JUNTAY</span>
                        <p className="mt-4 text-sm leading-relaxed max-w-xs text-gray-400">
                            Soluciones financieras inmediatas, seguras y transparentes.
                            Respaldo garantizado y regulación SBS para tu tranquilidad.
                        </p>
                        <div className="mt-6 flex flex-col gap-1 text-xs text-gray-500">
                            <p>RUC: 20601234567</p>
                            <p>Registro SBS: Nº 0345-2024</p>
                        </div>
                    </div>

                    {/* Col 2: Navigation */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Explora</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#simulador" className="hover:text-[#D4AF37] transition-colors">Simular Préstamo</a></li>
                            <li><a href="#process" className="hover:text-[#D4AF37] transition-colors">¿Cómo funciona?</a></li>
                            <li><a href="#assets" className="hover:text-[#D4AF37] transition-colors">Artículos Aceptados</a></li>
                        </ul>
                    </div>

                    {/* Col 3: Legal & Admin */}
                    <div>
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Términos y Condiciones</a></li>
                            <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Política de Privacidad</a></li>
                            <li>
                                <Link href="/login" className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors group">
                                    <Lock className="w-3 h-3 group-hover:text-[#D4AF37]" />
                                    Acceso Personal
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                    <p>© {new Date().getFullYear()} Grupo Rivamez S.A.C. Todos los derechos reservados.</p>
                    <p>Hecho con ❤️ en Huancayo, Perú</p>
                </div>
            </div>
        </footer>
    );
}
