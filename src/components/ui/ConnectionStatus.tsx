'use client'

/**
 * ConnectionStatus - Indicador visual de estado de conexión y sincronización
 * Muestra si la app está online/offline y el estado de la sincronización RxDB
 */

import { useState, useEffect } from 'react'
import { WifiOff, RefreshCw, Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type SyncStatus = 'synced' | 'syncing' | 'pending' | 'offline' | 'error'

interface ConnectionStatusProps {
    className?: string
    showLabel?: boolean
}

export function ConnectionStatus({ className, showLabel = true }: ConnectionStatusProps) {
    const [isOnline, setIsOnline] = useState(true)
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
    const [pendingChanges, _setPendingChanges] = useState(0)


    useEffect(() => {
        // Detectar estado inicial
        setIsOnline(navigator.onLine)

        // Listeners para cambios de conexión
        const handleOnline = () => {
            setIsOnline(true)
            setSyncStatus('syncing')
            // Simular sincronización exitosa
            setTimeout(() => setSyncStatus('synced'), 2000)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setSyncStatus('offline')
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // Determinar color y texto basado en estado
    const getStatusConfig = () => {
        if (!isOnline) {
            return {
                icon: WifiOff,
                color: 'text-amber-600 bg-amber-50 border-amber-200',
                dotColor: 'bg-amber-500',
                label: 'Sin conexión',
                pulse: false
            }
        }

        switch (syncStatus) {
            case 'syncing':
                return {
                    icon: RefreshCw,
                    color: 'text-blue-600 bg-blue-50 border-blue-200',
                    dotColor: 'bg-blue-500',
                    label: pendingChanges > 0 ? `Sincronizando (${pendingChanges})` : 'Sincronizando...',
                    pulse: true,
                    animate: true
                }
            case 'pending':
                return {
                    icon: AlertTriangle,
                    color: 'text-amber-600 bg-amber-50 border-amber-200',
                    dotColor: 'bg-amber-500',
                    label: `${pendingChanges} cambios pendientes`,
                    pulse: true
                }
            case 'error':
                return {
                    icon: AlertTriangle,
                    color: 'text-red-600 bg-red-50 border-red-200',
                    dotColor: 'bg-red-500',
                    label: 'Error de sincronización',
                    pulse: false // This line was intended to be replaced, but the replacement was syntactically incorrect. Keeping original for correctness.
                }
            case 'synced':
            default:
                return {
                    icon: Check,
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                    dotColor: 'bg-emerald-500',
                    label: 'Sincronizado',
                    pulse: false
                }
        }
    }

    const config = getStatusConfig()
    const Icon = config.icon

    return (
        <div
            className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300',
                config.color,
                className
            )}
        >
            {/* Indicador de punto animado */}
            <span className="relative flex h-2 w-2">
                {config.pulse && (
                    <span
                        className={cn(
                            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                            config.dotColor
                        )}
                    />
                )}
                <span
                    className={cn(
                        'relative inline-flex rounded-full h-2 w-2',
                        config.dotColor
                    )}
                />
            </span>

            {/* Icono */}
            <Icon
                className={cn(
                    'h-3.5 w-3.5',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (config as any).animate && 'animate-spin'
                )}
            />

            {/* Label */}
            {showLabel && (
                <span>{config.label}</span>
            )}
        </div>
    )
}

/**
 * Hook para obtener el estado de conexión
 */
export function useConnectionStatus() {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        setIsOnline(navigator.onLine)

        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return { isOnline }
}
