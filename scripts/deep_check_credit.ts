
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) process.exit(1)

const supabase = createClient(supabaseUrl, supabaseKey)

async function deepCheck() {
    const codigo = 'JT-20251214-3556'

    const { data: credit } = await supabase
        .from('creditos')
        .select('*')
        .eq('codigo', codigo)
        .single()

    if (credit) {
        console.log('--- Deep Check ---')
        console.log(`Monto Prestado: ${credit.monto_prestado}`)
        console.log(`Saldo Pendiente: ${credit.saldo_pendiente}`)
        console.log(`Estado: ${credit.estado}`)
        console.log(`Fecha Vencimiento: ${credit.fecha_vencimiento}`)

        // Check if Balance == Principal (Correct for pure interest renewal)
        // Or if Balance < Principal (Incorrect, trigger reduced it)
        if (credit.saldo_pendiente < credit.monto_prestado) {
            console.warn('⚠️  ALERTA: El saldo es MENOR que el prestamo. El trigger restó capital!')
        } else {
            console.log('✅ Saldo correcto (Igual al prestamo).')
        }
    }
}

deepCheck()
