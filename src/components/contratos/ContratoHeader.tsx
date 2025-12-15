'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Phone, FileText, Printer } from 'lucide-react'
import Link from 'next/link'
import { FaWhatsapp } from 'react-icons/fa'

type ContratoHeaderProps = {
    cliente: {
        nombre_completo: string
        numero_documento: string
        telefono_principal?: string
    }
    contrato: {
        id: string
        codigo: string
        fecha_inicio: string
        fecha_vencimiento: string
        monto_prestado: number
        descripcion_prenda: string
    }
    esVencido: boolean
}

export function ContratoHeader({ cliente, contrato, esVencido }: ContratoHeaderProps) {
    const [showPreview, setShowPreview] = useState(false)

    const handlePrint = () => {
        const printContent = document.getElementById('contrato-preview')
        if (!printContent) return

        const printWindow = window.open('', '', 'height=600,width=800')
        if (!printWindow) return

        printWindow.document.write('<html><head><title>Imprimir Contrato</title>')
        printWindow.document.write('<style>')
        printWindow.document.write(`
            body { font-family: serif; font-size: 12pt; line-height: 1.5; padding: 40px; }
            h2 { text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 20px; }
            p { margin-bottom: 12px; text-align: justify; }
            .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
            .signature-box { border-top: 1px solid black; width: 200px; padding-top: 10px; text-align: center; font-size: 10pt; }
        `)
        printWindow.document.write('</style></head><body>')
        printWindow.document.write(printContent.innerHTML)
        printWindow.document.write('</body></html>')
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
    }

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/vencimientos">
                    <Button variant="outline" size="icon" className="h-10 w-10">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {cliente.nombre_completo}
                    </h1>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="font-medium text-slate-600">DNI: {cliente.numero_documento}</span>
                        <span>•</span>
                        <button
                            onClick={() => setShowPreview(true)}
                            className="flex items-center gap-1 font-mono text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                            <FileText className="h-3 w-3" />
                            {contrato.codigo}
                        </button>
                        <Badge
                            variant={esVencido ? "destructive" : "default"}
                            className="text-xs px-2 py-0.5 ml-1"
                        >
                            {esVencido ? "VENCIDO" : "VIGENTE"}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => window.location.href = `tel:${cliente.telefono_principal}`}>
                    <Phone className="h-4 w-4" /> Llamar
                </Button>
                <Button
                    className="gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
                    onClick={() => {
                        if (cliente.telefono_principal) {
                            window.open(`https://wa.me/${cliente.telefono_principal.replace(/\D/g, '')}`, '_blank')
                        }
                    }}
                >
                    <FaWhatsapp className="h-4 w-4" /> WhatsApp
                </Button>
            </div>

            {/* Modal de Vista Previa del Contrato */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Contrato {contrato.codigo}</span>
                            <Button variant="ghost" size="sm" className="gap-2" onClick={handlePrint}>
                                <Printer className="h-4 w-4" /> Imprimir
                            </Button>
                        </DialogTitle>
                    </DialogHeader>

                    <div id="contrato-preview" className="flex-1 bg-white border rounded-md p-8 overflow-y-auto shadow-inner font-serif text-sm leading-relaxed text-slate-800">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold uppercase mb-2">Contrato de Mutuo con Garantía Prendaria</h2>
                            <p className="text-xs text-slate-500">N° {contrato.codigo}</p>
                        </div>

                        <p className="mb-4">
                            En la ciudad de Lima, a los {new Date(contrato.fecha_inicio).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}, se celebra el presente contrato entre:
                        </p>

                        <p className="mb-4">
                            <strong>LA CASA DE EMPEÑOS JUNTAY</strong>, con RUC 20123456789, en adelante &quot;LA EMPRESA&quot;.
                        </p>

                        <p className="mb-4">
                            Y por otra parte, <strong>{cliente.nombre_completo}</strong>, identificado con DNI N° <strong>{cliente.numero_documento}</strong>, en adelante &quot;EL CLIENTE&quot;.
                        </p>

                        <h3 className="font-bold mt-6 mb-2">CLÁUSULA PRIMERA: DEL OBJETO</h3>
                        <p className="mb-4">
                            EL CLIENTE entrega en calidad de prenda el siguiente bien: <strong>{contrato.descripcion_prenda}</strong>.
                        </p>

                        <h3 className="font-bold mt-6 mb-2">CLÁUSULA SEGUNDA: DEL PRÉSTAMO</h3>
                        <p className="mb-4">
                            LA EMPRESA otorga un préstamo de <strong>S/. {contrato.monto_prestado.toFixed(2)}</strong>, el cual deberá ser pagado el día {new Date(contrato.fecha_vencimiento).toLocaleDateString('es-PE')}.
                        </p>

                        <div className="mt-12 flex justify-between px-8">
                            <div className="border-t border-black w-40 pt-2 text-center text-xs">
                                LA EMPRESA
                            </div>
                            <div className="border-t border-black w-40 pt-2 text-center text-xs">
                                EL CLIENTE<br />
                                DNI: {cliente.numero_documento}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
