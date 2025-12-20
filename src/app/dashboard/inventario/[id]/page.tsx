import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, User, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { GaleriaFotosArticulo } from '@/components/inventario/GaleriaFotosArticulo'
import { TasacionPanel } from '@/components/inventario/TasacionPanel'
import { EstadoArticuloBadge } from '@/components/inventario/EstadoArticuloBadge'
import type { EstadoArticulo } from '@/lib/actions/garantias-mejoradas-actions'

export const metadata = {
    title: 'Detalle de Artículo | JUNTAY',
    description: 'Información completa del artículo en inventario'
}

export default async function DetalleArticuloPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // Verificar usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Obtener empleado para tasación
    const { data: empleado } = await supabase
        .from('empleados')
        .select('id, nombres, apellido_paterno')
        .eq('user_id', user.id)
        .single()

    // Obtener datos del artículo
    const { data: garantia, error } = await supabase
        .from('garantias')
        .select(`
            id,
            descripcion,
            estado,
            valor_tasacion,
            fotos,
            categoria,
            subcategoria,
            metadata,
            created_at,
            cliente:clientes(id, nombres, apellido_paterno, dni),
            credito:creditos(id, codigo_credito, fecha_vencimiento, monto_prestado, estado)
        `)
        .eq('id', id)
        .single()

    if (error || !garantia) {
        notFound()
    }

    // Tipo seguro para cliente y credito
    const clienteData = garantia.cliente as unknown
    const cliente = Array.isArray(clienteData) ? clienteData[0] : clienteData as {
        id: string
        nombres: string
        apellido_paterno: string
        dni: string
    } | null

    const creditoData = garantia.credito as unknown
    const credito = Array.isArray(creditoData) ? creditoData[0] : creditoData as {
        id: string
        codigo_credito: string
        fecha_vencimiento: string
        monto_prestado: number
        estado: string
    } | null

    const metadata = (garantia.metadata || {}) as Record<string, unknown>

    // Estado del artículo (físico)
    const estadoArticulo: EstadoArticulo = (metadata.estado_articulo as EstadoArticulo) || 'usado'

    const formatMoney = (n: number) =>
        new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n)

    const usuarioId = empleado?.id || user.id
    const usuarioNombre = empleado ? `${empleado.nombres} ${empleado.apellido_paterno}` : user.email || 'Usuario'

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/inventario">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        {garantia.descripcion}
                    </h1>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{garantia.categoria || 'Sin categoría'}</span>
                        {garantia.subcategoria && (
                            <>
                                <span>•</span>
                                <span>{garantia.subcategoria}</span>
                            </>
                        )}
                        <span>•</span>
                        <Badge variant="outline">{garantia.estado}</Badge>
                    </div>
                </div>
                <EstadoArticuloBadge
                    estado={estadoArticulo}
                    articuloId={id}
                    editable={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Galería de Fotos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Galería de Fotos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GaleriaFotosArticulo
                                articuloId={id}
                                editable={true}
                            />
                        </CardContent>
                    </Card>

                    {/* Panel de Tasación */}
                    <TasacionPanel
                        articuloId={id}
                        categoria={garantia.categoria || 'otros'}
                        estadoActual={estadoArticulo}
                        usuarioId={usuarioId}
                        usuarioNombre={usuarioNombre}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Info del Contrato */}
                    {credito && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Contrato Asociado
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Código</span>
                                    <span className="font-mono font-bold">{credito.codigo_credito}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Monto</span>
                                    <span>{formatMoney(credito.monto_prestado)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Vence</span>
                                    <span>{new Date(credito.fecha_vencimiento).toLocaleDateString('es-PE')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Estado</span>
                                    <Badge>{credito.estado}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Info del Cliente */}
                    {cliente && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="font-medium">
                                    {cliente.nombres} {cliente.apellido_paterno}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    DNI: {cliente.dni}
                                </div>
                                <Link href={`/dashboard/clientes/${cliente.id}`}>
                                    <Button variant="outline" size="sm" className="w-full mt-2">
                                        Ver perfil completo
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {/* Fechas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Registro
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Ingresó: </span>
                                {new Date(garantia.created_at).toLocaleDateString('es-PE', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
