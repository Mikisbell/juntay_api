'use client'

import dynamic from 'next/dynamic'
import { WizardSkeleton } from '@/components/ui/loading-skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContainer } from '@/components/layout/PageContainer'
import { FileText } from 'lucide-react'
import { PAGE_TITLES, PAGE_DESCRIPTIONS } from '@/lib/constants/messages'

const CotizadorWizard = dynamic(
    () => import('@/components/cotizador/CotizadorWizard'),
    {
        loading: () => <WizardSkeleton />,
        ssr: false
    }
)

export default function NuevoEmpenoPage() {
    return (
        <PageContainer>
            <PageHeader
                title={PAGE_TITLES.nuevoEmpeno}
                description={PAGE_DESCRIPTIONS.nuevoEmpeno}
                icon={FileText}
            />
            <CotizadorWizard />
        </PageContainer>
    )
}
