
'use client'

import { TrendingUp, Wallet, Landmark } from "lucide-react"

interface TreasuryStatsProps {
    totalCapital: number
    totalEfectivo: number
    totalBancos: number
}

export function TreasuryStats({ totalCapital, totalEfectivo, totalBancos }: TreasuryStatsProps) {
    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* CARD 1: CAPITAL TOTAL (Purple/Blue Gradient) */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 p-[1px] shadow-xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-50" />
                <div className="relative h-full rounded-xl bg-slate-950/80 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-300 uppercase tracking-wider">Capital Total</p>
                        <div className="rounded-full bg-indigo-500/20 p-2 text-indigo-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold text-white tracking-tight">{formatMoney(totalCapital)}</h3>
                        <p className="mt-1 text-xs text-indigo-200/60">Patrimonio neto disponible</p>
                    </div>
                </div>
            </div>

            {/* CARD 2: LIQUIDEZ / EFECTIVO (Emerald/Green Gradient) */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-900 to-slate-900 p-[1px] shadow-xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-50" />
                <div className="relative h-full rounded-xl bg-slate-950/80 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-emerald-300 uppercase tracking-wider">Liquidez (Bóveda)</p>
                        <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-400">
                            <Wallet className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold text-white tracking-tight">{formatMoney(totalEfectivo)}</h3>
                        <p className="mt-1 text-xs text-emerald-200/60">Disponible para desembolsos inmediatos</p>
                    </div>
                </div>
            </div>

            {/* CARD 3: BANCOS / DIGITAL (Cyan/Slate Gradient) */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-900 to-slate-900 p-[1px] shadow-xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-50" />
                <div className="relative h-full rounded-xl bg-slate-950/80 p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-cyan-300 uppercase tracking-wider">Bancos Digitales</p>
                        <div className="rounded-full bg-cyan-500/20 p-2 text-cyan-400">
                            <Landmark className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-3xl font-bold text-white tracking-tight">{formatMoney(totalBancos)}</h3>
                        <p className="mt-1 text-xs text-cyan-200/60">BCP, Interbank, Yape, Plin</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
