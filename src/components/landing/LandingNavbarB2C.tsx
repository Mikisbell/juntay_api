import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, MapPin } from "lucide-react";

export function LandingNavbarB2C() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex flex-col justify-center">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-3xl font-black italic tracking-tighter text-blue-900">
                                JUNTAY
                            </span>
                        </Link>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest -mt-1 ml-1">Casa de Empeño</span>
                    </div>

                    {/* Links desktop */}
                    <div className="hidden md:flex items-center space-x-6">
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <span className="text-sm font-medium">Jiron Cahuide 298, El Tambo, Huancayo</span>
                        </div>

                        <a
                            href="https://wa.me/51995060806?text=Hola%20Juntay,%20quiero%20cotizar%20un%20articulo."
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-full px-8 py-6 shadow-green-600/30 shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
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
                            <Button size="icon" className="bg-green-600 hover:bg-green-700 text-white rounded-full h-12 w-12 shadow-lg">
                                <Phone className="w-6 h-6" />
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
