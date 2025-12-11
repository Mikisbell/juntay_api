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
                // Aquí abriríamos el modal de "Nuevo Cliente" con los datos pre-llenados
                console.log("Datos AI:", data)
                toast.info(`IA detectó: ${data.dni || '?'} - ${data.nombre || '?'}`)
            }} />
            <Button className="gap-2 shadow-lg shadow-primary/20" onClick={handleNuevoCliente}>
                <UserPlus className="h-4 w-4" />
                Nuevo Cliente
            </Button>
        </div>
    )
}
