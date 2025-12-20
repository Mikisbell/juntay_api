import Link from "next/link";
import { Zap } from "lucide-react";

export function LandingFooter() {
    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <span className="text-xl font-bold text-gray-900">JUNTAY</span>
                        <p className="mt-4 text-sm text-gray-500">
                            La plataforma líder para la gestión inteligente de garantías prendarias y créditos.
                        </p>
                    </div>

                    {/* Corporativo */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Corporativo</h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                    Grupo Rivamez
                                </a>
                            </li>
                            <li>
                                <a href="https://freecloud.pe" className="text-base text-gray-500 hover:text-gray-900 flex items-center gap-2">
                                    Technology by FreeCloud
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <Link href="#" className="text-base text-gray-500 hover:text-gray-900">
                                    Términos y Condiciones
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-base text-gray-500 hover:text-gray-900">
                                    Política de Privacidad
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-base text-gray-400">
                        &copy; {new Date().getFullYear()} JUNTAY. Una empresa de Grupo Rivamez. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-2 mt-4 md:mt-0 text-sm text-gray-400">
                        <Zap className="w-4 h-4" />
                        <span>Powered by <strong>FreeCloud</strong> Systems</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
