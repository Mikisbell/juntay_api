import { SmartCreditForm } from '@/components/pos/SmartCreditForm'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { FileText } from 'lucide-react'
import { PAGE_TITLES, PAGE_DESCRIPTIONS } from '@/lib/constants/messages'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function NuevoEmpenoPage(props: PageProps) {
    const searchParams = await props.searchParams
    const clienteId = typeof searchParams.clienteId === 'string' ? searchParams.clienteId : undefined
    let initialCliente = undefined

    if (clienteId) {
        const supabase = await createClient()
        const { data } = await supabase.from('clientes')
            .select('nombres, apellido_paterno, apellido_materno')
            .eq('id', clienteId)
            .single()

        if (data) {
            initialCliente = {
                id: clienteId,
                nombre: `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}`.trim()
            }
        }
    }

    return (
        <PageContainer>
            <PageHeader
                title={PAGE_TITLES.nuevoEmpeno}
                description={PAGE_DESCRIPTIONS.nuevoEmpeno}
                icon={FileText}
            />
            {/* Smart POS Unificado */}
            <SmartCreditForm initialCliente={initialCliente} />
        </PageContainer>
    )
}
