import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download } from 'lucide-react'

export default function TransaccionesPage() {
    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 bg-grid-slate-100 dark:bg-grid-slate-900">
            <div className="flex-1 space-y-8 p-8 pt-6 animate-in-fade-slide">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Historial de Transacciones</h2>
                        <p className="text-muted-foreground">Auditoría completa de movimientos financieros.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Exportar Excel
                        </Button>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 md:max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por operación, monto o usuario..." className="pl-10 bg-white dark:bg-slate-900" />
                    </div>
                </div>

                {/* Empty State (Placeholder for now) */}
                <Card className="glass-panel border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Resultados</CardTitle>
                        <CardDescription>Mostrando últimos movimientos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-slate-100 p-4 mb-4">
                                <Search className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">Búsqueda Avanzada</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2">
                                Utilice los filtros para encontrar transacciones específicas en el historial histórico de la empresa.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
