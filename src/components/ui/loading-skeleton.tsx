import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for the full wizard layout
 */
export function WizardSkeleton() {
    return (
        <div className="w-full max-w-7xl mx-auto py-3 px-2 sm:px-4 lg:px-6 space-y-4">
            {/* Progress bar skeleton */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-1">
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Content card skeleton */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-4 w-full mb-6" />

                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>

            {/* Buttons skeleton */}
            <div className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    )
}

/**
 * Loading skeleton for table rows
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
            ))}
        </div>
    )
}

/**
 * Loading skeleton for card grid
 */
export function CardGridSkeleton({ cards = 4 }: { cards?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: cards }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-3 w-32" />
                </div>
            ))}
        </div>
    )
}
