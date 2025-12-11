"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, User, FileText, MessageSquare, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { CentroComunicacionCliente } from "@/components/business/CentroComunicacionCliente"

interface ClienteDropdownActionsProps {
    cliente: {
        id: string
        nombres: string
        apellido_paterno: string
        telefono_principal: string | null
    }
}

export function ClienteDropdownActions({ cliente }: ClienteDropdownActionsProps) {
    const router = useRouter()
    const [modalMensajeOpen, setModalMensajeOpen] = useState(false)

    const nombreCompleto = `${cliente.nombres} ${cliente.apellido_paterno}`

    const handleVerPerfil = () => {
        router.push(`/dashboard/clientes/${cliente.id}`)
    }

    const handleHistorial = () => {
        router.push(`/dashboard/contratos?cliente=${cliente.id}`)
    }

    const handleEnviarMensaje = () => {
        setModalMensajeOpen(true)
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>

                    <DropdownMenuItem onSelect={handleVerPerfil} className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Ver Perfil Completo
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={handleHistorial} className="cursor-pointer">
                        <FileText className="h-4 w-4 mr-2" />
                        Historial de Créditos
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onSelect={cliente.telefono_principal ? handleEnviarMensaje : undefined}
                        className={`cursor-pointer ${cliente.telefono_principal ? 'text-green-600' : 'text-gray-400'}`}
                        disabled={!cliente.telefono_principal}
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Enviar WhatsApp {!cliente.telefono_principal && '(sin teléfono)'}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="text-red-600 cursor-pointer">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Reportar Incidencia
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CentroComunicacionCliente
                open={modalMensajeOpen}
                onOpenChange={setModalMensajeOpen}
                cliente={{
                    id: cliente.id,
                    nombre: nombreCompleto,
                    telefono: cliente.telefono_principal,
                    score: 100 // Mock, idealmente vendría del cliente
                }}
            />
        </>
    )
}
