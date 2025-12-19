'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KPIsCobranzaPanel } from '@/components/admin/KPIsCobranzaPanel'
import { KPIsRiesgoPanel } from '@/components/admin/KPIsRiesgoPanel'
import { AlertasCobranzaPanel } from '@/components/admin/AlertasCobranzaPanel'
import { ReportesExportPanel } from '@/components/admin/ReportesExportPanel'
import { AuditoriaPanel } from '@/components/admin/AuditoriaPanel'

/**
 * Panel de Monitoreo Admin
 * 
 * Integra todos los KPIs, alertas, reportes y auditoría
 */
export default function MonitoreoAdminPage() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Centro de Monitoreo</h1>
                    <p className="text-muted-foreground">
                        KPIs, alertas y trazabilidad en tiempo real
                    </p>
                </div>
            </div>

            <Tabs defaultValue="kpis" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="kpis">KPIs</TabsTrigger>
                    <TabsTrigger value="alertas">Alertas</TabsTrigger>
                    <TabsTrigger value="reportes">Reportes</TabsTrigger>
                    <TabsTrigger value="auditoria">Auditoría</TabsTrigger>
                </TabsList>

                <TabsContent value="kpis" className="space-y-4">
                    <KPIsCobranzaPanel />
                    <KPIsRiesgoPanel />
                </TabsContent>

                <TabsContent value="alertas">
                    <AlertasCobranzaPanel />
                </TabsContent>

                <TabsContent value="reportes">
                    <ReportesExportPanel />
                </TabsContent>

                <TabsContent value="auditoria">
                    <AuditoriaPanel />
                </TabsContent>
            </Tabs>
        </div>
    )
}
