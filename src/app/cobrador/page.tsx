import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CobradorDashboard } from '@/components/cobrador/CobradorDashboard'

export const metadata = {
    title: 'Cobrador | JUNTAY',
    description: 'App móvil para cobradores de campo',
    manifest: '/manifest.json',
    themeColor: '#1a1a2e',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default async function CobradorPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?redirect=/cobrador')
    }

    // Verificar que es un cobrador
    const { data: empleado } = await supabase
        .from('empleados')
        .select('id, nombres, apellido_paterno, rol')
        .eq('user_id', user.id)
        .single()

    if (!empleado) {
        redirect('/dashboard')
    }

    const nombreCompleto = `${empleado.nombres} ${empleado.apellido_paterno}`

    return (
        <main className="min-h-screen bg-background">
            <CobradorDashboard
                cobradorId={empleado.id}
                cobradorNombre={nombreCompleto}
            />
        </main>
    )
}
