import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShieldCheck, Banknote, Sparkles } from "lucide-react";

export function LandingHeroB2C() {
    return (
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-slate-950 overflow-hidden">

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">

                    {/* Left Content */}
                    <div className="order-2 lg:order-1 space-y-8 text-center lg:text-left">

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 text-sm font-bold tracking-wide backdrop-blur-md animate-fade-in-up">
                            <Sparkles className="w-4 h-4" />
                            <span>DINERO AL INSTANTE, SIN TRÁMITES</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1] drop-shadow-2xl">
                            Tu Oro vale <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-sm">MÁS AQUÍ</span>
                        </h1>

                        <p className="text-xl text-slate-300 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed border-l-2 border-amber-500/50 pl-6">
                            Empeña tus joyas y electrodomésticos con <span className="text-white font-bold">seguridad blindada</span> y la tasación más alta de Huancayo.
                        </p>

                        <div className="flex flex-col gap-6 max-w-md mx-auto lg:mx-0 pt-4">
                            <a
                                href="https://wa.me/51995060806?text=Hola%20Juntay,%20tengo%20un%20articulo%20para%20empeñar,%20quisiera%20saber%20cuanto%20me%20prestan."
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button className="w-full h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-2xl font-black rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] border-t border-white/20 flex items-center justify-center gap-4 transition-all hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] group">
                                    <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
                                    Cotizar por WhatsApp
                                </Button>
                            </a>
                            <p className="text-sm text-slate-400 font-medium flex items-center justify-center lg:justify-start gap-2 opacity-80">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Respuesta inmediata (Tiempo promedio: 2 min)
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-0 pt-8 border-t border-white/10 mt-8">
                            <div className="flex flex-col items-center lg:items-start pr-4">
                                <span className="text-3xl font-black text-white">100%</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Garantizado</span>
                            </div>
                            <div className="flex flex-col items-center lg:items-start border-l border-white/10 px-4">
                                <span className="text-3xl font-black text-white">0%</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Comisiones</span>
                            </div>
                            <div className="flex flex-col items-center lg:items-start border-l border-white/10 pl-4">
                                <span className="text-3xl font-black text-white">24h</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Vigilancia</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="order-1 lg:order-2 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-3xl blur-2xl transform rotate-6 scale-95" />

                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 transform transition-transform duration-500 group hover:scale-[1.02]">
                            <div className="absolute inset-0 bg-slate-950/20 z-10 group-hover:bg-transparent transition-colors duration-500" />
                            <Image
                                src="/landing/hero.png" // Generated Image
                                alt="Casa de Empeño Juntay Huancayo Interior Premium"
                                width={800}
                                height={800}
                                className="w-full h-auto object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 ease-out"
                                priority
                            />

                            {/* Premium Glass Card Overlay */}
                            <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl z-20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-white">Bóveda de Seguridad</p>
                                        <p className="text-sm text-slate-400">Tus bienes protegidos 24/7 en local propio.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge Gold */}
                        <div className="absolute -top-10 -right-6 lg:-right-12 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-slate-900 font-black text-center p-6 rounded-full shadow-[0_10px_40px_rgba(251,191,36,0.5)] w-36 h-36 flex flex-col justify-center transform rotate-12 z-30 border-4 border-slate-900/50">
                            <span className="text-xs font-bold tracking-widest opacity-80">RECIBE</span>
                            <span className="text-4xl leading-none tracking-tighter">CASH</span>
                            <span className="text-xs font-bold tracking-widest opacity-80 mt-1">AL TOQUE</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
