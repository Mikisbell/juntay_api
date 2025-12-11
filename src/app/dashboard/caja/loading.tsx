'use client'

import { Skeleton } from "@/components/ui/skeleton"

export default function CajaLoading() {
    return (
        <div className="space-y-6">
            {/* Header con estado de caja */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                        <Skeleton className="h-6 w-24 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-10 w-28" />
            </div>

            {/* Saldo grande */}
            <div className="rounded-xl border bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-8 text-center">
                <Skeleton className="h-4 w-24 mx-auto mb-2" />
                <Skeleton className="h-12 w-48 mx-auto" />
            </div>

            {/* Grid de acciones */}
            <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-xl border p-6 text-center">
                        <Skeleton className="h-10 w-10 mx-auto mb-3 rounded-lg" />
                        <Skeleton className="h-5 w-24 mx-auto mb-2" />
                        <Skeleton className="h-3 w-32 mx-auto" />
                    </div>
                ))}
            </div>

            {/* Movimientos recientes */}
            <div className="rounded-xl border">
                <div className="p-4 border-b">
                    <Skeleton className="h-5 w-40" />
                </div>
                <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-2">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded" />
                                <div>
                                    <Skeleton className="h-4 w-32 mb-1" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
