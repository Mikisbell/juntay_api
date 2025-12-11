'use client'

import { Skeleton } from "@/components/ui/skeleton"

export default function ClientesLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-4">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-7 w-16" />
                    </div>
                ))}
            </div>

            {/* Search */}
            <Skeleton className="h-10 w-full max-w-sm" />

            {/* Table */}
            <div className="rounded-xl border">
                <div className="p-4 border-b">
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="p-4 space-y-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
