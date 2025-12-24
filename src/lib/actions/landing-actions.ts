'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Public Action (Anon)
export async function registrarLead(formData: FormData) {
    const supabase = await createClient()

    // Validate inputs
    const nombre = formData.get('nombre') as string
    const telefono = formData.get('telefono') as string
    const mensaje = formData.get('mensaje') as string
    const monto = formData.get('monto') as string
    const articulo = formData.get('articulo') as string

    if (!nombre || !telefono) {
        return { error: "Nombre y teléfono son obligatorios" }
    }

    try {
        // Try to get empresa_id context if possible, or use default/null
        // Since this works for anon, getEmpresaActual might fail if no session.
        // We will default to the "First Company" or NULL for now. 
        // For SaaS, we might determine tenant from Host header.
        // Hardcoding a TODO: "Resolve Tenant ID from Domain"

        const empresa_id = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || null

        // Use service role if needed? No, RLS allows INSERT for anon.
        // But the client created with `createClient()` uses standard anon key.

        const { error } = await supabase.from('leads').insert({
            nombre,
            telefono,
            mensaje,
            monto_interes: monto ? parseFloat(monto) : null,
            articulo_interes: articulo,
            empresa_id
        })

        if (error) {
            console.error("Error registering lead:", error)
            return { error: "Error al guardar tu solicitud. Intenta por WhatsApp." }
        }

        return { success: true }

    } catch (e) {
        console.error(e)
        return { error: "Error de servidor" }
    }
}
