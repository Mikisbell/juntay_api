"use client"

import { Button } from "@/components/ui/button"
import { SmartPasteButton } from "@/components/ui/smart-paste-button"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ClientesActions() {
    const router = useRouter()

    const handleNuevoCliente = () => {
        router.push('/dashboard/clientes/nuevo')
    }

    return (
        <div className="flex items-center gap-2">
            <SmartPasteButton onParsed={(data) => {
                if (data.dni) {
                    toast.success("Datos detectados", { description: "Redirigiendo a registro..." })
                    // Redirigir con DNI pre-llenado en query params
                    const params = new URLSearchParams()
                    params.set('dni', data.dni)
                    // Inferir tipo de documento (8 digitos = DNI, 11 = RUC)
                    if (data.dni.length === 11) params.set('tipo', 'RUC')
                    else params.set('tipo', 'DNI')

                    router.push(`/dashboard/clientes/nuevo?${params.toString()}`)
                } else {
                    toast.error("No se detectó un DNI/RUC válido")
                }
            }} />
            <Button className="gap-2 shadow-lg shadow-primary/20" onClick={handleNuevoCliente}>
                <UserPlus className="h-4 w-4" />
                Nuevo Cliente
            </Button>
        </div>
    )
}
