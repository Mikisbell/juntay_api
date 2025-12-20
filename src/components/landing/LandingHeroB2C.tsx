import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShieldCheck, Banknote } from "lucide-react";

export function LandingHeroB2C() {
    return (
        <div className="relative pt-24 pb-12 lg:pt-32 lg:pb-24 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left Content */}
                    <div className="order-2 lg:order-1 space-y-8 text-center lg:text-left">

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold border border-yellow-200 animate-pulse">
                            <Banknote className="w-4 h-4" />
                            <span>¡Dinero al Instante! Sin trámites bancarios</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-none">
                            ¿Necesitas efectivo <br />
                            <span className="text-blue-700 underline decoration-yellow-400 decoration-8 underline-offset-4">URGENTE?</span>
                        </h1>

                        <p className="text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 font-medium">
                            Empeña tus joyas, electrodomésticos o herramientas con la tasa más baja de Huancayo. <span className="text-gray-900 font-bold">Seguridad Total y Local Propio.</span>
                        </p>

                        <div className="flex flex-col gap-4 max-w-md mx-auto lg:mx-0">
                            <a
                                href="https://wa.me/51995060806?text=Hola%20Juntay,%20tengo%20un%20articulo%20para%20empeñar,%20quisiera%20saber%20cuanto%20me%20prestan."
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button className="w-full h-16 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-xl shadow-xl shadow-green-600/30 flex items-center justify-center gap-3 transition-all hover:-translate-y-1">
                                    <MessageCircle className="w-7 h-7" />
                                    Cotizar por WhatsApp
                                </Button>
                            </a>
                            <p className="text-sm text-gray-500 font-medium">
                                📷 Envía una foto y te decimos cuánto te prestamos.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-6 border-t border-gray-200">
                            <div className="flex flex-col items-center lg:items-start">
                                <span className="text-2xl font-black text-blue-900">100%</span>
                                <span className="text-xs font-bold text-gray-500 uppercase">Seguro</span>
                            </div>
                            <div className="flex flex-col items-center lg:items-start border-l border-gray-200 lg:pl-4">
                                <span className="text-2xl font-black text-blue-900">0%</span>
                                <span className="text-xs font-bold text-gray-500 uppercase">Comisiones</span>
                            </div>
                            <div className="flex flex-col items-center lg:items-start border-l border-gray-200 lg:pl-4">
                                <span className="text-2xl font-black text-blue-900">24h</span>
                                <span className="text-xs font-bold text-gray-500 uppercase">Vigilancia</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="order-1 lg:order-2 relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 group">
                            <Image
                                src="/landing/hero.png" // Generated Image
                                alt="Casa de Empeño Juntay Huancayo Interior"
                                width={800}
                                height={800}
                                className="w-full h-auto object-cover scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
                                priority
                            />
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-8 pt-16">
                                <div className="flex items-center gap-3 text-white">
                                    <ShieldCheck className="w-8 h-8 text-yellow-400" />
                                    <div>
                                        <p className="font-bold text-lg">Local Propio y Seguro</p>
                                        <p className="text-sm text-gray-300">Tus bienes guardados en bóveda.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -top-6 -right-6 md:-right-12 bg-yellow-400 text-blue-900 font-black text-center p-4 rounded-full shadow-lg w-32 h-32 flex flex-col justify-center transform rotate-12 z-20 border-4 border-white">
                            <span className="text-3xl leading-none">DINERO</span>
                            <span className="text-sm">AL TOQUE</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
