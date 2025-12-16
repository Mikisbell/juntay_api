'use client'

import { Skeleton } from "@/components/ui/skeleton"

export default function VencimientosLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-40 mb-2" />
                    <Skeleton className="h-4 w-56" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-9 w-24 rounded-lg" />
                ))}
            </div>

            {/* Estadísticas */}
            <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border p-4">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-8 w-12 mb-1" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                ))}
            </div>

            {/* Tabla */}
            <div className="rounded-xl border">
                <div className="p-4 space-y-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-40 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <div className="text-right">
                                <Skeleton className="h-4 w-20 mb-1" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-8 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
