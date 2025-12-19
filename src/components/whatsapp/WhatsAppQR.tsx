'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { getWahaScreenshot, getWahaSession } from '@/lib/actions/waha-actions';

export function WhatsAppQR() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [status, setStatus] = useState<'SCAN_QR' | 'WORKING' | 'FAILED' | 'STARTING'>('STARTING');
    const [error, setError] = useState<string | null>(null);

    const checkSession = async () => {
        try {
            const session = await getWahaSession();

            if (session.success && session.data) {
                // session.data ahora es un objeto (la sesión específica), no un array
                const sessionData = session.data;

                if (sessionData.status === 'WORKING') {
                    setStatus('WORKING');
                    setQrCode(null);
                    setError(null);
                } else if (sessionData.status === 'STARTING' || sessionData.status === 'CREATING') {
                    setStatus('STARTING');
                    setError("Iniciando motor de WhatsApp... Esto puede tardar unos minutos en el primer inicio.");
                } else if (sessionData.status === 'SCAN_QR') {
                    // Si está esperando QR, intentamos obtenerlo
                    await fetchQR();
                } else {
                    // Cualquier otro estado, intentamos obtener QR
                    await fetchQR();
                }
            } else {
                // Si falla la conexión, asumimos que está iniciando o caído
                setError("Esperando conexión con el servidor...");
                setStatus('STARTING');
            }
        } catch (e) {
            console.error(e);
            setError("Error de conexión");
            setStatus('FAILED');
        }
    };

    const fetchQR = async () => {
        setStatus('SCAN_QR');
        const result = await getWahaScreenshot();
        if (result.success && result.image) {
            setQrCode(result.image);
            setError(null);
        } else {
            // La sesión se iniciará automáticamente si es necesario
            setError(result.error || "Esperando código QR...");
        }
    };

    useEffect(() => {
        checkSession();
        // Polling cada 10 segundos para verificar estado
        const interval = setInterval(checkSession, 10000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {status === 'WORKING' ? (
                <div className="text-center space-y-4 py-6">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                        <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">¡Conectado!</h3>
                        <p className="text-sm text-slate-600 mt-1">WhatsApp listo</p>
                    </div>
                    <Button variant="outline" onClick={checkSession} size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Verificar
                    </Button>
                </div>
            ) : qrCode ? (
                <div className="flex flex-col items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={qrCode}
                        alt="WhatsApp QR"
                        className="w-[280px] h-[280px] object-contain rounded-lg border-2 border-green-500/20"
                    />
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Se actualiza cada 10s</span>
                    </div>
                </div>
            ) : (
                <div className="text-center space-y-4 py-6">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Iniciando...</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {error || "Conectando con el servidor"}
                        </p>
                    </div>
                    <Button variant="outline" onClick={checkSession} size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refrescar
                    </Button>
                </div>
            )}
        </>
    );
}
