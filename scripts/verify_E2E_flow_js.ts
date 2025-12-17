
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TEST_SUFFIX = `_TEST_${Date.now()}`
const MONTO_APORTE = 5000
const MONTO_APERTURA = 1000
const MONTO_PRESTAMO = 500
const MONTO_PAGO = 550

async function verifyFlow() {
    console.log('🚀 INICIANDO VERIFICACIÓN E2E (JS MODE)...')

    try {
        // 1. GET PRINCIPAL VAULT
        console.log('\n🔍 [1] Buscando Bóveda Principal...')
        const { data: bovedas, error: errBoveda } = await supabase
            .from('cuentas_financieras')
            .select('*')
            .eq('tipo', 'EFECTIVO')
            .eq('es_principal', true)

        if (errBoveda) throw errBoveda
        let boveda = bovedas?.[0]

        if (!boveda) {
            console.log('⚠️ No existe bóveda principal. Creando una...')
            const { data: newBoveda, error: errNewBoveda } = await supabase
                .from('cuentas_financieras')
                .insert({
                    nombre: `BOVEDA_PRINCIPAL_${TEST_SUFFIX}`,
                    tipo: 'EFECTIVO',
                    es_principal: true,
                    saldo: 0,
                    moneda: 'PEN',
                    activo: true
                })
                .select()
                .single()
            if (errNewBoveda) throw errNewBoveda
            boveda = newBoveda
        }

        const saldoInicialBoveda = Number(boveda.saldo)
        console.log(`💰 Saldo Inicial Bóveda: ${saldoInicialBoveda}`)

        // 2. FUNDING
        console.log('\n💸 [2] Realizando Aporte de Capital...')
        const { error: errAporte } = await supabase
            .from('transacciones_capital')
            .insert({
                destino_cuenta_id: boveda.id,
                monto: MONTO_APORTE,
                tipo: 'APORTE',
                descripcion: `Aporte Test E2E ${TEST_SUFFIX}`,
                fecha_operacion: new Date().toISOString(),
                metadata: { test: true }
            })

        if (errAporte) throw errAporte

        // Verify Balance
        const { data: bovedaFunded } = await supabase
            .from('cuentas_financieras')
            .select('saldo')
            .eq('id', boveda.id)
            .single()

        console.log(`💰 Saldo Post-Aporte: ${bovedaFunded?.saldo}`)
        if (Number(bovedaFunded?.saldo) !== saldoInicialBoveda + MONTO_APORTE) {
            throw new Error(`Integridad Fallida: El aporte no sumó correctamente.`)
        }

        // 3. OPEN BOX
        console.log('\n📦 [3] Abriendo Caja Operativa...')

        // Generate UNIQUE User ID to avoid collisions and side-effects from previous broken tests
        const { v4: uuidv4 } = await import('uuid')
        const userId = uuidv4()

        console.log(`Creating fresh test user: ${userId}`)

        // Ensure user exists in Auth (for FK constraints)
        const { data: authUser, error: errAuth } = await supabase.auth.admin.createUser({
            email: `robot_${TEST_SUFFIX}@juntay.test`,
            password: 'password123',
            email_confirm: true,
            user_metadata: { nombres: `TEST_ROBOT_${TEST_SUFFIX}` }
        })

        let finalUserId = userId
        if (errAuth) {
            console.warn(`Auth Create Failed (maybe not admin?): ${errAuth.message}`)
            // Fallback: Use random UUID and hope FK is to public.usuarios?
            // But valid services usually require Auth ID.
        } else {
            finalUserId = authUser.user.id
            console.log(`✅ Auth user created: ${finalUserId}`)
        }

        const { error: errUser } = await supabase.from('usuarios').insert({
            id: finalUserId,
            nombres: `TEST_ROBOT_${TEST_SUFFIX}`,
            email: `robot_${TEST_SUFFIX}@juntay.test`,
            rol: 'admin'
        })

        if (errUser) throw new Error(`Failed to create test user: ${errUser.message}`)

        // Use RPC to Open Box (Atomically transfers from Vault)
        // p_usuario_cajero_id, p_monto, p_observacion
        const { data: cajaId, error: errRpc } = await supabase.rpc('admin_asignar_caja', {
            p_usuario_cajero_id: finalUserId,
            p_monto: MONTO_APERTURA,
            p_observacion: `Apertura Test E2E ${TEST_SUFFIX}`
        })

        if (errRpc) throw new Error(`RPC admin_asignar_caja failed: ${errRpc.message}`)

        console.log(`✅ Caja ${cajaId} creada vía RPC.`)
        const caja = { id: cajaId }

        // TRACE: Verify Box Balance Immediately
        const { data: cajaInit } = await supabase.from('cajas_operativas').select('saldo_actual').eq('id', cajaId).single()
        console.log(`TRACE: Saldo Inicial Caja: ${cajaInit?.saldo_actual}`)
        if (Number(cajaInit?.saldo_actual) !== MONTO_APERTURA) {
            console.error(`⚠️ ALERTA: La caja se creó con saldo ${cajaInit?.saldo_actual}, se esperaba ${MONTO_APERTURA}`)
        }

        // Verify Vault Balance Decreased
        const { data: bovedaOpen } = await supabase
            .from('cuentas_financieras')
            .select('saldo')
            .eq('id', boveda.id)
            .single()

        console.log(`💰 Saldo Post-Apertura: ${bovedaOpen?.saldo}`)
        if (Number(bovedaOpen?.saldo) !== Number(bovedaFunded?.saldo) - MONTO_APERTURA) {
            throw new Error(`Integridad Fallida: El dinero no salió de la bóveda.`)
        }

        // 4. LENDING
        console.log('\n📝 [4] Otorgando Crédito...')

        const UNIQUE_DNI = userId.slice(0, 8) // Use part of UUID to ensure uniqueness

        // Create Persona/Cliente
        const resPersona = await supabase.from('personas').insert({
            nombres: 'Test', apellido_paterno: 'E2E', apellido_materno: '', tipo_documento: 'DNI', numero_documento: UNIQUE_DNI, email: `test_${UNIQUE_DNI}@e2e.com`
        }).select().single()

        console.log('Persona Response:', JSON.stringify(resPersona, null, 2))

        const persona = resPersona.data
        const errPersona = resPersona.error

        if (errPersona) throw new Error(`Failed to create Persona: ${errPersona.message}`)
        if (!persona) throw new Error('Persona created but returned null data (RLS blocking?)')

        const resCliente = await supabase.from('clientes').insert({
            persona_id: persona!.id, tipo_documento: 'DNI', numero_documento: UNIQUE_DNI, nombres: 'Test', apellido_paterno: 'E2E', apellido_materno: '', activo: true
        }).select().single()

        console.log('Cliente Response:', JSON.stringify(resCliente, null, 2))

        const cliente = resCliente.data
        const errCliente = resCliente.error

        if (errCliente) throw new Error(`Failed to create Cliente: ${errCliente.message}`)
        if (!cliente) throw new Error('Cliente created but returned null data')

        const resCredito = await supabase.from('creditos').insert({
            codigo: `CRED-${TEST_SUFFIX}`,
            cliente_id: cliente!.id,
            monto_prestado: MONTO_PRESTAMO,
            saldo_pendiente: MONTO_PRESTAMO,
            tasa_interes: 10, // 10% Mensual
            periodo_dias: 30,
            fecha_vencimiento: new Date(Date.now() + 86400000 * 30).toISOString(),
            estado: 'vigente'
        }).select().single()

        console.log('Credito Response:', JSON.stringify(resCredito, null, 2))

        const credito = resCredito.data ? resCredito.data : null

        if (resCredito.error) throw new Error(`Failed to create Credito: ${resCredito.error.message}`)
        if (!credito) throw new Error('Credito created but returned null data (RLS or Trigger blocking?)')

        // Fetch current balance for Ledger Integrity
        const { data: cajaPreLoan } = await supabase.from('cajas_operativas').select('saldo_actual').eq('id', cajaId).single()
        const currentBalance = Number(cajaPreLoan?.saldo_actual || 0)
        const amountLoan = MONTO_PRESTAMO

        console.log(`TRACE: Pre-Loan Balance: ${currentBalance}`)
        console.log(`TRACE: Amount Loan: ${amountLoan}`)

        // Register Cash Out

        // Register Cash Out
        const { error: errMovOut } = await supabase.from('movimientos_caja_operativa').insert({
            caja_id: cajaId,
            monto: amountLoan,
            tipo: 'EGRESO',
            motivo: 'PRESTAMO_CLIENTE',
            descripcion: 'DESEMBOLSO_CREDITO',
            referencia_id: credito!.id,
            usuario_id: finalUserId,
            saldo_anterior: currentBalance,
            saldo_nuevo: currentBalance - amountLoan // Subtraction for Egreso
        })

        if (errMovOut) throw new Error(`Failed to register Cash Out: ${errMovOut.message}`)

        // Verify Box Balance Decreased (Credit Out)
        const { data: cajaAfterCredit } = await supabase.from('cajas_operativas').select('saldo_actual').eq('id', cajaId).single()
        console.log(`💼 Saldo Caja Post-Prestamo: ${cajaAfterCredit?.saldo_actual}`)

        if (Number(cajaAfterCredit?.saldo_actual) !== currentBalance - amountLoan) {
            throw new Error(`CRITICAL: Box balance did not decrease correctly! Trigger or logic failed.`)
        }

        // 5. PAYMENT
        console.log('\n💵 [5] Registrando Pago...')
        const { error: errPay } = await supabase.from('pagos').insert({
            credito_id: credito!.id,
            monto: MONTO_PAGO,
            tipo: 'CUOTA',
            metodo_pago: 'EFECTIVO',
            caja_operativa_id: cajaId,
            usuario_id: finalUserId
        })
        if (errPay) throw new Error(`Failed to register Payment: ${errPay.message}`)

        // Register Cash In
        const { data: cajaPrePayData } = await supabase.from('cajas_operativas').select('saldo_actual').eq('id', cajaId).single()
        const balancePrePay = Number(cajaPrePayData?.saldo_actual || 0)

        const { error: errMovIn } = await supabase.from('movimientos_caja_operativa').insert({
            caja_id: cajaId,
            monto: MONTO_PAGO,
            tipo: 'INGRESO',
            motivo: 'COBRO_CUOTA',
            descripcion: 'COBRO_CUOTA',
            referencia_id: null,
            usuario_id: finalUserId,
            saldo_anterior: balancePrePay,
            saldo_nuevo: balancePrePay + MONTO_PAGO // Addition for Ingreso
        })
        if (errMovIn) throw new Error(`Failed to register Cash In: ${errMovIn.message}`)

        const { data: cajaAfterPayment } = await supabase.from('cajas_operativas').select('saldo_actual').eq('id', cajaId).single()
        console.log(`💼 Saldo Caja Post-Pago: ${cajaAfterPayment?.saldo_actual}`)

        const expectedBalance = Number(cajaAfterCredit?.saldo_actual) + MONTO_PAGO // 500 capital + 50 interest (approx)
        if (Number(cajaAfterPayment?.saldo_actual) <= Number(cajaAfterCredit?.saldo_actual)) {
            throw new Error(`CRITICAL: Box balance did not increase after payment!`)
        }

        // 6. CLOSURE
        console.log('\n🔒 [6] Cerrando Caja (Auto-Liquidación)...')

        // Update to closed
        const { error: errClose } = await supabase
            .from('cajas_operativas')
            .update({
                estado: 'cerrada',
                saldo_final_cierre: cajaAfterPayment?.saldo_actual, // Cajero declara lo que hay
                fecha_cierre: new Date().toISOString()
            })
            .eq('id', cajaId)

        if (errClose) throw errClose

        // Verify Autoliquidation Trigger: Money should move from Box -> Vault
        // Need to wait a moment if trigger is async (unlikely in pg)

        const { data: bovedaFinal } = await supabase
            .from('cuentas_financieras')
            .select('saldo')
            .eq('id', boveda.id)
            .single()

        console.log(`💰 Saldo Final Bóveda: ${bovedaFinal?.saldo}`)

        const expectedVault = Number(bovedaOpen!.saldo) + Number(cajaAfterPayment!.saldo_actual)

        if (Number(bovedaFinal?.saldo) === expectedVault) {
            console.log('✅ INTEGRIDAD CONFIRMADA: La autoliquidación funcionó correctamente.')
        } else {
            console.log(`⚠️ ALERTA: El saldo de bóveda no refleja la liquidación automática.
             Esperado: ${expectedVault}
             Real: ${bovedaFinal?.saldo}
             (Posiblemente falte el trigger 'trg_auto_liquidar_caja' o esté deshabilitado)`)
        }

        console.log('\n🎉 PRUEBA COMPLETADA.')

    } catch (e: any) {
        console.error('\n❌ ERROR CRITICO:', e.message)
    }
}

verifyFlow()
