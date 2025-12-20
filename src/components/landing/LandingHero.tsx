import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";

export function LandingHero() {
    return (
        <div className="relative overflow-hidden bg-white pt-16 lg:pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium">
                            <Zap className="w-4 h-4 text-blue-600" />
                            <span>Technology powered by FreeCloud</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                            El Sistema Operativo para <br className="hidden lg:block" />
                            <span className="text-blue-600">Casas de Empeño</span>
                        </h1>

                        <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                            JUNTAY centraliza tus contratos, garantías, caja y clientes en una plataforma blindada. Diseñada para escalar tu negocio con seguridad bancaria.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/login?signup=true">
                                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-blue-700 hover:bg-blue-800 shadow-xl shadow-blue-700/20 rounded-xl">
                                    Empezar Prueba Gratis
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="#features">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl">
                                    Cómo funciona
                                </Button>
                            </Link>
                        </div>

                        <div className="flex items-center gap-6 pt-4 text-sm text-gray-500 font-medium">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                                Datos Aislados
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                                Cifrado Militar
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                                Soporte 24/7
                            </div>
                        </div>
                    </div>

                    {/* Right Image/Mockup */}
                    <div className="relative lg:h-[600px] w-full flex items-center justify-center">
                        {/* Gradient Blob Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -z-10" />

                        {/* Abstract Dashboard UI Representation */}
                        <div className="relative w-full max-w-lg aspect-[4/3] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            {/* Header Mockup */}
                            <div className="h-12 border-b border-gray-100 bg-gray-50 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            {/* Body Mockup */}
                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                        <div className="h-8 w-40 bg-gray-900 rounded"></div>
                                    </div>
                                    <div className="h-10 w-32 bg-blue-600 rounded-lg"></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-20 w-full bg-gray-50 rounded-xl border border-gray-100"></div>
                                    <div className="h-20 w-full bg-gray-50 rounded-xl border border-gray-100"></div>
                                    <div className="h-20 w-full bg-gray-50 rounded-xl border border-gray-100"></div>
                                </div>
                            </div>

                            {/* Floating Card */}
                            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 w-48">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">Pago Recibido</div>
                                </div>
                                <div className="text-2xl font-bold text-green-600">+ S/ 350.00</div>
                                <div className="text-xs text-gray-400 mt-1">Hace 2 minutos</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
