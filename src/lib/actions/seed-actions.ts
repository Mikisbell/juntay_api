'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const NOMBRES = ["Juan", "María", "Carlos", "Ana", "Luis", "Elena", "Pedro", "Sofia", "Miguel", "Lucía", "Jorge", "Carmen", "Fernando", "Rosa", "Daniel", "Patricia", "Roberto", "Isabel", "David", "Teresa", "Alejandro", "Valentina", "Sebastian", "Camila", "Mateo", "Julia", "Nicolas", "Paula", "Diego", "Martina"]
const APELLIDOS = ["Pérez", "García", "López", "Sánchez", "Rodríguez", "González", "Martínez", "Fernández", "Gómez", "Díaz", "Hernández", "Álvarez", "Romero", "Ruiz", "Torres", "Vargas", "Ramos", "Flores", "Mendoza", "Castillo", "Silva", "Rojas", "Cruz", "Morales", "Ortiz", "Gutierrez", "Chavez", "Velasquez", "Reyes", "Jimenez"]

// Perfiles para distribución realista
interface PerfilCliente {
    tipo: string;
    prob: number;
    scoreMin: number;
    scoreMax: number;
    creditosMax: number;
}

const PERFILES: PerfilCliente[] = [
    { tipo: 'NUEVO', prob: 0.25, scoreMin: 1, scoreMax: 500, creditosMax: 1 },
    { tipo: 'ESTANDAR', prob: 0.50, scoreMin: 501, scoreMax: 750, creditosMax: 3 },
    { tipo: 'VIP', prob: 0.25, scoreMin: 751, scoreMax: 1000, creditosMax: 5 }
]

const GARANTIAS_TIPOS = [
    { tipo: 'JOYA', min: 200, max: 1500, descripcion: 'Anillo de oro 18k' },
    { tipo: 'JOYA', min: 1000, max: 4000, descripcion: 'Cadena de oro 24k con dije' },
    { tipo: 'JOYA', min: 500, max: 2000, descripcion: 'Pulsera de oro 18k' },
    { tipo: 'ELECTRO', min: 800, max: 2500, descripcion: 'Laptop HP Ryzen 5' },
    { tipo: 'ELECTRO', min: 1200, max: 4500, descripcion: 'Smart TV Samsung 65" 4K' },
    { tipo: 'ELECTRO', min: 500, max: 1500, descripcion: 'Console PlayStation 5' },
    { tipo: 'VEHICULO', min: 4000, max: 12000, descripcion: 'Moto Honda CB190R' },
    { tipo: 'VEHICULO', min: 3500, max: 9000, descripcion: 'Moto Yamaha FZ' }
]

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function seedClientes(cantidad: number = 500) {
    const supabase = createAdminClient()

    console.log("🚀 Iniciando proceso de seeding (ADMIN - Schema Correcto)...")

    // 1. Limpieza TOTAL con orden seguro (evitar FK constraints)
    try {
        console.log("🧹 Limpiando base de datos...")
        // Orden correcto según FK: pagos -> creditos -> garantias -> clientes
        await supabase.from('pagos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('creditos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('garantias').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('clientes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        console.log("✅ Base de datos limpia.")
    } catch (e) {
        console.error("Error limpiando:", e)
        return { success: false, message: "Error crítico al limpiar la base de datos." }
    }

    // 2. Generación por Lotes para Performance
    const BATCH_SIZE = 50
    let generados = 0
    const batches = Math.ceil(cantidad / BATCH_SIZE)

    console.log(`🏭 Generando ${cantidad} clientes en ${batches} lotes...`)

    for (let i = 0; i < batches; i++) {
        const promesas_cliente = []

        for (let j = 0; j < BATCH_SIZE; j++) {
            if (generados >= cantidad) break;
            promesas_cliente.push(crearClienteCompleto(supabase));
            generados++
        }

        await Promise.all(promesas_cliente)
        console.log(`✅ Lote ${i + 1}/${batches} completado.`)
    }

    revalidatePath('/dashboard/clientes')
    return { success: true, message: `Éxito: Se generaron ${generados} clientes con préstamos y garantías.` }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function crearClienteCompleto(supabase: any) {
    // 1. Determinar Perfil
    const randPerfil = Math.random()
    let perfil = PERFILES[0]
    if (randPerfil > 0.25) perfil = PERFILES[1]
    if (randPerfil > 0.75) perfil = PERFILES[2]

    const nombre = getRandomItem(NOMBRES)
    const apellidoP = getRandomItem(APELLIDOS)
    const apellidoM = getRandomItem(APELLIDOS)
    const dni = getRandomInt(10000000, 99999999).toString()
    const activo = Math.random() < 0.95

    // Crear Cliente
    const { data: cliente, error } = await supabase.from('clientes').insert({
        nombres: nombre,
        apellido_paterno: apellidoP,
        apellido_materno: apellidoM,
        tipo_documento: 'DNI',
        numero_documento: dni,
        telefono_principal: `9${getRandomInt(10000000, 99999999)}`,
        email: `${nombre.toLowerCase().substring(0, 1)}${apellidoP.toLowerCase()}${getRandomInt(1, 999)}@test.com`,
        direccion: `Av. Ficticia ${getRandomInt(100, 9999)}, Distrito ${getRandomInt(1, 20)}`,
        activo: activo,
        score_crediticio: getRandomInt(perfil.scoreMin, perfil.scoreMax)
    }).select().single()

    if (error || !cliente) {
        console.error("Error creando cliente:", error?.message)
        return
    }

    // Solo clientes activos tienen créditos
    if (!cliente.activo) return

    // 90% de probabilidad de tener al menos un crédito
    if (Math.random() < 0.90) {
        const numCreditos = getRandomInt(1, perfil.creditosMax)
        for (let k = 0; k < numCreditos; k++) {
            await crearCreditoParaCliente(supabase, cliente.id, perfil)
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function crearCreditoParaCliente(supabase: any, clienteId: string, perfil: PerfilCliente) {
    const garantiaTipo = getRandomItem(GARANTIAS_TIPOS)
    const valorTasacion = getRandomInt(garantiaTipo.min * 1.5, garantiaTipo.max * 1.5)
    const montoPrestamo = getRandomInt(garantiaTipo.min, garantiaTipo.max)

    // Determinar estado del crédito
    let estado = 'vigente'
    let diasVencimiento = getRandomInt(15, 60)
    const randEstado = Math.random()

    if (perfil.tipo !== 'VIP') {
        if (randEstado < 0.15) {
            estado = 'vencido' // Mora severa
            diasVencimiento = getRandomInt(-120, -31)
        } else if (randEstado < 0.35) {
            estado = 'vencido' // Vencido reciente
            diasVencimiento = getRandomInt(-30, -1)
        } else if (randEstado < 0.50) {
            estado = 'por_vencer'
            diasVencimiento = getRandomInt(0, 3)
        }
    } else {
        if (randEstado < 0.05) {
            estado = 'vencido'
            diasVencimiento = getRandomInt(-5, -1)
        }
    }

    const fechaVencimiento = new Date()
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVencimiento)

    // 1. Crear Garantía (vinculada al cliente)
    const { data: garantia, error: errorGarantia } = await supabase.from('garantias').insert({
        cliente_id: clienteId,
        descripcion: garantiaTipo.descripcion,
        valor_tasacion: valorTasacion,
        valor_prestamo_sugerido: montoPrestamo,
        estado: 'custodia'
    }).select().single()

    if (errorGarantia || !garantia) {
        console.error("Error creando garantía:", errorGarantia?.message)
        return
    }

    // 2. Crear Crédito (vinculado a cliente y garantía)
    const { error: errorCredito } = await supabase.from('creditos').insert({
        cliente_id: clienteId,
        garantia_id: garantia.id,
        monto_prestado: montoPrestamo,
        tasa_interes: getRandomInt(3, 8), // 3-8% mensual
        periodo_dias: 30,
        fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
        saldo_pendiente: montoPrestamo,
        estado: estado
    })

    if (errorCredito) {
        console.error("Error creando crédito:", errorCredito.message)
    }
}
