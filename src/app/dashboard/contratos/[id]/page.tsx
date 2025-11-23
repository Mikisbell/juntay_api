"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Printer, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TicketContrato } from "@/components/operaciones/TicketContrato"

// NOTA: En un caso real, harías un fetch de los datos del contrato usando el ID de la URL.
// Aquí uso datos mock para el ejemplo visual.
const mockData = {
    id: "C-1001-2025",
    cliente: "Juan Pérez",
    doc: "45678901",
    fecha: new Date().toLocaleDateString('es-PE'),
    items: [{ descripcion: "Cadena Oro 18k 15g", valor: 2500 }],
    monto: 1800,
    vence: "20/12/2025",
    total: 2160
}

export default function ContratoExitoPage({ params }: { params: Promise<{ id: string }> }) {
    const ticketRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef: ticketRef,
        documentTitle: `Ticket-${mockData.id}`,
    })

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">

            {/* ESTADO DE ÉXITO */}
            <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">¡Operación Exitosa!</h1>
                <p className="text-slate-500 mt-2">
                    El contrato ha sido registrado correctamente.
                </p>
            </div>

            {/* TARJETA DE ACCIÓN */}
            <Card className="border-slate-200 shadow-lg overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 text-center pb-6">
                    <CardTitle className="text-slate-700">Siguientes Pasos</CardTitle>
                </CardHeader>
                <CardContent className="p-8 flex flex-col items-center gap-4">

                    <p className="text-sm text-center text-slate-600 mb-2">
                        Entrega el dinero al cliente y asegúrate de que firme el ticket impreso.
                    </p>

                    <Button
                        size="lg"
                        className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md h-12 text-lg"
                        onClick={handlePrint}
                    >
                        <Printer className="mr-2 h-5 w-5" />
                        Imprimir Ticket
                    </Button>

                    <Link href="/dashboard/mostrador/nuevo-empeno" className="w-full max-w-xs">
                        <Button variant="outline" className="w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Mostrador
                        </Button>
                    </Link>

                </CardContent>
            </Card>

            {/* COMPONENTE OCULTO PARA IMPRESIÓN */}
            <div className="hidden">
                <TicketContrato
                    ref={ticketRef}
                    contratoId={mockData.id}
                    clienteNombre={mockData.cliente}
                    clienteDoc={mockData.doc}
                    fecha={mockData.fecha}
                    items={mockData.items}
                    montoPrestamo={mockData.monto}
                    fechaVencimiento={mockData.vence}
                    totalAPagar={mockData.total}
                />
            </div>

        </div>
    )
}
