import React from 'react'
import { TicketLayout } from './TicketLayout'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface TicketTemplateProps {
    contratoId: string
    cliente: {
        nombres: string
        apellidos: string
        documento: string
    }
    garantia: {
        descripcion: string
        marca: string
        modelo: string
        serie: string
    }
    prestamo: {
        monto: number
        interes: number
        plazo: number
        fechaVencimiento: Date
        totalPagar: number
    }
    fechaEmision: Date
}

export const TicketTemplate = ({
    contratoId,
    cliente,
    garantia,
    prestamo,
    fechaEmision
}: TicketTemplateProps) => {
    return (
        <TicketLayout>
            <div className="text-center mb-4">
                <h1 className="font-bold text-lg">JUNTAY</h1>
                <p>Casa de Empeños</p>
                <p className="text-[10px]">Av. Principal 123, Lima</p>
                <p className="text-[10px]">RUC: 20123456789</p>
            </div>

            <div className="border-b border-black border-dashed my-2"></div>

            <div className="mb-2">
                <p className="font-bold">COMPROBANTE DE EMPEÑO</p>
                <p>N°: {contratoId}</p>
                <p>Fecha: {format(fechaEmision, 'dd/MM/yyyy HH:mm')}</p>
            </div>

            <div className="mb-2">
                <p className="font-bold">CLIENTE</p>
                <p>{cliente.nombres} {cliente.apellidos}</p>
                <p>DOC: {cliente.documento}</p>
            </div>

            <div className="mb-2">
                <p className="font-bold">GARANTÍA</p>
                <p>{garantia.descripcion}</p>
                <p>{garantia.marca} {garantia.modelo}</p>
                {garantia.serie && <p>SN: {garantia.serie}</p>}
            </div>

            <div className="border-b border-black border-dashed my-2"></div>

            <div className="mb-4">
                <div className="flex justify-between font-bold text-sm">
                    <span>PRÉSTAMO:</span>
                    <span>S/ {prestamo.monto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>Interés ({prestamo.interes}%):</span>
                    <span>S/ {(prestamo.totalPagar - prestamo.monto).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>Plazo:</span>
                    <span>{prestamo.plazo} días</span>
                </div>
                <div className="flex justify-between font-bold mt-1">
                    <span>TOTAL A PAGAR:</span>
                    <span>S/ {prestamo.totalPagar.toFixed(2)}</span>
                </div>
                <div className="text-center mt-1 text-[10px]">
                    Vence: {format(prestamo.fechaVencimiento, 'dd/MM/yyyy', { locale: es })}
                </div>
            </div>

            <div className="border-b border-black border-dashed my-2"></div>

            <div className="text-[10px] text-justify mb-4">
                Declaro haber recibido el monto del préstamo y acepto los términos y condiciones del contrato de empeño.
            </div>

            <div className="mt-8 mb-4 text-center">
                <div className="border-t border-black w-3/4 mx-auto"></div>
                <p className="mt-1">Firma del Cliente</p>
            </div>

            <div className="text-center text-[10px]">
                <p>¡Gracias por su preferencia!</p>
                <p>www.juntay.com</p>
            </div>
        </TicketLayout>
    )
}
