const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function main() {
    // 1. Conexión a DB Local (Docker)
    const client = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
    await client.connect();
    console.log("🚀 INICIANDO SIMULACIÓN DE CICLO COMPLETO DE NEGOCIO\n");

    try {
        await client.query('BEGIN'); // Transacción para no ensuciar si falla

        // ---------------------------------------------------------
        // PASO 1:Crear Empresa (SaaS Level)
        // ---------------------------------------------------------
        const empresaId = uuidv4();
        console.log(`1️⃣  Creando Empresa (Tenant)...`);
        await client.query(`
            INSERT INTO empresas (id, ruc, razon_social, nombre_comercial, activo)
            VALUES ($1, '20600000001', 'Empresa Demo Flow SAC', 'Juntay Demo', true)
        `, [empresaId]);
        console.log(`   ✅ Empresa creada: ${empresaId}`);

        // ---------------------------------------------------------
        // PASO 2: Crear Sucursal (Setup Level)
        // ---------------------------------------------------------
        const sucursalId = uuidv4();
        console.log(`2️⃣  Creando Sucursal...`);
        await client.query(`
            INSERT INTO sucursales (id, empresa_id, codigo, nombre, direccion)
            VALUES ($1, $2, 'SUC-001', 'Sede Principal', 'Av. Demo 123')
        `, [sucursalId, empresaId]);
        console.log(`   ✅ Sucursal creada`);

        // ---------------------------------------------------------
        // PASO 2.5: Crear Usuario y Caja (Operations Level)
        // ---------------------------------------------------------
        const usuarioId = uuidv4();
        console.log(`2️⃣.5️⃣  Registrando Cajero (Auth & Public)...`);

        // Insertar en auth.users (Simulación de Supabase Auth)
        await client.query(`
            INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
            VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cajero@demo.com', 'hash', NOW(), NOW(), NOW())
        `, [usuarioId]);

        // Luego en public.usuarios
        await client.query(`
            INSERT INTO usuarios (id, empresa_id, email, nombres, rol)
            VALUES ($1, $2, 'cajero@demo.com', 'Cajero Demo', 'CAJERO')
        `, [usuarioId, empresaId]);

        const cajaId = uuidv4();
        console.log(`2️⃣.5️⃣  Abriendo Caja Operativa...`);
        await client.query(`
            INSERT INTO cajas_operativas (
                id, empresa_id, usuario_id, numero_caja, estado, saldo_inicial, saldo_actual, fecha_apertura
            )
            VALUES ($1, $2, $3, 1, 'abierta', 1000.00, 1000.00, NOW())
        `, [cajaId, empresaId, usuarioId]);
        console.log(`   ✅ Caja ${cajaId} abierta con S/1000`);

        // ---------------------------------------------------------
        // PASO 3: Crear Cliente (CRM Level)
        // ---------------------------------------------------------
        const clienteId = uuidv4();
        console.log(`3️⃣  Registrando Cliente...`);
        await client.query(`
            INSERT INTO clientes (id, empresa_id, tipo_documento, numero_documento, nombres, apellido_paterno)
            VALUES ($1, $2, 'DNI', '99999999', 'Juan', 'Perez Flow')
        `, [clienteId, empresaId]);
        console.log(`   ✅ Cliente creado`);

        // ---------------------------------------------------------
        // PASO 4: Crear Garantía (Collateral Level)
        // ---------------------------------------------------------
        const garantiaId = uuidv4();
        console.log(`4️⃣  Recibiendo Garantía (Joya)...`);
        await client.query(`
            INSERT INTO garantias (id, empresa_id, cliente_id, descripcion, valor_tasacion, estado, quilataje, peso)
            VALUES ($1, $2, $3, 'Anillo de Oro 18k', 800.00, 'custodia', '18k', 5.5)
        `, [garantiaId, empresaId, clienteId]);
        console.log(`   ✅ Garantía en Custodia`);

        // ---------------------------------------------------------
        // PASO 5: Crear Crédito (Lending Level)
        // ---------------------------------------------------------
        const creditoId = uuidv4();
        const montoPrestamo = 500.00;
        const tasaInteres = 10.00; // 10%
        console.log(`5️⃣  Otorgando Préstamo...`);
        await client.query(`
            INSERT INTO creditos (
                id, empresa_id, sucursal_id, cliente_id, 
                monto_prestado, tasa_interes, periodo_dias, 
                fecha_desembolso, fecha_vencimiento, 
                saldo_pendiente, estado, estado_detallado
            )
            VALUES ($1, $2, $3, $4, $5, $6, 30, NOW(), NOW() + interval '30 days', $5, 'vigente', 'AL_DIA')
        `, [creditoId, empresaId, sucursalId, clienteId, montoPrestamo, tasaInteres]);

        // Vincular garantía al crédito
        await client.query('UPDATE garantias SET credito_id = $1 WHERE id = $2', [creditoId, garantiaId]);
        console.log(`   ✅ Crédito ${creditoId} creado y vinculado a garantía`);

        // ---------------------------------------------------------
        // PASO 6: Simular Pago y Devolución (Transaction Level)
        // ---------------------------------------------------------
        console.log(`6️⃣  Cliente devuelve el dinero (Pago)...`);
        const pagoId = uuidv4();
        const interes = montoPrestamo * (tasaInteres / 100);
        const totalPagar = montoPrestamo + interes;

        await client.query(`
            INSERT INTO pagos (
                id, empresa_id, sucursal_id, credito_id, 
                monto_total, medio_pago, tipo, fecha_pago,
                caja_operativa_id, usuario_id
            )
            VALUES ($1, $2, $3, $4, $5, 'EFECTIVO', 'PAGO_FINAL', NOW(), $6, $7)
        `, [pagoId, empresaId, sucursalId, creditoId, totalPagar, cajaId, usuarioId]);

        // Actualizar Crédito a Cancelado (EL SISTEMA LO HACE AUTO POR TRIGGER?)
        /* 
        await client.query(`
            UPDATE creditos 
            SET saldo_pendiente = 0, estado = 'cancelado', fecha_cancelacion = NOW()
            WHERE id = $1
        `, [creditoId]);
        */

        // Liberar Garantía
        await client.query(`
            UPDATE garantias 
            SET estado = 'devuelta', credito_id = NULL
            WHERE id = $1
        `, [garantiaId]);

        console.log(`   ✅ Pago registrado de ${totalPagar}`);

        // ---------------------------------------------------------
        // VERIFICACIÓN FINAL
        // ---------------------------------------------------------
        console.log(`\n🕵️  VERIFICANDO CONSISTENCIA DE DATOS...`);

        const checkCredito = await client.query('SELECT estado, saldo_pendiente FROM creditos WHERE id = $1', [creditoId]);
        const checkGarantia = await client.query('SELECT estado FROM garantias WHERE id = $1', [garantiaId]);

        console.log(`   Estado Crédito: ${checkCredito.rows[0].estado} (Esperado: cancelado)`);
        console.log(`   Estado Garantía: ${checkGarantia.rows[0].estado} (Esperado: devuelta)`);

        if (checkCredito.rows[0].estado === 'cancelado' && checkGarantia.rows[0].estado === 'devuelta') {
            console.log(`\n🎉 LA PRUEBA FLUYÓ EXITOSAMENTE: El dinero entró y el bien salió.`);
        } else {
            console.error(`\n❌ ERROR EN EL FLUJO.`);
        }

        await client.query('ROLLBACK'); // Deshacer cambios para no ensuciar DB real
        console.log("\n(Nota: Los datos de prueba fueron revertidos via ROLLBACK para mantener limpia la DB)");

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("❌ ERROR CRÍTICO EN SIMULACIÓN:", e);
    } finally {
        await client.end();
    }
}

main();
