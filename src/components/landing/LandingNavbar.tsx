import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                                JUNTAY
                            </span>
                        </Link>
                    </div>

                    {/* Links desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Características
                        </Link>
                        <Link href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Precios
                        </Link>
                        <Link href="/login">
                            <Button variant="ghost" className="font-semibold text-gray-700">
                                Iniciar Sesión
                            </Button>
                        </Link>
                        <Link href="/login?signup=true">
                            <Button className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-700/20">
                                Empezar Gratis
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
