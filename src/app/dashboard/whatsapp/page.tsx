import { WhatsAppQR } from "@/components/whatsapp/WhatsAppQR";
import { Phone } from "lucide-react";

export default function WhatsAppPage() {
    return (
        <div className="space-y-4">
            {/* Compact Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-md">
                    <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">WhatsApp Business</h1>
                    <p className="text-sm text-slate-600">Vincula tu cuenta para enviar notificaciones</p>
                </div>
            </div>

            {/* Compact Grid */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid md:grid-cols-[auto,1fr] gap-6 p-6">
                    {/* QR Code - Compact */}
                    <div className="flex items-center justify-center">
                        <WhatsAppQR />
                    </div>

                    {/* Instructions - Compact */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-slate-900">Cómo Conectar</h3>

                        <div className="space-y-3">
                            <div className="flex gap-2 items-start">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">1</div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">Abre WhatsApp</p>
                                    <p className="text-xs text-slate-600">En tu celular</p>
                                </div>
                            </div>

                            <div className="flex gap-2 items-start">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">2</div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">Dispositivos Vinculados</p>
                                    <p className="text-xs text-slate-600">Menú (⋮) → Configuración</p>
                                </div>
                            </div>

                            <div className="flex gap-2 items-start">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">3</div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">Vincular Dispositivo</p>
                                    <p className="text-xs text-slate-600">Toca &quot;+&quot;</p>
                                </div>
                            </div>

                            <div className="flex gap-2 items-start">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">4</div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">Escanea el Código</p>
                                    <p className="text-xs text-slate-600">Apunta al QR</p>
                                </div>
                            </div>
                        </div>

                        {/* Security - Minimal */}
                        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded px-3 py-2 border border-green-200">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="font-medium">Conexión segura</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Anti-Bloqueo Reminders */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-amber-900 mb-2">Recuerda - Para Evitar Bloqueos:</h3>
                        <ul className="space-y-1 text-xs text-amber-800">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span><strong>Máximo 100 mensajes/hora</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span><strong>5-10 segundos</strong> entre cada mensaje</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span><strong>Personaliza</strong> cada mensaje (usa nombre del cliente)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span><strong>NO envíes</strong> a la madrugada (02:00-07:00 AM)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span>Registra el número como <strong>WhatsApp Business oficial</strong></span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

