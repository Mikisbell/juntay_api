import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RematesPanel } from '@/components/remates/RematesPanel'

export const metadata = {
    title: 'Remates | JUNTAY',
    description: 'Catálogo de artículos para remate'
}

export default async function RematesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?redirect=/dashboard/remates')
    }

    // Obtener empleado para vendedorId
    const { data: empleado } = await supabase
        .from('empleados')
        .select('id')
        .eq('user_id', user.id)
        .single()

    return (
        <div className="container mx-auto p-6">
            <RematesPanel vendedorId={empleado?.id || user.id} />
        </div>
    )
}
