import { PremiumDashboard } from "@/components/dashboard/gerencial/PremiumDashboard"
import { KPICards } from "@/components/dashboard/gerencial/KPICards"
import { CashFlowChart } from "@/components/dashboard/gerencial/CashFlowChart"
import { TopClientsTable } from "@/components/dashboard/gerencial/TopClientsTable"
import {
    obtenerKPIsGerenciales,
    obtenerComparativaMensual,
    obtenerFlujoCaja,
    obtenerTop10Clientes
} from "@/lib/actions/dashboard-gerencial-actions"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Enable revalidation every 5 minutes for freshness without killing DB
export const revalidate = 300

export default async function DashboardGerencialPage() {
    // Parallel data fetching
    const [kpis, comparativa, flujoCaja, topClientes] = await Promise.all([
        obtenerKPIsGerenciales(),
        obtenerComparativaMensual(),
        obtenerFlujoCaja(30),
        obtenerTop10Clientes()
    ])

    return (
        <PremiumDashboard>
            <Suspense fallback={<DashboardSkeleton />}>
                {/* 1. KPIs Row */}
                <KPICards
                    data={kpis}
                    comparativa={comparativa}
                />

                {/* 2. Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <CashFlowChart data={flujoCaja} />
                    <TopClientsTable data={topClientes} />
                </div>
            </Suspense>
        </PremiumDashboard>
    )
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Skeleton className="col-span-4 lg:col-span-3 h-[350px] rounded-xl" />
                <Skeleton className="col-span-4 lg:col-span-2 h-[350px] rounded-xl" />
            </div>
        </div>
    )
}
