/**
 * Dashboard Data Hook
 * 
 * Uses the consolidated RPC get_dashboard_complete to fetch all 
 * dashboard data in a single database call.
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Types matching the RPC response
export interface ContratoUrgente {
    id: string
    codigo: string
    cliente_id: string
    cliente_nombre: string
    cliente_telefono: string | null
    monto: number
    saldo: number
    fecha_vencimiento: string
    dias_vencido: number
}

export interface CarteraResumen {
    al_dia: { count: number; total: number }
    por_vencer: { count: number; total: number }
    en_mora: { count: number; total: number }
}

export interface CajaStatus {
    abierta: boolean
    saldo_inicial: number
    saldo_actual: number
    ingresos: number
    egresos: number
    operaciones: number
}

export interface PagoDia {
    fecha: string
    monto: number
}

export interface DashboardData {
    contratos_urgentes: ContratoUrgente[]
    cartera: CarteraResumen
    caja: CajaStatus
    pagos_7_dias: PagoDia[]
}

export interface UseDashboardDataResult {
    data: DashboardData | null
    loading: boolean
    error: Error | null
    refetch: () => Promise<void>
}

/**
 * Hook to fetch all dashboard data using consolidated RPC
 */
export function useDashboardData(): UseDashboardDataResult {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const supabase = createClient()

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Get current user
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError) throw authError
            if (!user) throw new Error('No authenticated user')

            // Try consolidated RPC first (deployed to Supabase)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: rpcData, error: rpcError } = await (supabase as any)
                .rpc('get_dashboard_complete', { p_usuario_id: user.id })

            if (rpcError) {
                console.warn('RPC failed, using legacy fallback:', rpcError.message)
                await fetchLegacyData(user.id)
                return
            }

            // RPC success - parse response
            const parsed = rpcData as DashboardData
            setData(parsed)

        } catch (err) {
            console.error('Error fetching dashboard data:', err)
            setError(err instanceof Error ? err : new Error('Unknown error'))
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase])

    // Legacy fallback for when RPC is not deployed yet
    const fetchLegacyData = useCallback(async (userId: string) => {
        const hoy = new Date()
        const semanaStr = new Date(hoy.getTime() + 7 * 86400000).toISOString().split('T')[0]
        const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString()

        // 1. Contratos urgentes
        const { data: contratos } = await supabase
            .from('creditos')
            .select(`
                id,
                codigo_credito,
                monto_prestado,
                saldo_pendiente,
                fecha_vencimiento,
                clientes!inner(id, nombres, apellido_paterno, telefono_principal)
            `)
            .lte('fecha_vencimiento', semanaStr)
            .in('estado_detallado', ['vigente', 'por_vencer', 'vencido', 'en_mora'])
            .order('fecha_vencimiento', { ascending: true })
            .limit(30)

        const contratosUrgentes: ContratoUrgente[] = (contratos || []).map((c: unknown) => {
            const contrato = c as {
                id: string
                codigo_credito: string
                monto_prestado: number
                saldo_pendiente: number
                fecha_vencimiento: string
                clientes: { id: string; nombres: string; apellido_paterno: string; telefono_principal: string | null }
            }
            return {
                id: contrato.id,
                codigo: contrato.codigo_credito,
                cliente_id: contrato.clientes.id,
                cliente_nombre: `${contrato.clientes.nombres} ${contrato.clientes.apellido_paterno}`,
                cliente_telefono: contrato.clientes.telefono_principal,
                monto: contrato.monto_prestado,
                saldo: contrato.saldo_pendiente,
                fecha_vencimiento: contrato.fecha_vencimiento,
                dias_vencido: Math.floor((hoy.getTime() - new Date(contrato.fecha_vencimiento).getTime()) / (1000 * 60 * 60 * 24))
            }
        })

        // 2. Cartera
        const { data: riskData } = await supabase.rpc('get_cartera_risk_summary')
        const riskArray = riskData || []
        const vigente = riskArray.find((r: { estado_grupo: string; cantidad: number; total_saldo: number }) => r.estado_grupo === 'VIGENTE')
        const porVencer = riskArray.find((r: { estado_grupo: string; cantidad: number; total_saldo: number }) => r.estado_grupo === 'POR_VENCER')
        const vencido = riskArray.find((r: { estado_grupo: string; cantidad: number; total_saldo: number }) => r.estado_grupo === 'VENCIDO')

        const cartera: CarteraResumen = {
            al_dia: { count: vigente?.cantidad || 0, total: vigente?.total_saldo || 0 },
            por_vencer: { count: porVencer?.cantidad || 0, total: porVencer?.total_saldo || 0 },
            en_mora: { count: vencido?.cantidad || 0, total: vencido?.total_saldo || 0 }
        }

        // 3. Caja
        const { data: cajaData } = await supabase
            .from('cajas_operativas')
            .select('id, saldo_inicial, saldo_actual, estado')
            .eq('usuario_id', userId)
            .eq('estado', 'abierta')
            .single()

        let caja: CajaStatus = {
            abierta: false,
            saldo_inicial: 0,
            saldo_actual: 0,
            ingresos: 0,
            egresos: 0,
            operaciones: 0
        }

        if (cajaData) {
            const cajaTyped = cajaData as { id: string; saldo_inicial: number; saldo_actual: number }
            const { data: movimientos } = await supabase
                .from('movimientos_caja_operativa')
                .select('tipo, monto')
                .eq('caja_operativa_id', cajaTyped.id)
                .gte('created_at', inicioHoy)

            const movArray = movimientos as Array<{ tipo: string; monto: number }> || []
            caja = {
                abierta: true,
                saldo_inicial: cajaTyped.saldo_inicial || 0,
                saldo_actual: cajaTyped.saldo_actual || 0,
                ingresos: movArray.filter(m => m.tipo === 'INGRESO').reduce((acc, m) => acc + Number(m.monto), 0),
                egresos: movArray.filter(m => m.tipo === 'EGRESO').reduce((acc, m) => acc + Number(m.monto), 0),
                operaciones: movArray.length
            }
        }

        // 4. Pagos 7 dias
        const last7Days: { date: string; monto: number }[] = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date(hoy)
            date.setDate(date.getDate() - i)
            last7Days.push({ date: date.toISOString().split('T')[0], monto: 0 })
        }

        const { data: pagos7dias } = await supabase
            .from('pagos')
            .select('monto, fecha_pago')
            .gte('fecha_pago', last7Days[0].date)
            .lte('fecha_pago', last7Days[6].date + 'T23:59:59')
            .eq('estado', 'completado')

        if (pagos7dias) {
            pagos7dias.forEach((p: { monto: number; fecha_pago: string }) => {
                const dateStr = p.fecha_pago.split('T')[0]
                const dayEntry = last7Days.find(d => d.date === dateStr)
                if (dayEntry) dayEntry.monto += Number(p.monto)
            })
        }

        const pagos_7_dias: PagoDia[] = last7Days.map(d => ({ fecha: d.date, monto: d.monto }))

        setData({
            contratos_urgentes: contratosUrgentes,
            cartera,
            caja,
            pagos_7_dias
        })
    }, [supabase])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { data, loading, error, refetch: fetchData }
}

/**
 * Computed helpers for dashboard data
 */
export function computeDashboardMetrics(data: DashboardData | null) {
    if (!data) return null

    const hoy = new Date()

    // Group contracts by urgency
    const vencidos = data.contratos_urgentes.filter(c => c.dias_vencido > 0)
    const vencenHoy = data.contratos_urgentes.filter(c => c.dias_vencido === 0)
    const vencenManana = data.contratos_urgentes.filter(c => c.dias_vencido === -1)
    const vencenSemana = data.contratos_urgentes.filter(c => c.dias_vencido < -1)

    // Notification count
    const notificationCount = vencidos.length + vencenHoy.length

    // 7-day trend with filled days
    const trend7Dias = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(hoy)
        date.setDate(date.getDate() - (6 - i))
        const dateStr = date.toISOString().split('T')[0]
        const pago = data.pagos_7_dias.find(p => p.fecha === dateStr)
        return {
            date: dateStr,
            monto: pago?.monto || 0
        }
    })

    return {
        vencidos,
        vencenHoy,
        vencenManana,
        vencenSemana,
        notificationCount,
        trend7Dias,
        hasCritical: vencidos.length > 0
    }
}
