import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, MapPin } from "lucide-react";

export function LandingNavbarB2C() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex flex-col justify-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="text-3xl font-black italic tracking-tighter text-white group-hover:text-amber-400 transition-colors duration-300">
                                JUNTAY
                            </span>
                        </Link>
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] -mt-1 ml-1 text-shadow-sm">Casa de Empeño</span>
                    </div>

                    {/* Links desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        <div className="flex items-center gap-3 text-slate-300/80">
                            <div className="p-1.5 rounded-full bg-white/5 border border-white/10">
                                <MapPin className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ubicación</span>
                                <span className="text-sm font-medium text-slate-200">Jiron Cahuide 298, El Tambo</span>
                            </div>
                        </div>

                        <a
                            href="https://wa.me/51995060806?text=Hola%20Juntay,%20quiero%20cotizar%20un%20articulo."
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-base rounded-full px-8 py-6 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] border border-yellow-200/50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                                <Phone className="w-5 h-5" />
                                995 060 806
                            </Button>
                        </a>
                    </div>

                    {/* Mobile CTA (Solo icono) */}
                    <div className="md:hidden">
                        <a
                            href="https://wa.me/51995060806?text=Hola%20Juntay,%20quiero%20cotizar%20un%20articulo."
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button size="icon" className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 rounded-full h-12 w-12 shadow-[0_0_15px_rgba(251,191,36,0.4)] border border-yellow-200/50">
                                <Phone className="w-6 h-6" />
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
