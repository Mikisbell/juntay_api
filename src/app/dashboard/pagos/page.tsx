import { FormularioPago } from '@/components/pagos/FormularioPago'
import { obtenerEstadoCaja } from '@/lib/actions/caja-actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, DollarSign } from 'lucide-react'

export default async function PagosPage() {
    const estadoCaja = await obtenerEstadoCaja()

    if (!estadoCaja) {
        return (
            <div className="container mx-auto py-8 max-w-2xl">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Caja Cerrada</AlertTitle>
                    <AlertDescription>
                        Debe abrir caja para registrar pagos. Vaya a Gestión de Caja para iniciar su turno.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <h1 className="text-3xl font-bold text-slate-900">Registro de Pagos</h1>
                </div>
                <p className="text-slate-500">Cobro de intereses y desempeño de prendas</p>
            </div>

            <FormularioPago cajaId={estadoCaja.id} />
        </div>
    )
}
