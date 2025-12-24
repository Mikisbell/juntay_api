"use client"

import { SmartCreditForm } from "@/components/pos/SmartCreditForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Props = {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default function NuevoClientePage({ searchParams }: Props) {
    const dni = typeof searchParams.dni === 'string' ? searchParams.dni : undefined
    const tipo = typeof searchParams.tipo === 'string' && ['DNI', 'RUC', 'CE'].includes(searchParams.tipo)
        ? searchParams.tipo as 'DNI' | 'RUC' | 'CE'
        : undefined

    return (
        <div className="p-6 space-y-6">
            {/* Header con navegación */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/clientes">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Nuevo Cliente</h1>
                    <p className="text-sm text-slate-500">Registra un nuevo cliente en el sistema</p>
                </div>
            </div>

            {/* Formulario Unificado Smart POS */}
            <SmartCreditForm
                initialDNI={dni}
                initialTipoDoc={tipo}
            />
        </div>
    )
}
