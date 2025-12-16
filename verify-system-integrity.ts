
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifySystemIntegrity() {
    console.log('🔍 Iniciando Verificación de Integridad del Sistema...\n');

    // 1. Obtener el último contrato creado
    const { data: contrato, error: errContrato } = await supabase
        .from('contratos')
        .select(`
      *,
      cliente:clientes(*),
      garantias(*),
      movimientos_caja(*)
    `)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (errContrato) {
        console.error('❌ Error obteniendo contrato:', errContrato.message);
        return;
    }

    if (!contrato) {
        console.warn('⚠️ No se encontraron contratos en el sistema.');
        return;
    }

    console.log(`📄 Último Contrato: ${contrato.codigo_contrato} (ID: ${contrato.id})`);
    console.log(`📅 Fecha: ${new Date(contrato.created_at).toLocaleString()}`);
    console.log(`👤 Cliente: ${contrato.cliente.nombre_completo} (Doc: ${contrato.cliente.numero_documento})`);
    console.log(`💰 Monto Préstamo: S/ ${contrato.monto_prestamo}`);

    // 2. Verificar Estado del Contrato
    if (contrato.estado === 'VIGENTE') {
        console.log('✅ Estado Contrato: VIGENTE');
    } else {
        console.error(`❌ Estado Contrato: ${contrato.estado} (Esperado: VIGENTE)`);
    }

    // 3. Verificar Garantías
    if (contrato.garantias && contrato.garantias.length > 0) {
        console.log(`✅ Garantías: ${contrato.garantias.length} items registrados.`);
        contrato.garantias.forEach((g: any, i: number) => {
            console.log(`   - Item ${i + 1}: ${g.descripcion} (${g.estado})`);
        });
    } else {
        console.error('❌ Garantías: No se encontraron garantías asociadas.');
    }

    // 4. Verificar Movimiento de Caja
    // El contrato debería tener un movimiento de caja asociado (egreso)
    // Buscamos en la relación o directamente en la tabla si la relación no trajo nada
    let movimiento = contrato.movimientos_caja?.[0];

    if (!movimiento) {
        // Intento de búsqueda manual si la relación falla
        const { data: mov } = await supabase
            .from('movimientos_caja')
            .select('*')
            .eq('referencia_id', contrato.id)
            .eq('tipo_movimiento', 'EGRESO')
            .single();
        movimiento = mov;
    }

    if (movimiento) {
        console.log(`✅ Movimiento de Caja: Detectado (ID: ${movimiento.id})`);
        console.log(`   - Tipo: ${movimiento.tipo_movimiento}`);
        console.log(`   - Monto: S/ ${movimiento.monto}`);
        console.log(`   - Concepto: ${movimiento.concepto}`);

        if (Math.abs(movimiento.monto) === Number(contrato.monto_prestamo)) {
            console.log('✅ Integridad Financiera: El monto del movimiento coincide con el préstamo.');
        } else {
            console.error(`❌ Integridad Financiera: Discrepancia (Contrato: ${contrato.monto_prestamo} vs Movimiento: ${movimiento.monto})`);
        }
    } else {
        console.error('❌ Movimiento de Caja: NO SE ENCONTRÓ movimiento asociado al contrato.');
    }

    console.log('\n🏁 Verificación Completada.');
}

verifySystemIntegrity();
