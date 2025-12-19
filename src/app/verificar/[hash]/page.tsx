import { Metadata } from 'next'
import { CheckCircle, XCircle, FileText, Calendar, CreditCard, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * Página pública de verificación de recibos
 * 
 * /verificar/[hash]
 * 
 * Sin autenticación, solo muestra estado de verificación
 */

export const metadata: Metadata = {
    title: 'Verificar Recibo | JUNTAY Financiera',
    description: 'Verificación de comprobantes de pago JUNTAY'
}

interface PageProps {
    params: Promise<{ hash: string }>
}

async function verificarRecibo(hash: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    try {
        const response = await fetch(`${baseUrl}/api/recibos/verificar/${hash}`, {
            cache: 'no-store'
        })

        if (!response.ok) {
            return { valido: false, error: 'Recibo no encontrado' }
        }

        return await response.json()
    } catch {
        return { valido: false, error: 'Error de conexión' }
    }
}

export default async function VerificarReciboPage({ params }: PageProps) {
    const { hash } = await params
    const resultado = await verificarRecibo(hash)

    if (!resultado.valido) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-red-200 shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                            <XCircle className="h-12 w-12 text-red-500" />
                        </div>
                        <CardTitle className="text-2xl text-red-600">
                            Recibo No Encontrado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-muted-foreground">
                            El código de verificación no corresponde a ningún recibo válido.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Si crees que esto es un error, contacta a JUNTAY Financiera.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const recibo = resultado.recibo

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-green-200 shadow-lg">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl text-green-600">
                        Recibo Válido
                    </CardTitle>
                    <Badge variant="outline" className="mt-2 border-green-500 text-green-600">
                        {recibo.estado}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">N° Recibo</p>
                                <p className="font-mono font-medium">{recibo.numero}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Cliente</p>
                                <p className="font-medium">{recibo.clienteNombre}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Crédito</p>
                                <p className="font-medium">{recibo.codigoCredito}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Fecha</p>
                                <p className="font-medium">{recibo.fecha}</p>
                            </div>
                        </div>

                        <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Monto Pagado</span>
                                <span className="text-xl font-bold text-green-600">
                                    {recibo.monto}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                            Comprobante emitido por
                        </p>
                        <p className="font-semibold text-primary">
                            JUNTAY Financiera
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
