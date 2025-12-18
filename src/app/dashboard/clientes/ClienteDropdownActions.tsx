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
import { MoreHorizontal, User, FileText, MessageSquare, AlertTriangle, UserCheck, UserX, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { CentroComunicacionCliente } from "@/components/business/CentroComunicacionCliente"
import { toggleClienteActivo } from "@/lib/actions/clientes-actions"
import { toast } from "sonner"

interface ClienteDropdownActionsProps {
    cliente: {
        id: string
        nombres: string
        apellido_paterno: string
        telefono_principal: string | null
        activo: boolean
        deuda_total?: number  // Para mostrar Renovar solo si tiene deuda
    }
}

export function ClienteDropdownActions({ cliente }: ClienteDropdownActionsProps) {
    const router = useRouter()
    const [modalMensajeOpen, setModalMensajeOpen] = useState(false)
    const [isToggling, setIsToggling] = useState(false)

    const nombreCompleto = `${cliente.nombres} ${cliente.apellido_paterno}`

    const handleVerPerfil = () => {
        router.push(`/dashboard/clientes/${cliente.id}`)
    }

    const handleHistorial = () => {
        router.push(`/dashboard/contratos?cliente=${cliente.id}`)
    }

    const handleRenovar = () => {
        router.push(`/dashboard/contratos?cliente=${cliente.id}&accion=renovar`)
    }

    const handleEnviarMensaje = () => {
        setModalMensajeOpen(true)
    }

    const handleToggleActivo = async () => {
        setIsToggling(true)
        try {
            const nuevoEstado = !cliente.activo
            const result = await toggleClienteActivo(cliente.id, nuevoEstado)
            if (result.success) {
                toast.success(result.message)
                router.refresh()
            }
        } catch (error) {
            toast.error('Error al cambiar estado del cliente')
            console.error(error)
        } finally {
            setIsToggling(false)
        }
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

                    {/* Renovar Crédito - Solo si tiene deuda activa */}
                    {cliente.deuda_total && cliente.deuda_total > 0 && cliente.activo && (
                        <DropdownMenuItem onSelect={handleRenovar} className="cursor-pointer text-blue-600 hover:text-blue-700">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Renovar Crédito
                        </DropdownMenuItem>
                    )}

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

                    {/* Toggle Suspender/Reactivar */}
                    <DropdownMenuItem
                        onSelect={handleToggleActivo}
                        disabled={isToggling}
                        className={`cursor-pointer ${cliente.activo ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                    >
                        {cliente.activo ? (
                            <>
                                <UserX className="h-4 w-4 mr-2" />
                                {isToggling ? 'Suspendiendo...' : 'Suspender Cliente'}
                            </>
                        ) : (
                            <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                {isToggling ? 'Reactivando...' : 'Reactivar Cliente'}
                            </>
                        )}
                    </DropdownMenuItem>

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

