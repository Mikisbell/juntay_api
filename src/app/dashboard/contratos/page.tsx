import { obtenerContratosVigentes } from '@/lib/actions/contratos-list-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
import { TableSkeleton } from '@/components/ui/skeletons'
import dynamic from 'next/dynamic'
import { FileText, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const TablaContratos = dynamic(() => import('@/components/business/TablaContratos').then(mod => ({ default: mod.TablaContratos })), {
    loading: () => <TableSkeleton />,
    ssr: true
})

export default async function ContratosPage() {
    const contratos = await obtenerContratosVigentes()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Contratos</h2>
                    <p className="text-muted-foreground">Gestione los contratos de empeño vigentes y su estado.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => { /* TODO: Implement filter modal */ }}>
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrar
                    </Button>
                    <Button onClick={() => { /* TODO: Implement export */ }}>
                        Exportar
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Listado de Contratos</CardTitle>
                            <CardDescription>
                                {contratos.length} contratos activos encontrados en el sistema.
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por cliente o código..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<TableSkeleton />}>
                        <TablaContratos contratos={contratos} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
