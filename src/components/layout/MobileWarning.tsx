"use client";

import { useState, useEffect } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Solo mostrar en pantallas pequeñas
    const checkSize = () => {
      setShow(window.innerWidth < 768);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center gap-4">
          <div className="relative">
            <Smartphone className="h-16 w-16 text-slate-400" />
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <Monitor className="h-16 w-16 text-emerald-500" />
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Usa un Dispositivo más Grande
          </h2>
          <p className="text-slate-600 text-sm">
            El dashboard de JUNTAY está optimizado para pantallas de tablet o
            escritorio (768px+)
          </p>
        </div>

        {/* Info */}
        <div className="bg-slate-50 rounded-lg p-4 text-left space-y-2 text-sm">
          <p className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span className="text-slate-700">
              Accede desde tu computadora o tablet
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span className="text-slate-700">
              Resolución mínima: 768px de ancho
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            <span className="text-slate-700">
              Navegadores: Chrome, Firefox, Safari, Edge
            </span>
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={() => window.location.href = "/"}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Volver al Inicio
        </Button>

        {/* Fine print */}
        <p className="text-xs text-slate-400">
          Versión móvil próximamente
        </p>
      </div>
    </div>
  );
}
