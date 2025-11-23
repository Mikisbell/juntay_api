import { obtenerClientes } from '@/lib/actions/clientes-actions'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal, ShieldCheck, ShieldAlert, UserPlus, Phone, Mail } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'

export default async function ClientesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const params = await searchParams
    const query = params.q || ''
    const clientes = await obtenerClientes(query)

    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 bg-grid-slate-100 dark:bg-grid-slate-900">
            <div className="flex-1 space-y-8 p-8 pt-6 animate-in-fade-slide">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Directorio de Clientes</h2>
                        <p className="text-muted-foreground">Gestión de perfiles, historial crediticio y riesgo.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/mostrador/nuevo-empeno">
                            <Button className="rounded-full shadow-lg shadow-primary/20">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Nuevo Cliente
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <Card className="glass-panel border-0 shadow-xl">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Cartera de Clientes</CardTitle>
                                <CardDescription>
                                    Mostrando {clientes.length} resultados activos.
                                </CardDescription>
                            </div>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <form action="/dashboard/clientes" method="GET">
                                    <Input
                                        name="q"
                                        placeholder="Buscar por nombre, DNI o teléfono..."
                                        className="pl-10 rounded-full bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white transition-all"
                                        defaultValue={query}
                                    />
                                </form>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                                    <TableHead className="pl-6">Cliente</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Riesgo</TableHead>
                                    <TableHead className="text-right pr-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clientes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No se encontraron clientes.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    clientes.map((cliente) => (
                                        <TableRow key={cliente.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${cliente.nombres}`} />
                                                        <AvatarFallback>{cliente.nombres?.[0]}{cliente.apellido_paterno?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                                            {cliente.nombres} {cliente.apellido_paterno}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Registrado el {new Date(cliente.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{cliente.numero_documento}</span>
                                                    <span className="text-xs text-muted-foreground">{cliente.tipo_documento}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {cliente.telefono && (
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Phone className="mr-1 h-3 w-3" />
                                                            {cliente.telefono}
                                                        </div>
                                                    )}
                                                    {cliente.email && (
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Mail className="mr-1 h-3 w-3" />
                                                            {cliente.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-normal">
                                                    Activo
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Bajo</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem>Ver Perfil Completo</DropdownMenuItem>
                                                        <DropdownMenuItem>Historial de Créditos</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">Reportar Incidencia</DropdownMenuItem>
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
            </div>
        </div>
    )
}
