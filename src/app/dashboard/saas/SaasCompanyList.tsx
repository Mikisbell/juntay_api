"use client"

import { switchCompany } from "@/lib/actions/saas-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCcw, LogIn } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Company {
    id: string
    nombre_comercial: string | null
    razon_social: string | null
    email: string | null
    ruc: string
    activo: boolean
    created_at: string
    usuarios: { count: number }[]
}

interface Props {
    companies: Company[]
    currentEmpresaId: string | null
}

export function SaasCompanyList({ companies, currentEmpresaId }: Props) {
    const router = useRouter()
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})

    const handleSwitch = async (companyId: string, companyName: string) => {
        try {
            setLoadingMap(prev => ({ ...prev, [companyId]: true }))

            await switchCompany(companyId)

            toast.success(`Empresa Cambiada: ${companyName}`)

            // Forzar recarga completa para limpiar estados de React/Contextos antiguos
            window.location.href = '/dashboard'

        } catch (error: any) {
            toast.error(error.message || "Error al cambiar empresa")
            setLoadingMap(prev => ({ ...prev, [companyId]: false }))
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>RUC</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {companies.map((company) => {
                    const isCurrent = company.id === currentEmpresaId
                    const isLoading = loadingMap[company.id]

                    return (
                        <TableRow key={company.id} className={isCurrent ? "bg-slate-50 border-l-4 border-l-indigo-500" : ""}>
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span>{company.nombre_comercial || company.razon_social}</span>
                                        {isCurrent && <Badge variant="secondary" className="text-[10px]">ACTUAL</Badge>}
                                    </div>
                                    <span className="text-xs text-muted-foreground">{company.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>{company.ruc}</TableCell>
                            <TableCell>{company.usuarios?.[0]?.count || 0}</TableCell>
                            <TableCell>
                                <Badge variant={company.activo ? "default" : "destructive"}>
                                    {company.activo ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant={isCurrent ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => !isCurrent && handleSwitch(company.id, company.nombre_comercial || company.razon_social || 'Empresa')}
                                    disabled={isCurrent || isLoading}
                                    className={isCurrent ? "opacity-50 cursor-default" : ""}
                                >
                                    {isLoading ? (
                                        <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <LogIn className="h-4 w-4 mr-2" />
                                    )}
                                    {isCurrent ? "En uso" : "Operar"}
                                </Button>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}
