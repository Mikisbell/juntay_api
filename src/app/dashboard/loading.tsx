import { DashboardSkeleton } from "@/components/ui/skeletons"

/**
 * Dashboard Loading State
 * 
 * Muestra un skeleton animado mientras se cargan los datos del dashboard.
 * Next.js usa este archivo automáticamente durante Suspense.
 */
export default function DashboardLoading() {
    return <DashboardSkeleton />
}
