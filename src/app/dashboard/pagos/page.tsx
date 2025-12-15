'use client'

import { PagosPanelOffline } from '@/components/pagos/PagosPanelOffline'
import { useQuery } from '@tanstack/react-query'
import { obtenerEstadoCaja } from '@/lib/actions/caja-actions'
import { CardSkeleton } from '@/components/ui/skeletons'
import { StatusAlert } from '@/components/layout/StatusAlert'
import { STATUS_MESSAGES } from '@/lib/constants/messages'
import { DollarSign, Wifi, WifiOff } from 'lucide-react'
import { useRxDB } from '@/lib/rxdb/hooks'
import { Badge } from '@/components/ui/badge'

export default function PagosPage() {
    const { isOnline } = useRxDB()

    const { data: estadoCaja, isLoading, error } = useQuery({
        queryKey: ['caja-estado'],
        queryFn: () => obtenerEstadoCaja(),
        staleTime: 2 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
    })

    // Header común para todos los estados
    const PageHeader = () => (
        <header className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2">
                    <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-emerald-600" />
                    Gestión de Pagos
                </h1>
                <p className="text-sm lg:text-base text-muted-foreground mt-1">
                    Busque por DNI o nombre del cliente para procesar renovaciones y desempeños
                </p>
            </div>
            <Badge variant={isOnline ? 'default' : 'secondary'} className="gap-1">
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? 'Online' : 'Offline'}
            </Badge>
        </header>
    )

    if (isLoading) {
        return (
            <div className="space-y-4 lg:space-y-6">
                <PageHeader />
                <CardSkeleton />
            </div>
        )
    }

    // En modo offline, permitir operaciones incluso sin verificar caja
    if (!isOnline && (!estadoCaja || error)) {
        return (
            <div className="space-y-4 lg:space-y-6">
                <PageHeader />
                <StatusAlert
                    variant="warning"
                    title="Modo Offline"
                    description="Operando sin conexión. Los pagos se sincronizarán cuando vuelva la conexión."
                />
                {/* Usar ID temporal para caja en modo offline */}
                <PagosPanelOffline
                    cajaId="offline-temp"
                    usuarioId="offline-user"
                />
            </div>
        )
    }

    if (error || !estadoCaja) {
        return (
            <div className="space-y-4 lg:space-y-6">
                <PageHeader />
                <StatusAlert
                    variant="error"
                    title={STATUS_MESSAGES.cajaCerrada.title}
                    description={STATUS_MESSAGES.cajaCerrada.description}
                />
            </div>
        )
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            <PageHeader />
            <PagosPanelOffline
                cajaId={estadoCaja.id}
                usuarioId={estadoCaja.usuarioId}
            />
        </div>
    )
}
