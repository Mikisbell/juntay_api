'use client'

import { Skeleton } from "@/components/ui/skeleton"

export default function ContratosLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-10 w-40" />
            </div>

            {/* Filtros */}
            <div className="flex gap-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Tabla */}
            <div className="rounded-xl border">
                <table className="w-full">
                    <thead className="border-b bg-muted/50">
                        <tr>
                            {['Código', 'Cliente', 'Monto', 'Vencimiento', 'Estado', 'Acciones'].map((h, i) => (
                                <th key={i} className="p-4 text-left">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(10)].map((_, i) => (
                            <tr key={i} className="border-b">
                                <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                <td className="p-4"><Skeleton className="h-4 w-36" /></td>
                                <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                                <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                <td className="p-4"><Skeleton className="h-8 w-8 rounded" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
