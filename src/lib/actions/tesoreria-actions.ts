'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { requireEmpresaActual } from '@/lib/auth/empresa-context'

// Service client para testing sin auth
const _getServiceClient = () => {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export async function obtenerEstadoBoveda() {
    const supabase = await createClient()

    // 1. Obtener saldo EFECTIVO (Bóvedas Físicas)
    const { data: efectivoData, error: errorEfectivo } = await supabase
        .from('cuentas_financieras')
        .select('saldo')
        .eq('tipo', 'EFECTIVO')

    // 2. Obtener saldo BANCOS/DIGITAL (Yape, BCP)
    const { data: bancoData, error: errorBanco } = await supabase
        .from('cuentas_financieras')
        .select('saldo')
        .in('tipo', ['BANCO', 'DIGITAL'])

    if (errorEfectivo || errorBanco) {
        console.error('Error obteniendo balances:', errorEfectivo || errorBanco)
        return null
    }

    // Calcular totales localmente (o usar rpc mejorado despues)
    const totalEfectivo = efectivoData?.reduce((sum, item) => sum + Number(item.saldo), 0) || 0
    const totalBancos = bancoData?.reduce((sum, item) => sum + Number(item.saldo), 0) || 0
    const totalConsolidado = totalEfectivo + totalBancos

    // Retornar estructura compatible con Dashboard actual pero enriquecida
    return {
        id: 'virtual-consolidated-id', // ID dummy
        saldoTotal: totalConsolidado,    // Liquidez total real
        saldoDisponible: totalEfectivo,  // Lo que hay en caja fuerte física
        saldoAsignado: totalBancos,      // El sistema legacy llamaba "asignado" a lo que no estaba disponible. Reusamos para Bancos.
        _desglose: {
            efectivo: totalEfectivo,
            bancos: totalBancos
        }
    }
}


// Legacy actions replaced by Juntay Capital Module at the bottom
// ...


export async function obtenerCajeros() {
    const supabase = await createClient()

    // Obtener usuarios que son cajeros (todos por ahora, en prod filtrar por rol)
    const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombres, apellido_paterno, apellido_materno, email')
        .limit(10)

    if (error) {
        console.error('Error obteniendo cajeros:', error)
        return []
    }

    return data || []
}

// Obtener movimientos recientes de bóveda para auditoría
export async function obtenerMovimientosBoveda(limite: number = 15) {
    const supabase = await createClient()

    // Nueva implementación: Leer de transacciones_capital, la nueva fuente de verdad
    const { data, error } = await supabase
        .from('transacciones_capital')
        .select(`
            id,
            tipo,
            monto,
            descripcion,
            metadata,
            fecha_operacion,
            origen:origen_cuenta_id(nombre, tipo),
            destino:destino_cuenta_id(nombre, tipo)
        `)
        .order('fecha_operacion', { ascending: false })
        .limit(limite)

    if (error) {
        console.error('Error obteniendo movimientos:', error)
        return []
    }

    // Mapear al formato que espera el Dashboard
    // Definimos interfaz temporal para el resultado del join
    type LedgerRow = {
        id: string
        tipo: string
        monto: number
        descripcion: string | null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: Record<string, any> | null
        fecha_operacion: string
        origen: { nombre: string; tipo: string } | null
        destino: { nombre: string; tipo: string } | null
    }

    return (data || []).map((row: unknown) => {
        const t = row as LedgerRow
        const origenNombre = t.origen?.nombre || 'Externo'
        const destinoNombre = t.destino?.nombre || 'Externo'

        let referencia = t.descripcion
        // Mejorar la referencia visualmente
        if (t.tipo === 'APORTE') referencia = `Aporte: ${t.metadata?.inversionista_nombre || 'Socio'} -> ${destinoNombre}`
        if (t.tipo === 'TRANSFERENCIA_FONDEO') referencia = `Transferencia: ${origenNombre} -> ${destinoNombre}`
        if (t.tipo === 'RETIRO') referencia = `Retiro de ${origenNombre}`

        return {
            id: t.id,
            tipo: t.tipo === 'RETIRO' || (t.tipo === 'TRANSFERENCIA_FONDEO' && t.origen?.tipo === 'EFECTIVO') ? 'EGRESO' : 'INGRESO', // Simplificacion para visualizacion
            monto: Number(t.monto),
            referencia: referencia || 'Movimiento de Capital',
            saldo_anterior: 0, // No trackeado en ledger simple
            saldo_nuevo: 0,
            fecha: t.fecha_operacion,
            metadata: t.metadata
        }
    })
}

// --- NUEVAS ACCIONES JUNTAY CAPITAL ---

export interface CuentaFinancieraDetalle {
    id: string
    nombre: string
    tipo: 'EFECTIVO' | 'BANCO' | 'DIGITAL' | 'PASARELA'
    saldo: number
    moneda: string
    activo: boolean
    es_principal: boolean
    updated_at: string
}

export async function obtenerDetalleCuentas(): Promise<CuentaFinancieraDetalle[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('cuentas_financieras')
        .select('*')
        .order('es_principal', { ascending: false }) // Principal primero
        .order('saldo', { ascending: false })      // Mayor saldo después

    if (error) {
        console.error('Error obteniendo cuentas financieras:', error)
        return []
    }

    return (data || []).map(c => ({
        ...c,
        es_principal: c.es_principal || false // Asegurar booleano si null
    }))
}

export type TransaccionCapitalDetalle = {
    id: string
    tipo: string
    monto: number
    descripcion: string | null
    fecha_operacion: string
    origen?: { nombre: string, tipo: string }
    destino?: { nombre: string, tipo: string }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: Record<string, any> | null
}

export async function obtenerHistorialCapital(limite: number = 10): Promise<TransaccionCapitalDetalle[]> {
    const supabase = await createClient()

    // Hacemos join manual o select con relación si Supabase lo detecta. 
    // Como las FK estan definidas, podemos intentar select profundo
    const { data, error } = await supabase
        .from('transacciones_capital')
        .select(`
            id,
            tipo,
            monto,
            descripcion,
            fecha_operacion,
            metadata,
            origen:origen_cuenta_id(nombre, tipo),
            destino:destino_cuenta_id(nombre, tipo)
        `)
        .order('fecha_operacion', { ascending: false })
        .limit(limite)

    if (error) {
        console.error('Error obteniendo historial capital:', error)
        return []
    }

    return (data || []).map(t => ({
        id: t.id,
        tipo: t.tipo,
        monto: Number(t.monto),
        descripcion: t.descripcion,
        fecha_operacion: t.fecha_operacion,
        metadata: t.metadata,
        origen: Array.isArray(t.origen) ? t.origen[0] : t.origen, // Supabase a veces devuelve array en joins
        destino: Array.isArray(t.destino) ? t.destino[0] : t.destino
    })) as TransaccionCapitalDetalle[]
}

export async function crearCuentaFinanciera(formData: FormData) {
    const supabase = await createClient()

    const nombre = formData.get('nombre') as string
    const tipo = formData.get('tipo') as string
    const saldoInicial = Number(formData.get('saldo') || 0)
    const moneda = formData.get('moneda') || 'PEN'

    if (!nombre || !tipo) {
        return { error: 'Nombre y tipo son requeridos' }
    }

    // Insertar cuenta
    const { data, error } = await supabase
        .from('cuentas_financieras')
        .insert({
            nombre,
            tipo,
            saldo: saldoInicial,
            moneda,
            es_principal: false, // Por defecto no es principal
            activo: true
        })
        .select()
        .single()

    if (error) {
        console.error('Error creando cuenta:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/admin/tesoreria')
    return { success: true, cuenta: data }
}

export async function obtenerMovimientosCuenta(cuentaId: string, limite: number = 20) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('transacciones_capital')
        .select(`
            id,
            tipo,
            monto,
            descripcion,
            fecha_operacion,
            metadata,
            origen:origen_cuenta_id(nombre),
            destino:destino_cuenta_id(nombre)
        `)
        .or(`origen_cuenta_id.eq.${cuentaId},destino_cuenta_id.eq.${cuentaId}`)
        .order('fecha_operacion', { ascending: false })
        .limit(limite)

    if (error) {
        console.error('Error obteniendo movimientos cuenta:', error)
        return []
    }

    return (data || []).map(t => {
        // Safe access to joined properties which Supabase might return as array or object depending on relationship cardinality
        const row = t as unknown as { origen: { nombre: string } | { nombre: string }[]; destino: { nombre: string } | { nombre: string }[] }

        const origenObj = Array.isArray(row.origen) ? row.origen[0] : row.origen
        const destinoObj = Array.isArray(row.destino) ? row.destino[0] : row.destino

        const origenNombre = origenObj?.nombre
        const destinoNombre = destinoObj?.nombre

        return {
            id: t.id,
            tipo: t.tipo,
            monto: Number(t.monto),
            descripcion: t.descripcion,
            fecha: t.fecha_operacion,
            origen: origenNombre,
            destino: destinoNombre
        }
    })
}

export interface InversionistaDetalle {
    id: string
    persona_id: string
    nombre_completo: string
    tipo_relacion: 'SOCIO' | 'PRESTAMISTA'
    participacion_porcentaje: number | null
    fecha_ingreso: string
    activo: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>
    numero_documento?: string
    // Métricas Financieras (Calculadas)
    total_invertido?: number
    rendimiento_acumulado?: number
}

export async function obtenerInversionistas(): Promise<InversionistaDetalle[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('inversionistas')
        .select(`
            id,
            persona_id,
            tipo_relacion,
            participacion_porcentaje,
            fecha_ingreso,
            activo,
            metadata,
            persona:personas(nombres, apellido_paterno, apellido_materno, numero_documento)
        `)
        .order('fecha_ingreso', { ascending: false })

    if (error) {
        console.error('Error obteniendo inversionistas:', error)
        return []
    }

    // 2. Obtener métricas de la vista profesional (batch request, mucho más eficiente)
    const { data: metricasProfesionales, error: errorView } = await supabase
        .from('vista_inversionistas_profesional')
        .select('*')

    if (errorView) console.error("Error view:", errorView)

    // Crear mapa para acceso rápido
    const mapaMetricas = new Map((metricasProfesionales || []).map(m => [m.inversionista_id, m]))

    const inversionistasConMetricas = (data || []).map(inv => {
        const metricas = mapaMetricas.get(inv.id)

        return {
            id: inv.id,
            persona_id: inv.persona_id,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error - Join resolution complexity
            nombre_completo: `${inv.persona?.nombres} ${inv.persona?.apellido_paterno} ${inv.persona?.apellido_materno || ''}`.trim(),
            // @ts-expect-error - Join resolution complexity
            numero_documento: inv.persona?.numero_documento,
            tipo_relacion: inv.tipo_relacion,
            participacion_porcentaje: inv.participacion_porcentaje,
            fecha_ingreso: inv.fecha_ingreso,
            activo: inv.activo,
            metadata: inv.metadata,
            // Usar datos de la vista profesional
            total_invertido: metricas ? Number(metricas.capital_total || 0) : 0,
            rendimiento_acumulado: metricas ? Number(metricas.rendimiento_devengado || 0) : 0
        }
    })

    return inversionistasConMetricas
}

export async function crearInversionista(formData: FormData) {
    const supabase = await createClient()
    const { empresaId } = await requireEmpresaActual()

    let persona_id = formData.get('persona_id') as string
    const tipo = formData.get('tipo') as string // 'SOCIO' | 'PRESTAMISTA'
    const fecha = formData.get('fecha') as string // Fecha de ingreso
    const metadataStr = formData.get('metadata') as string

    // Datos opcionales de RENIEC para crear persona nueva
    const reniec_nombre = formData.get('reniec_nombre') as string
    const reniec_dni = formData.get('reniec_dni') as string

    if (!persona_id || !tipo) return { error: 'Datos incompletos' }

    let metadata = {}
    try {
        if (metadataStr) metadata = JSON.parse(metadataStr)
    } catch (e) {
        console.error("Error parsing metadata", e)
    }

    // Si persona_id empieza con "temp_", debemos crear o buscar la persona primero
    if (persona_id.startsWith('temp_')) {
        if (!reniec_nombre || !reniec_dni) {
            return { error: 'Faltan datos de RENIEC para crear la persona' }
        }

        // Use SERVICE ROLE to manipulate Persons (Global Table) to avoid RLS conflicts and ensure privacy
        const adminSupabase = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        )

        // Primero verificar si la persona ya existe por DNI (Global search)
        const { data: existingPersona } = await adminSupabase
            .from('personas')
            .select('id')
            .eq('numero_documento', reniec_dni)
            .single()

        if (existingPersona) {
            // Ya existe, usar el ID existente
            persona_id = existingPersona.id
            console.log('[crearInversionista] Persona existente encontrada (Global) con ID:', persona_id)
        } else {
            // Separar nombre completo en partes (formato: APELLIDO_PATERNO APELLIDO_MATERNO, NOMBRES)
            const partes = reniec_nombre.split(' ')
            const apellido_paterno = partes[0] || ''
            const apellido_materno = partes[1] || ''
            const nombres = partes.slice(2).join(' ') || reniec_nombre

            // Crear persona en la base de datos (Global registry)
            const { data: newPersona, error: personaError } = await adminSupabase
                .from('personas')
                .insert({
                    tipo_documento: 'DNI',
                    numero_documento: reniec_dni,
                    nombres: nombres,
                    apellido_paterno: apellido_paterno,
                    apellido_materno: apellido_materno
                })
                .select('id')
                .single()

            if (personaError) {
                console.error('Error creando persona:', personaError)
                return { error: `Error al crear persona: ${personaError.message}` }
            }

            persona_id = newPersona.id
            console.log('[crearInversionista] Persona creada con ID:', persona_id)
        }
    }

    const { data: newInversionista, error } = await supabase
        .from('inversionistas')
        .insert({
            persona_id,
            tipo_relacion: tipo,
            fecha_ingreso: fecha, // Save flexible date
            metadata: metadata, // Save return date or other flexible terms
            empresa_id: empresaId
        })
        .select('id')
        .single()

    if (error) return { error: error.message }

    // 2. Si se solicitó, registrar el ingreso de dinero a CAJA
    const registrar_ingreso = formData.get('registrar_ingreso') === 'true'
    const cuenta_destino_id = formData.get('cuenta_destino_id') as string
    const monto_ingreso = Number(formData.get('monto_ingreso') || 0)
    const referencia_ingreso = formData.get('referencia_ingreso') as string

    if (registrar_ingreso && cuenta_destino_id && monto_ingreso > 0 && newInversionista) {
        // Buscar nombre del inversor para la descripción
        const { data: persona } = await supabase.from('personas').select('nombres, apellido_paterno').eq('id', persona_id).single()
        const nombreRef = persona ? `${persona.nombres} ${persona.apellido_paterno}` : 'Inversionista'

        let descripcion = `Aporte de Capital - ${nombreRef}`
        if (referencia_ingreso) descripcion += ` (Ref: ${referencia_ingreso})`

        const { error: errorTransaccion } = await supabase
            .from('transacciones_capital')
            .insert({
                tipo: 'APORTE',
                monto: monto_ingreso,
                descripcion: descripcion,
                fecha_operacion: new Date().toISOString(), // O usar fecha de ingreso? Mejor fecha real de operación (hoy)
                destino_cuenta_id: cuenta_destino_id,
                inversionista_id: newInversionista.id,
                empresa_id: empresaId,
                metadata: {
                    auto_generated: true,
                    fecha_ingreso_contrato: fecha,
                    referencia_operacion: referencia_ingreso
                }
            })

        if (errorTransaccion) {
            console.error('Error creando transacción de ingreso:', errorTransaccion)
            // No fallamos toda la operación, pero avisamos (o podríamos hacer rollback manual delete)
            return { error: `Inversionista creado, pero falló el ingreso a caja: ${errorTransaccion.message}` }
        }
    }

    revalidatePath('/dashboard/admin/tesoreria')
    revalidatePath('/dashboard/admin/inversionistas')
    return { success: true }
}

export async function transferirFondosAction(formData: FormData) {
    const supabase = await createClient()
    const origen_id = formData.get('origen_id') as string
    const destino_id = formData.get('destino_id') as string
    const monto = Number(formData.get('monto'))
    const descripcion = formData.get('descripcion') as string

    if (!origen_id || !destino_id || monto <= 0) return { error: 'Datos inválidos' }
    if (origen_id === destino_id) return { error: 'Origen y destino deben ser diferentes' }

    const { error } = await supabase
        .from('transacciones_capital')
        .insert({
            origen_cuenta_id: origen_id,
            destino_cuenta_id: destino_id,
            monto: monto,
            tipo: 'TRANSFERENCIA_FONDEO',
            descripcion: descripcion || `Transferencia interna`,
            fecha_operacion: new Date().toISOString()
        })

    if (error) return { error: error.message }

    revalidatePath('/dashboard/admin/tesoreria')
    return { success: true }
}

// Reemplaza o sobrecarga la funcion anterior si es necesario, pero aqui creamos una nueva para el form
export async function inyectarCapitalAction(formData: FormData) {
    const supabase = await createClient()

    const inversionista_id = formData.get('inversionista_id') as string
    const destino_id = formData.get('destino_id') as string
    const monto = Number(formData.get('monto'))
    const descripcion = formData.get('descripcion') as string
    const evidencia = formData.get('evidencia') as string

    if (!destino_id || monto <= 0 || !inversionista_id) {
        return { error: 'Datos incompletos: Inversionista, Destino y Monto requeridos' }
    }

    const { error } = await supabase
        .from('transacciones_capital')
        .insert({
            inversionista_id: inversionista_id,
            destino_cuenta_id: destino_id,
            monto: monto,
            tipo: 'APORTE',
            descripcion: descripcion,
            evidencia_ref: evidencia
        })

    if (error) {
        console.error('Error inyectando capital:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/admin/tesoreria')
    return { success: true }
}

export async function buscarPersonas(busqueda: string) {
    const supabase = await createClient()

    if (!busqueda || busqueda.length < 2) return []

    const { data, error } = await supabase
        .from('personas')
        .select('id, nombres, apellido_paterno, apellido_materno, numero_documento')
        .or(`nombres.ilike.%${busqueda}%,apellido_paterno.ilike.%${busqueda}%,numero_documento.ilike.%${busqueda}%`)
        .limit(10)

    if (error) {
        console.error('Error buscando personas:', error)
        return []
    }

    return data.map(p => ({
        id: p.id,
        nombre_completo: `${p.nombres} ${p.apellido_paterno} ${p.apellido_materno}`.trim(),
        numero_documento: p.numero_documento
    }))
}

export async function actualizarInversionista(formData: FormData) {
    const supabase = await createClient()

    const id = formData.get('id') as string
    const tipo = formData.get('tipo') as string
    const fecha = formData.get('fecha') as string
    const metadataStr = formData.get('metadata') as string

    if (!id || !tipo) return { error: 'Datos incompletos para actualización' }

    let metadata = {}
    try {
        if (metadataStr) metadata = JSON.parse(metadataStr)
    } catch (e) {
        console.error("Error parsing metadata", e)
    }

    const { error } = await supabase
        .from('inversionistas')
        .update({
            tipo_relacion: tipo,
            fecha_ingreso: fecha,
            metadata: metadata,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/dashboard/admin/tesoreria')
    return { success: true }
}

// ============================================================================
// CONTRATOS DE FONDEO (Inversión Estructurada)
// ============================================================================

export type TipoContratoFondeo = 'DEUDA_FIJA' | 'PARTICIPACION_EQUITY'
export type FrecuenciaPago = 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'TRIMESTRAL' | 'AL_VENCIMIENTO'
export type EstadoContratoFondeo = 'ACTIVO' | 'PAUSADO' | 'LIQUIDADO' | 'CANCELADO'

export interface ContratoFondeoDetalle {
    id: string
    inversionista_id: string
    nombre_inversionista: string
    tipo: TipoContratoFondeo
    monto_pactado: number
    tasa_retorno: number
    fecha_inicio: string
    fecha_vencimiento: string | null
    frecuencia_pago: FrecuenciaPago
    estado: EstadoContratoFondeo
    monto_capital_devuelto: number
    monto_rendimientos_pagados: number
    dias_transcurridos?: number
    rendimiento_devengado?: number
    rendimiento_pendiente_pago?: number
    capital_pendiente?: number
}

export async function crearContratoFondeo(formData: FormData): Promise<{ success?: boolean; error?: string; contrato_id?: string }> {
    const supabase = await createClient()

    const inversionista_id = formData.get('inversionista_id') as string
    const tipo = formData.get('tipo') as TipoContratoFondeo
    const monto_pactado = Number(formData.get('monto'))
    const tasa_retorno = Number(formData.get('tasa'))
    const fecha_inicio = formData.get('fecha_inicio') as string
    const fecha_vencimiento = formData.get('fecha_vencimiento') as string || null
    const frecuencia_pago = (formData.get('frecuencia') as FrecuenciaPago) || 'MENSUAL'

    // Validaciones
    if (!inversionista_id || !tipo || !monto_pactado || tasa_retorno === undefined) {
        return { error: 'Datos incompletos: inversionista, tipo, monto y tasa son requeridos' }
    }

    if (monto_pactado <= 0) {
        return { error: 'El monto debe ser mayor a 0' }
    }

    if (tasa_retorno < 0) {
        return { error: 'La tasa no puede ser negativa' }
    }

    // Para DEUDA_FIJA, la fecha de vencimiento es recomendada
    if (tipo === 'DEUDA_FIJA' && !fecha_vencimiento) {
        console.warn('Contrato DEUDA_FIJA sin fecha de vencimiento - indefinido')
    }

    const { data, error } = await supabase
        .from('contratos_fondeo')
        .insert({
            inversionista_id,
            tipo,
            monto_pactado,
            tasa_retorno,
            fecha_inicio: fecha_inicio || new Date().toISOString().split('T')[0],
            fecha_vencimiento,
            frecuencia_pago,
            estado: 'ACTIVO'
        })
        .select('id')
        .single()

    if (error) {
        console.error('Error creando contrato de fondeo:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/admin/tesoreria')
    return { success: true, contrato_id: data.id }
}

export async function obtenerContratosInversionista(inversionista_id: string): Promise<ContratoFondeoDetalle[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('vista_rendimientos_inversionistas')
        .select('*')
        .eq('inversionista_id', inversionista_id)

    if (error) {
        console.error('Error obteniendo contratos:', error)
        return []
    }

    return (data || []).map(c => ({
        id: c.contrato_id,
        inversionista_id: c.inversionista_id,
        nombre_inversionista: c.nombre_inversionista,
        tipo: c.tipo_contrato,
        monto_pactado: Number(c.monto_pactado),
        tasa_retorno: Number(c.tasa_retorno),
        fecha_inicio: c.fecha_inicio,
        fecha_vencimiento: c.fecha_vencimiento,
        frecuencia_pago: 'MENSUAL', // Default, vista no incluye este campo
        estado: c.estado,
        monto_capital_devuelto: 0,
        monto_rendimientos_pagados: Number(c.monto_rendimientos_pagados || 0),
        dias_transcurridos: Number(c.dias_transcurridos || 0),
        rendimiento_devengado: Number(c.rendimiento_devengado || 0),
        rendimiento_pendiente_pago: Number(c.rendimiento_pendiente_pago || 0),
        capital_pendiente: Number(c.capital_pendiente || 0)
    }))
}

export async function obtenerRendimientosInversionista(inversionista_id: string): Promise<{
    total_capital: number
    rendimiento_devengado: number
    rendimiento_pagado: number
    pendiente_pago: number
    contratos: number
}> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('vista_rendimientos_inversionistas')
        .select('monto_pactado, rendimiento_devengado, monto_rendimientos_pagados, rendimiento_pendiente_pago')
        .eq('inversionista_id', inversionista_id)

    if (error) {
        console.error('Error obteniendo rendimientos:', error)
        return { total_capital: 0, rendimiento_devengado: 0, rendimiento_pagado: 0, pendiente_pago: 0, contratos: 0 }
    }

    const contratos = data || []
    return {
        total_capital: contratos.reduce((s, c) => s + Number(c.monto_pactado || 0), 0),
        rendimiento_devengado: contratos.reduce((s, c) => s + Number(c.rendimiento_devengado || 0), 0),
        rendimiento_pagado: contratos.reduce((s, c) => s + Number(c.monto_rendimientos_pagados || 0), 0),
        pendiente_pago: contratos.reduce((s, c) => s + Number(c.rendimiento_pendiente_pago || 0), 0),
        contratos: contratos.length
    }
}

// ============================================================================
// INDICADORES DE LIQUIDEZ Y RIESGO
// ============================================================================

export type NivelAlertaLiquidez = 'NORMAL' | 'PRECAUCION' | 'CRITICO'

export interface IndicadoresLiquidez {
    efectivoDisponible: number
    digitalDisponible: number
    totalLiquidez: number
    ratioEfectivo: number
    umbralMinimo: number
    alertaLiquidez: NivelAlertaLiquidez
    // Métricas adicionales
    capitalInvertido: number
    rendimientosPendientes: number
}

const UMBRAL_MINIMO_EFECTIVO = 5000 // S/ 5,000 - Configurable en el futuro

export async function obtenerIndicadoresLiquidez(): Promise<IndicadoresLiquidez> {
    const supabase = await createClient()

    // 1. Obtener saldos por tipo de cuenta
    const { data: cuentas, error: errorCuentas } = await supabase
        .from('cuentas_financieras')
        .select('tipo, saldo')
        .eq('activo', true)

    if (errorCuentas) {
        console.error('Error obteniendo cuentas:', errorCuentas)
    }

    const efectivo = (cuentas || [])
        .filter(c => c.tipo === 'EFECTIVO')
        .reduce((s, c) => s + Number(c.saldo), 0)

    const digital = (cuentas || [])
        .filter(c => ['BANCO', 'DIGITAL', 'PASARELA'].includes(c.tipo))
        .reduce((s, c) => s + Number(c.saldo), 0)

    const total = efectivo + digital

    // 2. Calcular ratio y alerta
    const ratio = total > 0 ? (efectivo / total) * 100 : 0
    let alerta: NivelAlertaLiquidez = 'NORMAL'
    if (efectivo < UMBRAL_MINIMO_EFECTIVO) {
        alerta = 'CRITICO'
    } else if (efectivo < UMBRAL_MINIMO_EFECTIVO * 1.5) {
        alerta = 'PRECAUCION'
    }

    // 3. Obtener métricas de inversores (usando RPC o query directa)
    const { data: resumen } = await supabase.rpc('obtener_resumen_rendimientos')

    return {
        efectivoDisponible: efectivo,
        digitalDisponible: digital,
        totalLiquidez: total,
        ratioEfectivo: Math.round(ratio * 100) / 100, // 2 decimales
        umbralMinimo: UMBRAL_MINIMO_EFECTIVO,
        alertaLiquidez: alerta,
        capitalInvertido: resumen?.total_capital_activo || 0,
        rendimientosPendientes: resumen?.total_pendiente_pago || 0
    }
}

export async function obtenerResumenTesoreriaCompleto() {
    const [estadoBoveda, indicadores, inversionistas] = await Promise.all([
        obtenerEstadoBoveda(),
        obtenerIndicadoresLiquidez(),
        obtenerInversionistas()
    ])

    return {
        boveda: estadoBoveda,
        liquidez: indicadores,
        inversionistas: {
            total: inversionistas.length,
            activos: inversionistas.filter(i => i.activo).length,
            lista: inversionistas
        }
    }
}

// ============================================================================
// ACCIONES LEGACY / COMPATIBILIDAD (Para UI existente)
// ============================================================================

export async function registrarIngresoBovedaAction(
    monto: number,

    origen: string,
    referencia: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: Record<string, any>
) {
    const supabase = await createClient()

    // VERIFICACIÓN DE IDENTIDAD REAL (Security Hardening)
    const { data: { user }, error: _authError } = await supabase.auth.getUser()

    // Por ahora permitimos operaciones anónimas en DEV si falla auth, 
    // pero marcamos claramente que no está autenticado. 
    // En PROD esto debería lanzar error.
    const usuarioResponsable = user ? user.email : 'anonimo-audit-warning'
    const usuarioId = user ? user.id : '00000000-0000-0000-0000-000000000000'

    // Obtener cuenta principal de Efectivo (Bóveda)
    const { data: boveda } = await supabase
        .from('cuentas_financieras')
        .select('id')
        .eq('tipo', 'EFECTIVO')
        .eq('es_principal', true)
        .single()

    if (!boveda) return { error: 'No se encontró una Bóveda Principal configurada' }

    const { error } = await supabase
        .from('transacciones_capital')
        .insert({
            destino_cuenta_id: boveda.id,
            monto: monto,
            tipo: 'INGRESO_GENERAL', // Nuevo tipo para diferenciar de APORTE formal
            descripcion: referencia || `Ingreso desde ${origen}`,
            fecha_operacion: new Date().toISOString(),
            // Sobreescribimos cualquier usuario_registro que venga del cliente
            // con la verdad del servidor.
            metadata: {
                ...metadata,
                origen_tipo: origen,
                audit_info: {
                    usuario_id: usuarioId,
                    usuario_email: usuarioResponsable,
                    ip: 'server-action', // Next.js oculta la IP real en actions, se requeriria headers()
                    timestamp_server: new Date().toISOString()
                }
            }
        })

    if (error) {
        console.error('Error registrando ingreso:', error)
        // Manejar el error de Constraint Check (Saldo Negativo) amigablemente
        if (error.code === '23514') { // Code for check violation
            return { error: 'Operación denegada: Saldo insuficiente o negativo.' }
        }
        return { error: error.message }
    }

    revalidatePath('/dashboard/admin/tesoreria')
    return { success: true }
}

export async function asignarCajaAction(_cajeroId: string, _monto: number, _observacion: string) {
    // TODO: Implementar lógica real de asignación (Transferencia Bóveda -> Caja Usuario)
    // Por ahora retornamos error controlado para no romper el build
    return { error: "Funcionalidad en mantenimiento: La asignación de cajas se está migrando al nuevo sistema de Cuentas Financieras." }
}

// ============================================================================
// PAGOS DE CUOTAS
// ============================================================================

export async function registrarPagoCuota(formData: FormData) {
    const supabase = _getServiceClient() // Use Service Role to bypass RLS on financial tables
    const { empresaId } = await requireEmpresaActual()

    const cuotaId = formData.get('cuota_id') as string
    const cuentaOrigenId = formData.get('cuenta_origen_id') as string
    const monto = Number(formData.get('monto') || 0)
    const fechaPago = new Date().toISOString()

    if (!cuotaId || !cuentaOrigenId || monto <= 0) {
        return { error: 'Datos incompletos para el pago' }
    }

    // 1. Verificar Cuota
    const { data: cuota, error: errorCuota } = await supabase
        .from('cronograma_pagos_fondeo')
        .select(`
            *,
            contrato:contratos_fondeo(
                inversionista_id,
                inversionista:inversionistas(
                    persona:personas(nombres, apellido_paterno)
                )
            )
        `)
        .eq('id', cuotaId)
        .single()

    if (errorCuota || !cuota) return { error: 'Cuota no encontrada' }
    if (cuota.estado === 'PAGADO') return { error: 'Esta cuota ya está pagada' }

    // 2. Verificar Saldo Cuenta Origen
    const { data: cuenta, error: errorCuenta } = await supabase
        .from('cuentas_financieras')
        .select('saldo, nombre')
        .eq('id', cuentaOrigenId)
        .single()

    if (errorCuenta || !cuenta) return { error: 'Cuenta de origen no encontrada' }
    if (cuenta.saldo < monto) return { error: 'Saldo insuficiente en la cuenta seleccionada' }

    // 3. ACTUALIZAR TODO

    // 3.1 Descontar Saldo
    const { error: errorUpdateSaldo } = await supabase
        .from('cuentas_financieras')
        .update({ saldo: cuenta.saldo - monto })
        .eq('id', cuentaOrigenId)

    if (errorUpdateSaldo) return { error: 'Error actualizando saldo de cuenta' }

    // 3.2 Registrar Transacción (EGRESO)
    // @ts-expect-error - Acceso anidado seguro
    const nombreInv = `${cuota.contrato?.inversionista?.persona?.nombres || ''} ${cuota.contrato?.inversionista?.persona?.apellido_paterno || ''}`.trim()
    const descripcion = `Pago Cuota #${cuota.numero_cuota} - ${nombreInv}`

    const { error: errorTransaccion } = await supabase
        .from('transacciones_capital')
        .insert({
            tipo: 'EGRESO', // O 'PAGO_RENDIMIENTO' si existiera
            monto: monto,
            descripcion: descripcion,
            fecha_operacion: fechaPago,
            origen_cuenta_id: cuentaOrigenId,
            empresa_id: empresaId,
            metadata: {
                cuota_id: cuotaId,
                contrato_id: cuota.contrato_id,
                tipo_pago: cuota.tipo_pago
            }
        })

    if (errorTransaccion) {
        console.error('Error creando transacción pago:', errorTransaccion)
        return { error: 'Error registrando transacción de egreso' }
    }

    // 3.3 Actualizar Estado Cuota
    const { error: errorUpdateCuota } = await supabase
        .from('cronograma_pagos_fondeo')
        .update({
            estado: 'PAGADO',
            fecha_pago_real: fechaPago,
            updated_at: fechaPago
        })
        .eq('id', cuotaId)

    // Auto-update Contrato summaries is handled by DB triggers/views usually, 
    // or next read will pick up from cronograma (e.g. montos_pagados aggregation)

    if (errorUpdateCuota) return { error: 'Error actualizando estado de la cuota' }

    revalidatePath('/dashboard/admin/inversionistas')
    revalidatePath('/dashboard/admin/tesoreria')

    return { success: true }
}
