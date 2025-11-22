import { obtenerContratosVigentes } from '@/lib/actions/contratos-list-actions'
import { TablaContratos } from '@/components/business/TablaContratos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Clock } from 'lucide-react'

export default async function ContratosPage() {
    const contratos = await obtenerContratosVigentes()

    return (
        <div className="container mx-auto py-8 max-w-[1600px]">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-slate-900">Gestión de Contratos</h1>
                </div>
                <p className="text-slate-500">Renovaciones y desempeños rápidos</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Contratos Vigentes y Próximos a Vencer
                        </span>
                        <span className="text-sm font-normal text-slate-500">
                            {contratos.length} contratos activos
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <TablaContratos contratos={contratos} />
                </CardContent>
            </Card>
        </div>
    )
}
