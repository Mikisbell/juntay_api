import { notFound } from "next/navigation"
import { getClienteById, getClienteResumenFinanciero } from "@/lib/actions/clientes-actions"
import { ClienteDetalleView } from "./ClienteDetalleView"
import { createClient } from "@/lib/supabase/server"

interface PageProps {
    params: Promise<{ id: string }>
}

export const metadata = {
    title: "Perfil 360° | Juntay Dashboard",
    description: "Visión integral del cliente financiero"
}

export default async function Page(props: PageProps) {
    const params = await props.params
    const { id } = params
    const supabase = await createClient()

    // Fetch data in parallel for performance
    const [cliente, resumen, creditosResult] = await Promise.all([
        getClienteById(id),
        getClienteResumenFinanciero(id),
        supabase
            .from('creditos')
            .select(`
                id,
                codigo,
                monto_prestamo: monto_prestado,
                saldo_actual: saldo_pendiente,
                fecha_desembolso: fecha_inicio,
                fecha_vencimiento,
                estado,
                garantia_id
            `)
            .eq('cliente_id', id)
            .order('fecha_inicio', { ascending: false })
    ])

    if (!cliente) {
        notFound()
    }

    // Map creditos to expected format
    const creditos = (creditosResult.data || []).map((c: any) => ({
        id: c.id,
        codigo_credito: c.codigo,
        monto_prestamo: c.monto_prestamo || 0,
        saldo_actual: c.saldo_actual,
        fecha_desembolso: c.fecha_desembolso,
        fecha_vencimiento: c.fecha_vencimiento,
        estado: c.estado,
        garantia: { descripcion: 'Ver detalle del contrato' }
    }))

    return <ClienteDetalleView cliente={cliente} resumen={resumen} creditos={creditos} />
}
