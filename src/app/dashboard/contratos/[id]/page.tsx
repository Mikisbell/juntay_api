import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, DollarSign, User, Phone, MapPin, FileText, Clock, ArrowLeft, Image as ImageIcon, AlertTriangle, TrendingUp, Percent } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContratoHeader } from '@/components/contratos/ContratoHeader'

export default async function ContratoDetallePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // Obtener contrato actual
    const { data: contratoActual, error: contratoError } = await supabase
        .from('creditos')
        .select('*')
        .eq('id', id)
        .single()

    if (contratoError || !contratoActual) {
        console.error('Error fetching contract:', contratoError)
        notFound()
    }

    // Obtener cliente desde la vista
    const { data: clienteData } = await supabase
        .from('clientes_completo')
        .select('*')
        .eq('id', contratoActual.cliente_id)
        .single()

    const cliente = clienteData

    if (!cliente) {
        notFound()
    }

    // Obtener garantía del contrato actual
    const { data: garantiaActual } = await supabase
        .from('garantias')
        .select('*')
        .eq('id', contratoActual.garantia_id)
        .maybeSingle()

    // Calcular financieros
    const diasTranscurridos = Math.floor((new Date().getTime() - new Date(contratoActual.fecha_inicio).getTime()) / (1000 * 3600 * 24))
    const diasVencimiento = Math.ceil((new Date(contratoActual.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    const esVencido = diasVencimiento < 0

    // Cálculos simulados si no existen en DB
    const tasaInteres = contratoActual.tasa_interes || 5.0 // 5% por defecto
    const interesGenerado = contratoActual.interes_devengado_actual || (contratoActual.monto_prestado * (tasaInteres / 100))
    const moraEstimada = esVencido ? (contratoActual.saldo_pendiente * 0.02 * Math.abs(diasVencimiento)) : 0 // 2% diario de mora
    const totalPagar = contratoActual.saldo_pendiente + interesGenerado + moraEstimada

    // Obtener historial de pagos
    const { data: pagos } = await supabase
        .from('pagos')
        .select('*')
        .eq('credito_id', id)
        .order('fecha_pago', { ascending: false })

    return (
        <div className="flex flex-col gap-6 pb-20">

            {/* Header con Navegación y Estado */}
            <ContratoHeader
                cliente={{
                    nombre_completo: cliente?.nombre_completo || '',
                    numero_documento: cliente?.numero_documento || '',
                    telefono_principal: cliente?.telefono_principal || ''
                }}
                contrato={{
                    id: contratoActual.id,
                    codigo: contratoActual.codigo,
                    fecha_inicio: contratoActual.fecha_inicio,
                    fecha_vencimiento: contratoActual.fecha_vencimiento,
                    monto_prestado: contratoActual.monto_prestado,
                    descripcion_prenda: garantiaActual?.descripcion || 'Prenda no especificada'
                }}
                esVencido={esVencido}
            />

            {/* Resumen Financiero de Alto Impacto */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Capital</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">S/. {contratoActual.saldo_pendiente.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Original: S/. {contratoActual.monto_prestado.toFixed(2)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            Interés Acumulado
                            <Badge variant="secondary" className="text-[10px] h-5">{tasaInteres}%</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">S/. {interesGenerado.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">{diasTranscurridos} días transcurridos</p>
                    </CardContent>
                </Card>
                <Card className={esVencido ? "bg-red-50 border-red-200" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            Mora / Penalidad
                            {esVencido && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${esVencido ? 'text-red-600' : 'text-muted-foreground'}`}>
                            S/. {moraEstimada.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {esVencido ? `${Math.abs(diasVencimiento)} días de atraso` : 'Al día'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 text-white border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total a Pagar HOY</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">S/. {totalPagar.toFixed(2)}</div>
                        <p className="text-xs text-slate-400">Incluye capital + interés + mora</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="garantia" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="garantia">Garantía</TabsTrigger>
                    <TabsTrigger value="cliente">Cliente</TabsTrigger>
                    <TabsTrigger value="pagos">Pagos</TabsTrigger>
                </TabsList>

                {/* Tab: Garantía (Bien Prendado) */}
                <TabsContent value="garantia" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Galería de Fotos */}
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    Evidencia Fotográfica
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {garantiaActual?.fotos && Array.isArray(garantiaActual.fotos) && garantiaActual.fotos.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {garantiaActual.fotos.map((foto: string, index: number) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                                                <img
                                                    src={foto}
                                                    alt={`Evidencia ${index + 1}`}
                                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[300px] bg-muted/30 rounded-lg border-2 border-dashed">
                                        <ImageIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                        <p className="text-muted-foreground">No hay fotografías registradas</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Detalles del Bien */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detalles del Bien</CardTitle>
                                <CardDescription>Características y valoración</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{garantiaActual?.descripcion}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {garantiaActual?.marca} {garantiaActual?.modelo} {garantiaActual?.serie ? `- Serie: ${garantiaActual.serie}` : ''}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/30 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-1">Valor Tasación</p>
                                        <p className="text-xl font-bold">S/. {garantiaActual?.valor_estimado?.toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-1">Estado</p>
                                        <Badge variant="outline" className="capitalize">
                                            {garantiaActual?.estado_bien || 'Bueno'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Características Adicionales:</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {garantiaActual?.anio && (
                                            <div className="flex justify-between border-b py-1">
                                                <span className="text-muted-foreground">Año:</span>
                                                <span>{garantiaActual.anio}</span>
                                            </div>
                                        )}
                                        {garantiaActual?.color && (
                                            <div className="flex justify-between border-b py-1">
                                                <span className="text-muted-foreground">Color:</span>
                                                <span>{garantiaActual.color}</span>
                                            </div>
                                        )}
                                        {garantiaActual?.ubicacion && (
                                            <div className="flex justify-between border-b py-1">
                                                <span className="text-muted-foreground">Ubicación:</span>
                                                <span>{garantiaActual.ubicacion}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab: Cliente */}
                <TabsContent value="cliente" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información Personal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nombre Completo</p>
                                    <p className="font-semibold text-lg">{cliente?.nombre_completo}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Documento de Identidad</p>
                                    <p className="font-mono text-lg">{cliente?.numero_documento}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Teléfono Principal</p>
                                        <p className="font-semibold">{cliente?.telefono_principal || 'No registrado'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Dirección</p>
                                        <p className="text-sm">{cliente?.direccion || 'No registrada'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Pagos */}
                <TabsContent value="pagos" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Pagos</CardTitle>
                            <CardDescription>Pagos realizados a este contrato específico</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pagos && pagos.length > 0 ? (
                                <div className="space-y-3">
                                    {pagos.map((pago: any) => (
                                        <div
                                            key={pago.id}
                                            className="flex justify-between items-center border p-4 rounded-lg hover:bg-muted/20 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="bg-green-100 p-2 rounded-full">
                                                    <DollarSign className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {new Date(pago.fecha_pago).toLocaleDateString('es-PE', { dateStyle: 'long' })}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground capitalize">
                                                        {pago.tipo_pago} • {pago.metodo_pago || 'Efectivo'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-green-600">
                                                    + S/. {pago.monto.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Procesado</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No se han registrado pagos para este contrato</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
