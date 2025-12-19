'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, TrendingDown, Check } from 'lucide-react'
import {
    ModalidadInteres,
    obtenerOpcionesPago,
    ResultadoInteres
} from '@/lib/utils/interes-flexible'

type Props = {
    montoPrestado: number
    saldoPendiente: number
    tasaMensual: number
    diasTranscurridos: number
    onModalidadChange: (modalidad: ModalidadInteres) => void
    onInteresCalculado: (interes: ResultadoInteres) => void
    modalidadSeleccionada?: ModalidadInteres
}

export function SelectorModalidadInteres({
    montoPrestado,
    saldoPendiente: _saldoPendiente,
    tasaMensual,
    diasTranscurridos,
    onModalidadChange,
    onInteresCalculado,
    modalidadSeleccionada = 'dias'
}: Props) {
    const [modalidad, setModalidad] = useState<ModalidadInteres>(modalidadSeleccionada)

    const opciones = useMemo(() => {
        return obtenerOpcionesPago(montoPrestado, tasaMensual, diasTranscurridos)
    }, [montoPrestado, tasaMensual, diasTranscurridos])

    const handleSeleccion = (nuevaModalidad: ModalidadInteres) => {
        setModalidad(nuevaModalidad)
        onModalidadChange(nuevaModalidad)

        const interesSeleccionado = nuevaModalidad === 'dias'
            ? opciones.porDias
            : opciones.porSemanas
        onInteresCalculado(interesSeleccionado)
    }

    const interesMensualCompleto = montoPrestado * (tasaMensual / 100)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Modalidad de Cobro</Label>
                <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {diasTranscurridos} días transcurridos
                </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Opción Por Días */}
                <Card
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${modalidad === 'dias'
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                        }`}
                    onClick={() => handleSeleccion('dias')}
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Por Días</span>
                        </div>
                        {modalidad === 'dias' && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </div>

                    <p className="text-2xl font-bold text-blue-600">
                        S/{opciones.porDias.interes.toFixed(2)}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                        {opciones.porDias.descripcion}
                    </p>

                    <div className="mt-2 p-2 bg-muted/30 rounded text-xs font-mono">
                        {opciones.porDias.formula}
                    </div>

                    {opciones.recomendacion === 'dias' && (
                        <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Más económico
                        </Badge>
                    )}
                </Card>

                {/* Opción Por Semanas */}
                <Card
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${modalidad === 'semanas'
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                        }`}
                    onClick={() => handleSeleccion('semanas')}
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Por Semanas</span>
                        </div>
                        {modalidad === 'semanas' && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </div>

                    <p className="text-2xl font-bold text-purple-600">
                        S/{opciones.porSemanas.interes.toFixed(2)}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                        {opciones.porSemanas.descripcion}
                    </p>

                    <div className="mt-2 p-2 bg-muted/30 rounded text-xs font-mono">
                        {opciones.porSemanas.formula}
                    </div>

                    {opciones.recomendacion === 'semanas' && (
                        <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Más económico
                        </Badge>
                    )}
                </Card>
            </div>

            {/* Tabla de referencia por semanas */}
            <Card className="p-3 bg-muted/20">
                <p className="text-xs font-semibold mb-2">Referencia - Interés por Semana:</p>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className={`p-2 rounded ${diasTranscurridos <= 7 ? 'bg-purple-100 border-2 border-purple-300' : 'bg-white'}`}>
                        <p className="font-medium">Sem 1</p>
                        <p className="text-muted-foreground">25%</p>
                        <p className="font-semibold">S/{(interesMensualCompleto * 0.25).toFixed(2)}</p>
                    </div>
                    <div className={`p-2 rounded ${diasTranscurridos > 7 && diasTranscurridos <= 14 ? 'bg-purple-100 border-2 border-purple-300' : 'bg-white'}`}>
                        <p className="font-medium">Sem 2</p>
                        <p className="text-muted-foreground">50%</p>
                        <p className="font-semibold">S/{(interesMensualCompleto * 0.50).toFixed(2)}</p>
                    </div>
                    <div className={`p-2 rounded ${diasTranscurridos > 14 && diasTranscurridos <= 21 ? 'bg-purple-100 border-2 border-purple-300' : 'bg-white'}`}>
                        <p className="font-medium">Sem 3</p>
                        <p className="text-muted-foreground">75%</p>
                        <p className="font-semibold">S/{(interesMensualCompleto * 0.75).toFixed(2)}</p>
                    </div>
                    <div className={`p-2 rounded ${diasTranscurridos > 21 ? 'bg-purple-100 border-2 border-purple-300' : 'bg-white'}`}>
                        <p className="font-medium">Mes</p>
                        <p className="text-muted-foreground">100%</p>
                        <p className="font-semibold">S/{interesMensualCompleto.toFixed(2)}</p>
                    </div>
                </div>
            </Card>

            {/* Ahorro si hay diferencia significativa */}
            {opciones.ahorro > 1 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800">
                        Con <strong>{opciones.recomendacion === 'dias' ? 'días' : 'semanas'}</strong> el cliente ahorra{' '}
                        <strong>S/{opciones.ahorro.toFixed(2)}</strong>
                    </span>
                </div>
            )}
        </div>
    )
}
