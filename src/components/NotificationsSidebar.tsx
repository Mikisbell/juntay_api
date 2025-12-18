'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
    Bell, X, Check, Clock, AlertTriangle, CreditCard,
    Wallet, RefreshCw, TrendingUp, MessageSquare, Filter,
    ChevronRight, CheckCircle2, XCircle, Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatearSoles } from '@/lib/utils/decimal'

// Types
type NotificationType = 'payment' | 'expiry' | 'overdue' | 'renewal' | 'caja' | 'goal' | 'system'
type NotificationPriority = 'critical' | 'high' | 'medium' | 'low'

interface Notification {
    id: string
    type: NotificationType
    priority: NotificationPriority
    title: string
    message: string
    amount?: number
    timestamp: Date
    read: boolean
    actionUrl?: string
    actionLabel?: string
    clientName?: string
    contractCode?: string
}

interface NotificationsSidebarProps {
    isOpen: boolean
    onClose: () => void
}

// Priority config
const priorityConfig: Record<NotificationPriority, { color: string; bgColor: string; label: string }> = {
    critical: { color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', label: 'Crítico' },
    high: { color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200', label: 'Alto' },
    medium: { color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', label: 'Medio' },
    low: { color: 'text-slate-500', bgColor: 'bg-slate-50 border-slate-200', label: 'Bajo' }
}

// Icon mapping
const typeIcons: Record<NotificationType, React.ReactNode> = {
    payment: <CreditCard className="h-4 w-4 text-emerald-500" />,
    expiry: <Clock className="h-4 w-4 text-amber-500" />,
    overdue: <AlertTriangle className="h-4 w-4 text-red-500" />,
    renewal: <RefreshCw className="h-4 w-4 text-blue-500" />,
    caja: <Wallet className="h-4 w-4 text-purple-500" />,
    goal: <TrendingUp className="h-4 w-4 text-emerald-500" />,
    system: <Bell className="h-4 w-4 text-slate-500" />
}

export function NotificationsSidebar({ isOpen, onClose }: NotificationsSidebarProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all')
    const supabase = createClient()

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const hoy = new Date()
                const notifs: Notification[] = []

                // 1. PAGOS RECIBIDOS (últimas 24h)
                const ayer = new Date(hoy)
                ayer.setDate(ayer.getDate() - 1)

                const { data: payments } = await supabase
                    .from('pagos')
                    .select('id, monto, fecha_pago, creditos!inner(codigo_credito, clientes!inner(nombres, apellido_paterno))')
                    .gte('fecha_pago', ayer.toISOString())
                    .order('fecha_pago', { ascending: false })
                    .limit(10)

                payments?.forEach((p: unknown) => {
                    const payment = p as {
                        id: string;
                        monto: number;
                        fecha_pago: string;
                        creditos: { codigo_credito: string; clientes: { nombres: string; apellido_paterno: string } }
                    }
                    notifs.push({
                        id: `payment-${payment.id}`,
                        type: 'payment',
                        priority: 'low',
                        title: 'Pago Recibido',
                        message: `${payment.creditos.clientes.nombres} ${payment.creditos.clientes.apellido_paterno}`,
                        amount: payment.monto,
                        timestamp: new Date(payment.fecha_pago),
                        read: false,
                        clientName: `${payment.creditos.clientes.nombres} ${payment.creditos.clientes.apellido_paterno}`,
                        contractCode: payment.creditos.codigo_credito
                    })
                })

                // 2. CONTRATOS VENCIDOS (CRÍTICO)
                const { data: overdue } = await supabase
                    .from('creditos')
                    .select('id, codigo_credito, fecha_vencimiento, saldo_pendiente, clientes!inner(id, nombres, apellido_paterno, telefono_principal)')
                    .lt('fecha_vencimiento', hoy.toISOString().split('T')[0])
                    .in('estado_detallado', ['vencido', 'en_mora'])
                    .order('fecha_vencimiento', { ascending: true })
                    .limit(10)

                overdue?.forEach((c: unknown) => {
                    const contract = c as {
                        id: string;
                        codigo_credito: string;
                        fecha_vencimiento: string;
                        saldo_pendiente: number;
                        clientes: { id: string; nombres: string; apellido_paterno: string; telefono_principal: string }
                    }
                    const daysOverdue = Math.ceil((hoy.getTime() - new Date(contract.fecha_vencimiento).getTime()) / (1000 * 60 * 60 * 24))
                    notifs.push({
                        id: `overdue-${contract.id}`,
                        type: 'overdue',
                        priority: daysOverdue > 7 ? 'critical' : 'high',
                        title: `Vencido hace ${daysOverdue} días`,
                        message: `${contract.clientes.nombres} ${contract.clientes.apellido_paterno}`,
                        amount: contract.saldo_pendiente,
                        timestamp: new Date(contract.fecha_vencimiento),
                        read: false,
                        actionUrl: `/dashboard/clientes/${contract.clientes.id}`,
                        actionLabel: 'Ver Cliente',
                        clientName: `${contract.clientes.nombres} ${contract.clientes.apellido_paterno}`,
                        contractCode: contract.codigo_credito
                    })
                })

                // 3. VENCEN HOY (ALTO)
                const { data: expiringToday } = await supabase
                    .from('creditos')
                    .select('id, codigo_credito, fecha_vencimiento, saldo_pendiente, clientes!inner(id, nombres, apellido_paterno)')
                    .gte('fecha_vencimiento', hoy.toISOString().split('T')[0])
                    .lt('fecha_vencimiento', new Date(hoy.getTime() + 86400000).toISOString().split('T')[0])
                    .in('estado_detallado', ['vigente', 'por_vencer'])
                    .limit(10)

                expiringToday?.forEach((c: unknown) => {
                    const contract = c as {
                        id: string;
                        codigo_credito: string;
                        fecha_vencimiento: string;
                        saldo_pendiente: number;
                        clientes: { id: string; nombres: string; apellido_paterno: string }
                    }
                    notifs.push({
                        id: `expiry-today-${contract.id}`,
                        type: 'expiry',
                        priority: 'high',
                        title: 'Vence Hoy',
                        message: `${contract.clientes.nombres} ${contract.clientes.apellido_paterno}`,
                        amount: contract.saldo_pendiente,
                        timestamp: new Date(contract.fecha_vencimiento),
                        read: false,
                        actionUrl: `/dashboard/clientes/${contract.clientes.id}`,
                        actionLabel: 'Cobrar',
                        clientName: `${contract.clientes.nombres} ${contract.clientes.apellido_paterno}`,
                        contractCode: contract.codigo_credito
                    })
                })

                // 4. VENCEN PRÓXIMOS 3 DÍAS (MEDIO)
                const tresDias = new Date(hoy)
                tresDias.setDate(tresDias.getDate() + 3)

                const { data: expiringSoon } = await supabase
                    .from('creditos')
                    .select('id, codigo_credito, fecha_vencimiento, saldo_pendiente, clientes!inner(id, nombres, apellido_paterno)')
                    .gt('fecha_vencimiento', new Date(hoy.getTime() + 86400000).toISOString().split('T')[0])
                    .lte('fecha_vencimiento', tresDias.toISOString().split('T')[0])
                    .in('estado_detallado', ['vigente', 'por_vencer'])
                    .limit(5)

                expiringSoon?.forEach((c: unknown) => {
                    const contract = c as {
                        id: string;
                        codigo_credito: string;
                        fecha_vencimiento: string;
                        saldo_pendiente: number;
                        clientes: { id: string; nombres: string; apellido_paterno: string }
                    }
                    const daysUntil = Math.ceil((new Date(contract.fecha_vencimiento).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
                    notifs.push({
                        id: `expiry-soon-${contract.id}`,
                        type: 'expiry',
                        priority: 'medium',
                        title: `Vence en ${daysUntil} días`,
                        message: `${contract.clientes.nombres} ${contract.clientes.apellido_paterno}`,
                        amount: contract.saldo_pendiente,
                        timestamp: new Date(contract.fecha_vencimiento),
                        read: false,
                        actionUrl: `/dashboard/clientes/${contract.clientes.id}`,
                        actionLabel: 'Recordar',
                        clientName: `${contract.clientes.nombres} ${contract.clientes.apellido_paterno}`,
                        contractCode: contract.codigo_credito
                    })
                })

                // 5. RENOVACIONES RECIENTES (INFO)
                const { data: renewals } = await supabase
                    .from('creditos')
                    .select('id, codigo_credito, created_at, monto_prestado, clientes!inner(nombres, apellido_paterno)')
                    .eq('es_renovacion', true)
                    .gte('created_at', ayer.toISOString())
                    .order('created_at', { ascending: false })
                    .limit(5)

                renewals?.forEach((r: unknown) => {
                    const renewal = r as {
                        id: string;
                        codigo_credito: string;
                        created_at: string;
                        monto_prestado: number;
                        clientes: { nombres: string; apellido_paterno: string }
                    }
                    notifs.push({
                        id: `renewal-${renewal.id}`,
                        type: 'renewal',
                        priority: 'low',
                        title: 'Contrato Renovado',
                        message: `${renewal.clientes.nombres} ${renewal.clientes.apellido_paterno}`,
                        amount: renewal.monto_prestado,
                        timestamp: new Date(renewal.created_at),
                        read: false,
                        clientName: `${renewal.clientes.nombres} ${renewal.clientes.apellido_paterno}`,
                        contractCode: renewal.codigo_credito
                    })
                })

                // Sort: priority first, then timestamp
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                notifs.sort((a, b) => {
                    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
                    if (priorityDiff !== 0) return priorityDiff
                    return b.timestamp.getTime() - a.timestamp.getTime()
                })

                setNotifications(notifs)
            } catch (error) {
                console.error('Error fetching notifications:', error)
            } finally {
                setLoading(false)
            }
        }

        if (isOpen) {
            setLoading(true)
            fetchNotifications()
        }
    }, [isOpen, supabase])

    // Group notifications by date
    const groupedNotifications = useMemo(() => {
        const filtered = activeFilter === 'all'
            ? notifications
            : notifications.filter(n => n.type === activeFilter)

        const groups: { title: string; items: Notification[] }[] = []

        const today: Notification[] = []
        const yesterday: Notification[] = []
        const thisWeek: Notification[] = []
        const older: Notification[] = []

        filtered.forEach(n => {
            if (isToday(n.timestamp)) today.push(n)
            else if (isYesterday(n.timestamp)) yesterday.push(n)
            else if (isThisWeek(n.timestamp)) thisWeek.push(n)
            else older.push(n)
        })

        if (today.length > 0) groups.push({ title: 'Hoy', items: today })
        if (yesterday.length > 0) groups.push({ title: 'Ayer', items: yesterday })
        if (thisWeek.length > 0) groups.push({ title: 'Esta Semana', items: thisWeek })
        if (older.length > 0) groups.push({ title: 'Anteriores', items: older })

        return groups
    }, [notifications, activeFilter])

    // Stats
    const stats = useMemo(() => ({
        critical: notifications.filter(n => n.priority === 'critical').length,
        high: notifications.filter(n => n.priority === 'high').length,
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length
    }), [notifications])

    // Filter tabs
    const filterTabs: { key: NotificationType | 'all'; label: string; icon: React.ReactNode }[] = [
        { key: 'all', label: 'Todo', icon: <Bell className="h-3 w-3" /> },
        { key: 'overdue', label: 'Vencidos', icon: <AlertTriangle className="h-3 w-3" /> },
        { key: 'expiry', label: 'Por Vencer', icon: <Clock className="h-3 w-3" /> },
        { key: 'payment', label: 'Pagos', icon: <CreditCard className="h-3 w-3" /> }
    ]

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                'fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col',
                isOpen ? 'translate-x-0' : 'translate-x-full'
            )}>
                {/* Header */}
                <div className="flex-shrink-0 border-b border-slate-100">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                <Bell className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Centro de Alertas</h2>
                                <p className="text-xs text-slate-500">{stats.total} notificaciones</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Priority Summary */}
                    {(stats.critical > 0 || stats.high > 0) && (
                        <div className="px-4 pb-3 flex gap-2">
                            {stats.critical > 0 && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                    <AlertTriangle className="h-3 w-3" />
                                    {stats.critical} críticos
                                </div>
                            )}
                            {stats.high > 0 && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                    <Clock className="h-3 w-3" />
                                    {stats.high} urgentes
                                </div>
                            )}
                        </div>
                    )}

                    {/* Filter Tabs */}
                    <div className="px-4 pb-3 flex gap-1 overflow-x-auto">
                        {filterTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveFilter(tab.key)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                                    activeFilter === tab.key
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                )}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : groupedNotifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            </div>
                            <h3 className="font-medium text-slate-900">Todo al día</h3>
                            <p className="text-sm text-slate-500 mt-1">No hay notificaciones pendientes</p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-4">
                            {groupedNotifications.map(group => (
                                <div key={group.title}>
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                                        {group.title}
                                    </h3>
                                    <div className="space-y-2">
                                        {group.items.map(notif => (
                                            <div
                                                key={notif.id}
                                                className={cn(
                                                    'p-3 rounded-xl border transition-all hover:shadow-md',
                                                    priorityConfig[notif.priority].bgColor
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                                        {typeIcons[notif.type]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className={cn('font-semibold text-sm', priorityConfig[notif.priority].color)}>
                                                                {notif.title}
                                                            </p>
                                                            {notif.priority === 'critical' && (
                                                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded">
                                                                    URGENTE
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-700 font-medium truncate">
                                                            {notif.clientName || notif.message}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                                {notif.amount && (
                                                                    <span className="font-semibold text-slate-700">
                                                                        {formatearSoles(String(notif.amount))}
                                                                    </span>
                                                                )}
                                                                <span>{formatDistanceToNow(notif.timestamp, { addSuffix: true, locale: es })}</span>
                                                            </div>
                                                            {notif.actionUrl && (
                                                                <Link
                                                                    href={notif.actionUrl}
                                                                    onClick={onClose}
                                                                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                                                                >
                                                                    {notif.actionLabel || 'Ver'} <ChevronRight className="h-3 w-3" />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-4 border-t border-slate-100 bg-slate-50 space-y-2">
                    <button className="w-full py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                        <Check className="h-4 w-4 inline mr-2" />
                        Marcar todas como leídas
                    </button>
                    <Link
                        href="/dashboard/reportes/alertas"
                        onClick={onClose}
                        className="block w-full py-2.5 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-center"
                    >
                        Ver historial completo
                    </Link>
                </div>
            </div>
        </>
    )
}

// Enhanced Notification Bell with priority indicator
interface NotificationBellProps {
    onClick: () => void
    count?: number
    hasCritical?: boolean
}

export function NotificationBell({ onClick, count = 0, hasCritical = false }: NotificationBellProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'relative p-2 rounded-xl transition-all',
                hasCritical
                    ? 'bg-red-50 hover:bg-red-100'
                    : 'hover:bg-slate-100'
            )}
        >
            <Bell className={cn(
                'h-5 w-5 transition-colors',
                hasCritical ? 'text-red-500' : 'text-slate-600'
            )} />
            {count > 0 && (
                <span className={cn(
                    'absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold text-white rounded-full px-1',
                    hasCritical ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                )}>
                    {count > 99 ? '99+' : count}
                </span>
            )}
            {hasCritical && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
        </button>
    )
}
