import { SmartCreditForm } from '@/components/pos/SmartCreditForm'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { FileText } from 'lucide-react'
import { PAGE_TITLES, PAGE_DESCRIPTIONS } from '@/lib/constants/messages'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Loading fallback while SmartCreditForm loads
function FormSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
            <div className="lg:col-span-8 space-y-6">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
            <div className="lg:col-span-4">
                <Skeleton className="h-[500px] w-full rounded-xl" />
            </div>
        </div>
    )
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
            <Suspense fallback={<FormSkeleton />}>
                <SmartCreditForm initialCliente={initialCliente} />
            </Suspense>
        </PageContainer>
    )
}
