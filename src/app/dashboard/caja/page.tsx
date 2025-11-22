import { obtenerEstadoCaja } from '@/lib/actions/caja-actions'
import { AperturaCaja } from '@/components/caja/AperturaCaja'
import { CierreCaja } from '@/components/caja/CierreCaja'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export default async function CajaPage() {
    const estadoCaja = await obtenerEstadoCaja()

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900">Gestión de Caja Operativa</h1>
                <p className="text-slate-500">Control de flujo de efectivo y turnos</p>
            </div>

            {estadoCaja ? (
                <div className="space-y-6">
                    <Alert className="bg-emerald-50 border-emerald-200">
                        <Info className="h-4 w-4 text-emerald-600" />
                        <AlertTitle className="text-emerald-800">Caja Abierta</AlertTitle>
                        <AlertDescription className="text-emerald-700">
                            Turno iniciado el {new Date(estadoCaja.fechaApertura).toLocaleString()}
                        </AlertDescription>
                    </Alert>

                    <CierreCaja />
                </div>
            ) : (
                <div className="space-y-6">
                    <Alert className="bg-amber-50 border-amber-200">
                        <Info className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800">Caja Cerrada</AlertTitle>
                        <AlertDescription className="text-amber-700">
                            Debe abrir caja para realizar operaciones monetarias.
                        </AlertDescription>
                    </Alert>

                    <AperturaCaja />
                </div>
            )}
        </div>
    )
}
