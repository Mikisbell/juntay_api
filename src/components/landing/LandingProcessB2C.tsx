import Image from "next/image";
import { Camera, MessageSquareText, HandCoins } from "lucide-react";

export function LandingProcessB2C() {
    return (
        <section className="py-20 bg-white" id="como-funciona">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-base text-blue-600 font-bold tracking-wide uppercase mb-2">Simple y Rápido</h2>
                    <p className="text-4xl font-black text-gray-900 leading-tight">
                        Empeña sin salir de casa en <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">3 Pasos Simples</span>
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Visual Steps */}
                    <div className="space-y-12">
                        {/* Step 1 */}
                        <div className="flex gap-6 items-start group">
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <Camera className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Toma una foto</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Saca tu celular y toma fotos claras de tus joyas de oro, laptops, televisores o herramientas.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-6 items-start group">
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                <MessageSquareText className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Envíala por WhatsApp</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Mándanos las fotos al <strong>995 060 806</strong>. Nuestros expertos tasarán tu artículo en minutos y te darán una oferta.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-6 items-start group">
                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300">
                                <HandCoins className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Recoge tu dinero</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Si te gusta la oferta, ven a nuestro local en <strong>El Tambo</strong>. Verificamos el ítem y te entregamos el efectivo al instante.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Context Image */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-100/50 rounded-full blur-3xl transform rotate-12 scale-75"></div>
                        <Image
                            src="/landing/appraisal.png"
                            alt="Cotización por WhatsApp"
                            width={600}
                            height={800}
                            className="relative z-10 w-full h-auto rounded-3xl shadow-2xl border-2 border-gray-100 transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
