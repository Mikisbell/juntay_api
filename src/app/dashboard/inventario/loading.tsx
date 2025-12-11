'use client'

import { Skeleton } from "@/components/ui/skeleton"

export default function InventarioLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border p-4">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-7 w-12" />
                    </div>
                ))}
            </div>

            {/* Grid de items */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="rounded-xl border overflow-hidden">
                        <Skeleton className="h-40 w-full" />
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
