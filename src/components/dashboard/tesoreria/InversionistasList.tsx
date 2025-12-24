
'use client'

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoreHorizontal, Users, FileText, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { InversionistaDetalle } from "@/lib/actions/tesoreria-actions"
import { CreateInversionistaModal } from "./CreateInversionistaModal"
import { InversionistaModal } from "@/components/inversionistas"
import { ContratoPrestamistaModal } from "./ContratoPrestamistaModal"
import { ContratoSocioModal } from "./ContratoSocioModal"


interface InversionistasListProps {
    inversionistas: InversionistaDetalle[]
    empresaActual?: {
        nombre: string
        ruc: string
        direccion?: string
        representante?: string
    }
}

export function InversionistasList({ inversionistas, empresaActual }: InversionistasListProps) {
    const [editingInvestor, setEditingInvestor] = useState<InversionistaDetalle | null>(null)
    const [showNuevoModal, setShowNuevoModal] = useState(false)

    // Helper to extract contract props from flexible metadata
    const getContractProps = (inv: InversionistaDetalle) => {
        // Safe defaults for empresa if not provided
        const empresa = empresaActual || {
            nombre: "MI EMPRESA S.A.C.",
            ruc: "20123456789",
            representante: "Gerente General"
        }

        const commonProps = {
            inversionista: {
                nombre: inv.nombre_completo,
                dni: inv.numero_documento
            },
            empresa
        }

        // Parse metadata safely
        let meta: any = {}
        try {
            if (typeof inv.metadata === 'string') meta = JSON.parse(inv.metadata)
            else if (typeof inv.metadata === 'object') meta = inv.metadata
        } catch (e) { console.error("Error parsing metadata", e) }

        if (inv.tipo_relacion === 'SOCIO') {
            return {
                ...commonProps,
                terminos: {
                    monto: Number(inv.total_invertido) || 0,
                    porcentaje: Number(inv.participacion_porcentaje) || 0,
                    fechaIngreso: inv.fecha_ingreso,
                    formaPago: meta.tiene_cuenta_bancaria ? `Transferencia - ${meta.banco} ${meta.numero_cuenta}` : 'Efectivo',
                    notas: meta.notas
                }
            }
        } else {
            return {
                ...commonProps,
                terminos: {
                    monto: Number(inv.total_invertido) || 0,
                    tasaInteres: Number(meta.tasa_interes) || 0,
                    tipoTasa: meta.tipo_tasa || 'ANUAL',
                    plazoMeses: Number(meta.plazo_meses) || 0,
                    modalidadPago: meta.modalidad_pago || 'BULLET',
                    fechaIngreso: inv.fecha_ingreso,
                    fechaVencimiento: meta.fecha_vencimiento || '',
                    totalDevolver: Number(meta.total_a_devolver) || 0,
                    formaPago: meta.tiene_cuenta_bancaria ? `Depósito - ${meta.banco} ${meta.numero_cuenta}` : 'Efectivo',
                    notas: meta.notas
                }
            }
        }
    }

    return (
        <>
            {/* Nuevo Modal Modular */}
            <InversionistaModal
                open={showNuevoModal}
                onOpenChange={setShowNuevoModal}
            />

            {/* Modal viejo para edición - temporalmente */}
            {editingInvestor && (
                <CreateInversionistaModal
                    inversionistaToEdit={editingInvestor}
                    onOpenChange={(open) => !open && setEditingInvestor(null)}
                />
            )}

            <Card className="glass-panel border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Inversionistas & Socios</CardTitle>
                        <CardDescription>Gestión de stakeholders y contratos de inversión.</CardDescription>
                    </div>
                    <Button onClick={() => setShowNuevoModal(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Inversionista
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre Completo</TableHead>
                                <TableHead>Tipo Relación</TableHead>
                                <TableHead className="text-right">Participación</TableHead>
                                <TableHead className="text-right">Capital Inv.</TableHead>
                                <TableHead className="text-right">Rendimiento</TableHead>
                                <TableHead>Fecha Ingreso</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                                <TableHead className="w-[100px] text-right">Contrato</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inversionistas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                        No hay inversionistas registrados. Agrega uno para empezar.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inversionistas.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <Users className="h-4 w-4 text-slate-500" />
                                                </div>
                                                {inv.nombre_completo}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={inv.tipo_relacion === 'SOCIO' ? 'default' : 'secondary'}>
                                                {inv.tipo_relacion}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {inv.participacion_porcentaje ? `${inv.participacion_porcentaje}%` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {inv.total_invertido ? `S/ ${Number(inv.total_invertido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}` : 'S/ 0.00'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-emerald-600">
                                            {inv.rendimiento_acumulado ? `+S/ ${Number(inv.rendimiento_acumulado).toFixed(2)}` : 'S/ 0.00'}
                                        </TableCell>
                                        <TableCell>
                                            {inv.fecha_ingreso ? new Date(inv.fecha_ingreso).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={inv.activo ? 'outline' : 'destructive'} className="font-normal">
                                                {inv.activo ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {/* Contract Button */}
                                            {inv.tipo_relacion === 'SOCIO' ? (
                                                <ContratoSocioModal {...getContractProps(inv) as any} />
                                            ) : (
                                                <ContratoPrestamistaModal {...getContractProps(inv) as any} />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menú</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditingInvestor(inv)}>
                                                        Editar Datos
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toast.info("Historial de aportes pronto disponible")}>
                                                        Ver Aportes
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    )
}
