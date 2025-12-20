import { MapPin, Clock, Shield } from "lucide-react";

export function LandingLocationB2C() {
    return (
        <section className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-0 shadow-2xl rounded-3xl overflow-hidden bg-white">

                    {/* Info Panel */}
                    <div className="p-10 lg:p-16 flex flex-col justify-center bg-blue-900 text-white">
                        <h2 className="text-3xl font-black mb-6">Visítanos Hoy Mismo</h2>
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-bold text-white">Dirección</h3>
                                    <p className="text-blue-100 mt-1">Jiron Cahuide 298<br />El Tambo - Huancayo</p>
                                    <p className="text-xs text-blue-300 mt-2">(Referencia: Cerca a la Plaza principal)</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Clock className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-bold text-white">Horario de Atención</h3>
                                    <p className="text-blue-100 mt-1">Lunes a Sábado: 9:00 AM - 7:00 PM</p>
                                    <p className="text-blue-100">Domingos: Previa cita</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Shield className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-bold text-white">Local Seguro</h3>
                                    <p className="text-blue-100 mt-1">Contamos con seguridad privada y cámaras de vigilancia 24/7 para tu tranquilidad.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Placeholder */}
                    <div className="h-96 lg:h-auto bg-gray-200 w-full min-h-[400px]">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15607.72624317135!2d-75.2252345!3d-12.0487445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e964366601669%3A0x6295777bd3cc8235!2sEl%20Tambo%2C%20Huancayo!5e0!3m2!1ses!2spe!4v1703000000000!5m2!1ses!2spe"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
                        ></iframe>
                    </div>

                </div>
            </div>
        </section>
    );
}
