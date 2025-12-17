
import { Metadata } from "next"
import { AccountsTable } from "@/components/dashboard/tesoreria/AccountsTable"
import { TreasuryStats } from "@/components/dashboard/tesoreria/TreasuryStats"
import { obtenerDetalleCuentas, obtenerEstadoBoveda } from "@/lib/actions/tesoreria-actions"

export const metadata: Metadata = {
    title: "Tesorería Avanzada | JUNTAY",
    description: "Gestión centralizada de capital y cuentas financieras",
}

export default async function TreasuryPage() {
    // Carga de datos paralelo
    const [stats, cuentas] = await Promise.all([
        obtenerEstadoBoveda(),
        obtenerDetalleCuentas(),
    ])

    // Fallback safe defaults if data fetching fails
    const totalCapital = stats?.saldoTotal || 0
    const totalEfectivo = stats?.saldoDisponible || 0
    const totalBancos = stats?.saldoAsignado || 0

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        Tesorería JUNTAY
                    </h2>
                    <p className="text-muted-foreground">
                        Visión en tiempo real del capital operativo y patrimonial.
                    </p>
                </div>
            </div>

            {/* SECCIÓN 1: KPIs SUPERIORES */}
            <TreasuryStats
                totalCapital={totalCapital}
                totalEfectivo={totalEfectivo}
                totalBancos={totalBancos}
            />

            {/* SECCIÓN 2: TABLA DETALLADA DE CUENTAS */}
            <div className="grid gap-6">
                <AccountsTable cuentas={cuentas} />
            </div>

            {/* FUTURE: SECCIÓN 3: HISTORIAL RECIENTE */}
            {/* <RecentTransactions /> */}
        </div>
    )
}
