import Image from "next/image";
import { Camera, MessageSquareText, HandCoins, ArrowRight } from "lucide-react";

export function LandingProcessB2C() {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden" id="como-funciona">

            {/* Background Decor */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-sm text-amber-500 font-bold tracking-[0.2em] uppercase mb-4 animate-pulse">Proceso Simplificado</h2>
                    <p className="text-4xl md:text-5xl font-black text-white leading-tight">
                        Efectivo en tu bolsillo <br />
                        <span className="text-slate-500">en 3 pasos.</span>
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Context Image - Phone Floating effect */}
                    <div className="relative order-2 lg:order-1">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[80px] transform scale-75" />
                        <div className="relative z-10 p-4 border border-white/10 rounded-[3rem] bg-slate-900/50 backdrop-blur-xl shadow-2xl transform rotate-[-3deg] hover:rotate-0 transition-transform duration-700">
                            <Image
                                src="/landing/appraisal.png"
                                alt="Cotización Premium WhatsApp"
                                width={600}
                                height={800}
                                className="rounded-[2.5rem] shadow-inner grayscale-[20%]"
                            />

                            {/* Floating Notification */}
                            <div className="absolute top-12 -right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                    <MessageSquareText className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-white/60 font-medium">JUNTAY Tasador</p>
                                    <p className="text-sm text-white font-bold">Oferta: S/ 1,200.00 ✅</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Steps Cards */}
                    <div className="space-y-6 order-1 lg:order-2">
                        {/* Step 1 */}
                        <div className="group relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:bg-slate-800/60 hover:border-amber-500/30 transition-all duration-300">
                            <div className="flex gap-6 items-start">
                                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/50 transition-colors duration-300 shadow-lg">
                                    <Camera className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">1. Fotografía tu Bien</h3>
                                    <p className="text-slate-400 leading-relaxed font-medium">
                                        Saca tu celular y toma fotos claras de tus joyas, laptops o herramientas.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="group relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:bg-slate-800/60 hover:border-emerald-500/30 transition-all duration-300">
                            <div className="flex gap-6 items-start">
                                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-colors duration-300 shadow-lg">
                                    <MessageSquareText className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">2. Envía por WhatsApp</h3>
                                    <p className="text-slate-400 leading-relaxed font-medium">
                                        Mándanos las fotos al <strong>995 060 806</strong>. Recibe tu oferta en minutos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="group relative p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:bg-slate-800/60 hover:border-amber-500/30 transition-all duration-300">
                            {/* Connector Line */}
                            <div className="absolute left-[3.25rem] -top-8 h-8 w-px bg-gradient-to-b from-white/5 to-white/10" />

                            <div className="flex gap-6 items-start">
                                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
                                    <HandCoins className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">3. Retira tu Efectivo</h3>
                                    <p className="text-slate-400 leading-relaxed font-medium">
                                        Ven a nuestro local seguro en <strong>El Tambo</strong> y llévate el dinero al instante.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
