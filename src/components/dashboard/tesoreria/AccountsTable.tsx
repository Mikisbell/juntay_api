
'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Wallet, Landmark, Smartphone, MoreHorizontal, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { CuentaFinancieraDetalle } from "@/lib/actions/tesoreria-actions"
import { toast } from "sonner"
import { CreateAccountModal } from "./CreateAccountModal"
import { AccountMovementsModal } from "./AccountMovementsModal"
import { useState } from "react"

interface AccountsTableProps {
    cuentas: CuentaFinancieraDetalle[]
}

export function AccountsTable({ cuentas }: AccountsTableProps) {
    const [selectedAccount, setSelectedAccount] = useState<{ id: string, nombre: string } | null>(null)
    const [isMovementsOpen, setIsMovementsOpen] = useState(false)

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'EFECTIVO': return <Wallet className="h-4 w-4 text-emerald-500" />
            case 'BANCO': return <Landmark className="h-4 w-4 text-blue-500" />
            case 'DIGITAL': return <Smartphone className="h-4 w-4 text-purple-500" />
            default: return <Wallet className="h-4 w-4" />
        }
    }

    const getBadgeVariant = (tipo: string) => {
        switch (tipo) {
            case 'EFECTIVO': return "default" // Emerald in theme? using defaults for now
            case 'BANCO': return "secondary"
            case 'DIGITAL': return "outline"
            default: return "secondary"
        }
    }

    const handleOpenMovements = (cuenta: CuentaFinancieraDetalle) => {
        setSelectedAccount({ id: cuenta.id, nombre: cuenta.nombre })
        setIsMovementsOpen(true)
    }

    return (
        <>
            <Card className="glass-panel border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Cuentas Financieras</span>
                        <CreateAccountModal />
                    </CardTitle>
                    <CardDescription>
                        Gestión centralizada de bóvedas y cuentas bancarias
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Nombre de Cuenta</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Saldo Disponible</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cuentas.map((cuenta) => (
                                <TableRow key={cuenta.id}>
                                    <TableCell>
                                        <div className="flex items-center justify-center p-2 rounded-full bg-slate-100 dark:bg-slate-800">
                                            {getIcon(cuenta.tipo)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{cuenta.nombre}</span>
                                            {cuenta.es_principal && (
                                                <span className="flex items-center text-[10px] text-yellow-600 font-bold mt-0.5">
                                                    <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                                                    PRINCIPAL
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <Badge variant={getBadgeVariant(cuenta.tipo) as any}>
                                            {cuenta.tipo}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-lg">
                                        {formatMoney(cuenta.saldo)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cuenta.activo
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {cuenta.activo ? 'Activa' : 'Inactiva'}
                                        </div>
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
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenMovements(cuenta)}>
                                                    Ver Movimientos
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toast.info("Transferencias en desarrollo")}>
                                                    Transferir Fondos
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toast.info("Edición en desarrollo")}>
                                                    Editar Detalles
                                                </DropdownMenuItem>
                                                {cuenta.tipo === 'EFECTIVO' && !cuenta.es_principal && (
                                                    <DropdownMenuItem
                                                        className="text-yellow-600"
                                                        onClick={() => toast.warning("Cambio de bóveda principal requiere autorización")}
                                                    >
                                                        Marcar Principal
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {selectedAccount && (
                <AccountMovementsModal
                    open={isMovementsOpen}
                    onOpenChange={setIsMovementsOpen}
                    accountId={selectedAccount.id}
                    accountName={selectedAccount.nombre}
                />
            )}
        </>
    )
}
