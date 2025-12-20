import Link from 'next/link'
import {
    Settings,
    Users,
    Wallet,
    Monitor,
    DollarSign,
    Shield
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Página principal de Administración
 * 
 * Hub de navegación a todas las secciones admin
 */
export default function AdminPage() {
    const secciones = [
        {
            titulo: 'Centro de Monitoreo',
            descripcion: 'KPIs, alertas, reportes y auditoría',
            href: '/dashboard/admin/monitoreo',
            icon: Monitor,
            color: 'text-blue-600 bg-blue-100',
            destacado: true
        },
        {
            titulo: 'Tesorería',
            descripcion: 'Flujo de caja y movimientos financieros',
            href: '/dashboard/admin/tesoreria',
            icon: DollarSign,
            color: 'text-green-600 bg-green-100'
        },
        {
            titulo: 'Monitor de Cajas',
            descripcion: 'Estado de cajas operativas',
            href: '/dashboard/admin/monitor-cajas',
            icon: Wallet,
            color: 'text-purple-600 bg-purple-100'
        },
        {
            titulo: 'Empleados',
            descripcion: 'Gestión de usuarios y permisos',
            href: '/dashboard/admin/empleados',
            icon: Users,
            color: 'text-orange-600 bg-orange-100'
        },
        {
            titulo: 'Inversionistas',
            descripcion: 'Contratos y rendimientos',
            href: '/dashboard/admin/inversionistas',
            icon: Shield,
            color: 'text-indigo-600 bg-indigo-100'
        },
        {
            titulo: 'Configuración',
            descripcion: 'Parámetros del sistema',
            href: '/dashboard/admin/configuracion',
            icon: Settings,
            color: 'text-gray-600 bg-gray-100'
        }
    ]

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
                <p className="text-muted-foreground">
                    Gestión y monitoreo del sistema
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {secciones.map((seccion) => {
                    const Icon = seccion.icon
                    return (
                        <Link key={seccion.href} href={seccion.href}>
                            <Card className={`h-full hover:border-primary/50 transition-all cursor-pointer ${seccion.destacado ? 'ring-2 ring-blue-500/20 border-blue-200' : ''}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${seccion.color}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{seccion.titulo}</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{seccion.descripcion}</CardDescription>
                                    {seccion.destacado && (
                                        <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                            Nuevo
                                        </span>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
