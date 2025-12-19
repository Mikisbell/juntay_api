
'use client'

import { useState } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MoreHorizontal, Users, FileText } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { InversionistaDetalle } from "@/lib/actions/tesoreria-actions"
import { CreateInversionistaModal } from "./CreateInversionistaModal"

interface InversionistasListProps {
    inversionistas: InversionistaDetalle[]
}

export function InversionistasList({ inversionistas }: InversionistasListProps) {
    const [editingInvestor, setEditingInvestor] = useState<InversionistaDetalle | null>(null)

    return (
        <>
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
                        <CardDescription>Gestión de stakeholders y fuentes de capital.</CardDescription>
                    </div>
                    <CreateInversionistaModal />
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
                                <TableHead>Desde</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inversionistas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
                                            {inv.total_invertido ? `S/ ${inv.total_invertido.toFixed(2)}` : 'S/ 0.00'}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-emerald-600">
                                            {inv.rendimiento_acumulado ? `+S/ ${inv.rendimiento_acumulado.toFixed(2)}` : 'S/ 0.00'}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(inv.fecha_ingreso).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={inv.activo ? 'outline' : 'destructive'} className="font-normal">
                                                {inv.activo ? 'Activo' : 'Inactivo'}
                                            </Badge>
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
                                                    <DropdownMenuItem onClick={() => toast.info("Funcionalidad de contratos detallada en desarrollo")}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Ver Contrato
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
