'use server'

/**
 * Reportes PDF - Server Actions
 * 
 * Data fetching for PDF report generation
 */

import { createClient } from '@/lib/supabase/server'

// ============ TYPES ============

export interface DatosCarteraReporte {
    empresa: {
        nombre: string
        ruc?: string
        logoUrl?: string
    }
    fecha: string
    resumen: {
        totalCartera: number
        creditosVigentes: number
        enMora: number
        tasaMora: number
        alDia: number
        porVencer: number
    }
    creditos: {
        codigo: string
        cliente: string
        monto: number
        saldo: number
        estado: string
        fechaVencimiento: string
        diasVencido: number
    }[]
}

export interface DatosEstadoCuenta {
    cliente: {
        id: string
        nombre: string
        documento: string
        telefono?: string
        direccion?: string
    }
    fecha: string
    creditosActivos: {
        codigo: string
        monto: number
        saldo: number
        tasa: number
        fechaDesembolso: string
        fechaVencimiento: string
        estado: string
    }[]
    historialPagos: {
        fecha: string
        monto: number
        tipo: string
        creditoCodigo: string
    }[]
    saldoTotal: number
    empresa: {
        nombre: string
        logoUrl?: string
    }
}

export interface DatosMoraReporte {
    fecha: string
    resumen: {
        totalEnMora: number
        clientesEnMora: number
        montoEnRiesgo: number
    }
    creditos: {
        codigo: string
        cliente: string
        clienteTelefono?: string
        monto: number
        saldo: number
        diasVencido: number
        fechaVencimiento: string
        prioridad: 'ALTA' | 'MEDIA' | 'BAJA'
    }[]
    empresa: {
        nombre: string
        logoUrl?: string
    }
}

// ============ CARTERA REPORT ============

export async function obtenerDatosCarteraReporte(): Promise<DatosCarteraReporte> {
    const supabase = await createClient()

    // Get company info
    const { data: usuario } = await supabase.auth.getUser()
    const { data: empresaData } = await supabase
        .from('usuarios')
        .select('empresas(nombre, ruc, logo_url)')
        .eq('id', usuario.user?.id || '')
        .single()

    // Get all active credits
    const { data: creditos } = await supabase
        .from('creditos')
        .select(`
            codigo,
            codigo_credito,
            monto,
            saldo_pendiente,
            estado_detallado,
            fecha_vencimiento,
            clientes(nombres, apellido_paterno)
        `)
        .not('estado_detallado', 'in', '("cancelado","anulado","ejecutado")')
        .order('fecha_vencimiento', { ascending: true })

    const hoy = new Date()

    // Process credits
    const creditosFormateados = (creditos || []).map(c => {
        const fechaVenc = new Date(c.fecha_vencimiento)
        const diasVencido = Math.floor((hoy.getTime() - fechaVenc.getTime()) / (1000 * 60 * 60 * 24))
        const clienteRaw = c.clientes
        const cliente = (Array.isArray(clienteRaw) ? clienteRaw[0] : clienteRaw) as { nombres: string; apellido_paterno: string } | null

        return {
            codigo: c.codigo_credito || c.codigo,
            cliente: cliente ? `${cliente.nombres} ${cliente.apellido_paterno}` : 'Sin cliente',
            monto: c.monto || 0,
            saldo: c.saldo_pendiente || 0,
            estado: c.estado_detallado || 'vigente',
            fechaVencimiento: c.fecha_vencimiento,
            diasVencido: Math.max(0, diasVencido)
        }
    })

    // Calculate summary
    const totalCartera = creditosFormateados.reduce((sum, c) => sum + c.saldo, 0)
    const enMora = creditosFormateados.filter(c => c.diasVencido > 0)
    const montoMora = enMora.reduce((sum, c) => sum + c.saldo, 0)

    const empresaRaw = empresaData?.empresas
    const empresa = (Array.isArray(empresaRaw) ? empresaRaw[0] : empresaRaw) as { nombre: string; ruc: string; logo_url?: string } | null

    return {
        empresa: {
            nombre: empresa?.nombre || 'JUNTAY',
            ruc: empresa?.ruc,
            logoUrl: empresa?.logo_url
        },
        fecha: hoy.toISOString(),
        resumen: {
            totalCartera,
            creditosVigentes: creditosFormateados.length,
            enMora: enMora.length,
            tasaMora: totalCartera > 0 ? Math.round((montoMora / totalCartera) * 1000) / 10 : 0,
            alDia: creditosFormateados.filter(c => c.diasVencido === 0).length,
            porVencer: creditosFormateados.filter(c => c.diasVencido < 0).length
        },
        creditos: creditosFormateados
    }
}

// ============ ESTADO DE CUENTA ============

export async function obtenerEstadoCuentaCliente(clienteId: string): Promise<DatosEstadoCuenta | null> {
    const supabase = await createClient()

    // Get company info (for logo)
    const { data: usuario } = await supabase.auth.getUser()
    const { data: empresaData } = await supabase
        .from('usuarios')
        .select('empresas(nombre, logo_url)')
        .eq('id', usuario.user?.id || '')
        .single()

    const empresaInfo = (Array.isArray(empresaData?.empresas) ? empresaData?.empresas[0] : empresaData?.empresas) as { nombre: string; logo_url?: string } | null

    // Get client info
    const { data: cliente } = await supabase
        .from('clientes')
        .select('id, nombres, apellido_paterno, numero_documento, telefono, direccion')
        .eq('id', clienteId)
        .single()

    if (!cliente) return null

    // Get active credits
    const { data: creditos } = await supabase
        .from('creditos')
        .select('codigo, codigo_credito, monto, saldo_pendiente, tasa_interes, fecha_desembolso, fecha_vencimiento, estado_detallado')
        .eq('cliente_id', clienteId)
        .not('estado_detallado', 'in', '("cancelado","anulado","ejecutado")')
        .order('fecha_desembolso', { ascending: false })

    // Get payment history
    const { data: pagos } = await supabase
        .from('pagos')
        .select('monto, tipo_pago, created_at, creditos!inner(codigo, cliente_id)')
        .eq('creditos.cliente_id', clienteId)
        .order('created_at', { ascending: false })
        .limit(20)

    const saldoTotal = (creditos || []).reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)

    return {
        cliente: {
            id: cliente.id,
            nombre: `${cliente.nombres} ${cliente.apellido_paterno}`,
            documento: cliente.numero_documento || '',
            telefono: cliente.telefono,
            direccion: cliente.direccion
        },
        fecha: new Date().toISOString(),
        creditosActivos: (creditos || []).map(c => ({
            codigo: c.codigo_credito || c.codigo,
            monto: c.monto || 0,
            saldo: c.saldo_pendiente || 0,
            tasa: c.tasa_interes || 0,
            fechaDesembolso: c.fecha_desembolso,
            fechaVencimiento: c.fecha_vencimiento,
            estado: c.estado_detallado || 'vigente'
        })),
        historialPagos: (pagos || []).map(p => {
            const credito = p.creditos as unknown as { codigo: string }
            return {
                fecha: p.created_at,
                monto: p.monto || 0,
                tipo: p.tipo_pago || 'pago',
                creditoCodigo: credito?.codigo || ''
            }
        }),
        saldoTotal,
        empresa: {
            nombre: empresaInfo?.nombre || 'JUNTAY',
            logoUrl: empresaInfo?.logo_url
        }
    }
}

// ============ MORA REPORT ============

export async function obtenerDatosMoraReporte(): Promise<DatosMoraReporte> {
    const supabase = await createClient()

    // Get company info
    const { data: usuario } = await supabase.auth.getUser()
    const { data: empresaData } = await supabase
        .from('usuarios')
        .select('empresas(nombre, logo_url)')
        .eq('id', usuario.user?.id || '')
        .single()
    const empresaInfo = (Array.isArray(empresaData?.empresas) ? empresaData?.empresas[0] : empresaData?.empresas) as { nombre: string; logo_url?: string } | null

    const hoy = new Date()

    // Get overdue credits
    const { data: creditos } = await supabase
        .from('creditos')
        .select(`
            codigo,
            codigo_credito,
            monto,
            saldo_pendiente,
            fecha_vencimiento,
            clientes(nombres, apellido_paterno, telefono)
        `)
        .in('estado_detallado', ['vencido', 'en_mora', 'en_gracia', 'pre_remate'])
        .lt('fecha_vencimiento', hoy.toISOString().split('T')[0])
        .order('fecha_vencimiento', { ascending: true })

    const creditosFormateados = (creditos || []).map(c => {
        const fechaVenc = new Date(c.fecha_vencimiento)
        const diasVencido = Math.floor((hoy.getTime() - fechaVenc.getTime()) / (1000 * 60 * 60 * 24))
        const clienteRaw = c.clientes
        const cliente = (Array.isArray(clienteRaw) ? clienteRaw[0] : clienteRaw) as { nombres: string; apellido_paterno: string; telefono?: string } | null

        let prioridad: 'ALTA' | 'MEDIA' | 'BAJA' = 'BAJA'
        if (diasVencido > 30) prioridad = 'ALTA'
        else if (diasVencido > 7) prioridad = 'MEDIA'

        return {
            codigo: c.codigo_credito || c.codigo,
            cliente: cliente ? `${cliente.nombres} ${cliente.apellido_paterno}` : 'Sin cliente',
            clienteTelefono: cliente?.telefono,
            monto: c.monto || 0,
            saldo: c.saldo_pendiente || 0,
            diasVencido,
            fechaVencimiento: c.fecha_vencimiento,
            prioridad
        }
    })

    // Sort by priority (ALTA first) and dias vencido
    creditosFormateados.sort((a, b) => {
        const prioridadOrder = { ALTA: 0, MEDIA: 1, BAJA: 2 }
        if (prioridadOrder[a.prioridad] !== prioridadOrder[b.prioridad]) {
            return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad]
        }
        return b.diasVencido - a.diasVencido
    })

    const montoEnRiesgo = creditosFormateados.reduce((sum, c) => sum + c.saldo, 0)
    const clientesUnicos = new Set(creditosFormateados.map(c => c.cliente))

    return {
        fecha: hoy.toISOString(),
        resumen: {
            totalEnMora: creditosFormateados.length,
            clientesEnMora: clientesUnicos.size,
            montoEnRiesgo
        },
        creditos: creditosFormateados,
        empresa: {
            nombre: empresaInfo?.nombre || 'JUNTAY',
            logoUrl: empresaInfo?.logo_url
        }
    }
}
