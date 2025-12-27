'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Download } from "lucide-react"

interface DashboardProps {
    children: React.ReactNode
}

export function PremiumDashboard({ children }: DashboardProps) {
    return (
        <div className="space-y-8 p-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Dashboard Gerencial
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Visión estratégica de tu negocio en tiempo real.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-9">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Mes Actual
                    </Button>
                    <Button className="h-9 bg-primary/90 hover:bg-primary">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Reporte
                    </Button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="space-y-6">
                {children}
            </div>
        </div>
    )
}
