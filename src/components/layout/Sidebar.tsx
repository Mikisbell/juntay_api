'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    PlusCircle,
    Search,
    DollarSign,
    Package,
    Settings,
    LogOut,
    Menu,
    X,
    Gavel,
    FileText,
    Landmark,
    Activity
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const menuItems = [
    {
        category: 'OPERACIONES',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
            { label: 'Nuevo Empeño', icon: PlusCircle, href: '/dashboard/mostrador/nuevo-empeno' },
            { label: 'Gestionar Contratos', icon: FileText, href: '/dashboard/contratos' },
            { label: 'Registrar Pago', icon: DollarSign, href: '/dashboard/pagos' },
            { label: 'Caja Operativa', icon: DollarSign, href: '/dashboard/caja' },
        ]
    },
    {
        category: 'ADMINISTRACIÓN',
        items: [
            { label: 'Tesorería', icon: Landmark, href: '/dashboard/admin/tesoreria' },
            { label: 'Monitor Cajas', icon: Activity, href: '/dashboard/admin/monitor-cajas' },
            { label: 'Bóveda', icon: Package, href: '/dashboard/inventario' },
        ]
    },
    // The original INVENTARIO category is removed as Bóveda is moved
    {
        category: 'ADMINISTRACIÓN',
        items: [
            { label: 'Remates', icon: Gavel, href: '/dashboard/remates' },
            { label: 'Reporte Caja', icon: Settings, href: '/dashboard/reportes/caja-diaria' },
            { label: 'Reporte Cartera', icon: Settings, href: '/dashboard/reportes/cartera' },
            { label: 'Configuración', icon: Settings, href: '/dashboard/configuracion' },
        ]
    }
]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile Trigger */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden fixed top-4 left-4 z-50 text-slate-900"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X /> : <Menu />}
            </Button>

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-800">
                        <h1 className="text-xl font-bold text-white tracking-wider">JUNTAY</h1>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
                        {menuItems.map((group, idx) => (
                            <div key={idx}>
                                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    {group.category}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                prefetch={true}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                                    isActive
                                                        ? "bg-slate-800 text-white"
                                                        : "hover:bg-slate-800/50 hover:text-white"
                                                )}
                                            >
                                                <item.icon className="w-5 h-5" />
                                                {item.label}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    )
}
