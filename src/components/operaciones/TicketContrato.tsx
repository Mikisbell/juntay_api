import React from 'react'

interface TicketProps {
    contratoId: string
    clienteNombre: string
    clienteDoc: string
    fecha: string
    items: { descripcion: string; valor: number }[]
    montoPrestamo: number
    fechaVencimiento: string
    totalAPagar: number
}

export const TicketContrato = React.forwardRef<HTMLDivElement, TicketProps>((props, ref) => {
    return (
        <div ref={ref} className="hidden print:block w-[80mm] p-2 font-mono text-[12px] leading-tight">

            {/* ENCABEZADO */}
            <div className="text-center mb-4">
                <h1 className="text-lg font-bold mb-1">JUNTAY EMPENOS</h1>
                <p>RUC: 20601234567</p>
                <p>Av. Principal 123, Lima</p>
                <p>Telf: (01) 555-0909</p>
                <div className="border-b border-black my-2 border-dashed" />
                <h2 className="text-sm font-bold">CONTRATO DE PRENDA</h2>
                <p>#{props.contratoId}</p>
            </div>

            {/* DATOS CLIENTE */}
            <div className="mb-4">
                <p><span className="font-bold">Fecha:</span> {props.fecha}</p>
                <p><span className="font-bold">Cliente:</span> {props.clienteNombre}</p>
                <p><span className="font-bold">DOC:</span> {props.clienteDoc}</p>
            </div>

            {/* DETALLE PRENDA */}
            <div className="mb-4">
                <div className="border-b border-black mb-2 border-dashed" />
                <p className="font-bold mb-1">ARTÍCULO(S):</p>
                {props.items.map((item, i) => (
                    <div key={i} className="mb-1">
                        <p>{item.descripcion}</p>
                        <p className="text-right italic">Tasación: S/ {item.valor.toFixed(2)}</p>
                    </div>
                ))}
                <div className="border-b border-black mt-2 border-dashed" />
            </div>

            {/* CONDICIONES FINANCIERAS */}
            <div className="mb-6">
                <div className="flex justify-between text-sm font-bold my-1">
                    <span>PRÉSTAMO:</span>
                    <span>S/ {props.montoPrestamo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between my-1">
                    <span>Vence:</span>
                    <span>{props.fechaVencimiento}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-black">
                    <span>TOTAL A PAGAR:</span>
                    <span>S/ {props.totalAPagar.toFixed(2)}</span>
                </div>
            </div>

            {/* LEGAL & FIRMA */}
            <div className="text-[10px] text-justify mb-8">
                <p className="mb-2">
                    Declaro ser propietario legítimo de los bienes y acepto los términos
                    y condiciones del servicio. Pasada la fecha de vencimiento sin renovación,
                    la prenda pasará a proceso de remate.
                </p>
            </div>

            <div className="text-center mt-12">
                <div className="border-t border-black w-3/4 mx-auto mb-1" />
                <p>Firma del Cliente</p>
            </div>

            <div className="text-center mt-8 mb-4">
                <p>*** GRACIAS POR SU CONFIANZA ***</p>
                <p>www.juntay.com</p>
            </div>
        </div>
    )
})

TicketContrato.displayName = "TicketContrato"
