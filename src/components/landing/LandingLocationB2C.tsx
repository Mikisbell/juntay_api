import { MapPin, Clock, Shield, Star } from "lucide-react";

export function LandingLocationB2C() {
    return (
        <section className="bg-slate-950 py-24 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/10 relative group">

                    {/* Gradient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Info Panel */}
                    <div className="p-10 lg:p-16 flex flex-col justify-center relative z-10">
                        <div className="inline-flex items-center gap-1 mb-6">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="ml-2 text-sm text-slate-400 font-medium">Top Rated en Huancayo</span>
                        </div>

                        <h2 className="text-4xl font-black text-white mb-10 tracking-tight">
                            Visita Nuestra <br />
                            <span className="text-amber-400">Sede Central</span>
                        </h2>

                        <div className="space-y-10">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
                                    <MapPin className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Dirección</h3>
                                    <p className="text-slate-400 mt-1 text-lg">Jiron Cahuide 298<br />El Tambo - Huancayo</p>
                                    <p className="text-xs text-amber-500/80 mt-2 font-medium uppercase tracking-wider">★ A 2 cuadras de la plaza</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
                                    <Clock className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Horario Extendido</h3>
                                    <p className="text-slate-400 mt-1">Lunes a Sábado: 9:00 AM - 7:00 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Zona Segura</h3>
                                    <p className="text-slate-400 mt-1">Local monitoreado con seguridad privada para tu total tranquilidad.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dark Styled Map */}
                    <div className="h-96 lg:h-auto bg-slate-800 w-full min-h-[500px] relative overflow-hidden">
                        <div className="absolute inset-0 z-0 bg-slate-900 animate-pulse" /> {/* Placeholder while loading */}
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.621742403613!2d-75.22744822504629!3d-12.069654188169128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e964e50a5db25%3A0x63318f7823521631!2sJir%C3%B3n%20Cahuide%20298%2C%20Huancayo%2012007!5e0!3m2!1ses!2spe!4v1703000000000!5m2!1ses!2spe"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%) opacity(85%)' }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full relative z-10 opacity-70 hover:opacity-100 transition-opacity duration-500"
                        ></iframe>

                        {/* Overlay Text on Map */}
                        <div className="absolute bottom-6 right-6 z-20 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl">
                            <span className="text-xs font-bold text-white">📍 Jiron Cahuide 298</span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
