import Link from "next/link";
import { Lock, Zap, ShieldCheck } from "lucide-react";

export function LandingFooterB2C() {
    return (
        <footer className="bg-slate-950 text-slate-400 py-16 border-t border-white/5 relative overflow-hidden">

            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent blur-sm" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    <div className="col-span-1 lg:col-span-2">
                        <span className="text-3xl font-black text-white italic tracking-tighter">JUNTAY</span>
                        <p className="text-sm mt-4 max-w-xs leading-relaxed text-slate-500">
                            La casa de empeño más moderna y segura de Huancayo. Tecnología financiera al servicio de tu tranquilidad.
                        </p>
                        <div className="flex gap-4 mt-6">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-amber-500">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-emerald-500">
                                <Zap className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-amber-400 transition-colors">Términos y Condiciones</a></li>
                            <li><a href="#" className="hover:text-amber-400 transition-colors">Política de Privacidad</a></li>
                            <li><a href="#" className="hover:text-amber-400 transition-colors">Contrato de Adhesión</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-4">Empresa</h4>
                        <ul className="space-y-3 text-sm">
                            <li><span className="text-slate-500 block">Razón Social:</span> GRUPO RIVAMEZ S.A.C</li>
                            <li><span className="text-slate-500 block">RUC:</span> 20601234567</li>
                            <li>
                                <Link href="/login" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-white/5 px-3 py-1 rounded-full border border-white/10 hover:border-amber-500/50 mt-2">
                                    <Lock className="w-3 h-3" />
                                    <span>Acceso Staff</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
                    <p>&copy; {new Date().getFullYear()} Grupo Rivamez. Todos los derechos reservados.</p>
                    <p className="mt-2 md:mt-0 flex items-center gap-1">
                        Powered by <span className="font-bold text-slate-500">FreeCloud Systems</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
