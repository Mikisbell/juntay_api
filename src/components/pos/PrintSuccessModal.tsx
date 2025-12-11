"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, FileText, Printer, Plus, Scroll } from "lucide-react"
import { usePrint } from "@/components/printing/PrintProvider"
import { A4Layout } from "@/components/printing/A4Layout"
import { TicketLayout } from "@/components/printing/TicketLayout"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// ============================================================================
// CONTRATO DE MUTUO PRENDARIO - Conforme a normativa peruana
// (Ley de Garantía Mobiliaria - Ley N° 28677)
// ============================================================================
const ContratoEmpeño = ({ data }: { data: PrintData }) => {
    const fechaHoy = new Date()
    const fechaVencimiento = new Date()
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30)

    // Tasa mensual configurable (default 20%)
    const tasaMensual = data.tasaInteres || 20
    const monto = data.monto || 0
    const montoInteres = monto * (tasaMensual / 100)
    const totalPagar = monto + montoInteres

    return (
        <A4Layout>
            {/* ENCABEZADO */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-blue-800">JUNTAY</h1>
                    <p className="text-sm">Marca de FREECLOUD S.A.C.</p>
                    <p className="text-xs text-gray-600">RUC: 20600345665</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">CONTRATO DE MUTUO</p>
                    <p className="font-bold">CON GARANTÍA PRENDARIA</p>
                    <p className="text-sm mt-1">N° {data.codigo || 'PENDIENTE'}</p>
                </div>
            </div>

            {/* INTERVINIENTES */}
            <section className="mb-6">
                <h2 className="font-bold border-b mb-3">CLÁUSULA PRIMERA: LOS INTERVINIENTES</h2>
                <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                        <p className="font-bold mb-1">EL ACREEDOR (LA EMPRESA):</p>
                        <p>FREECLOUD SOCIEDAD ANÓNIMA CERRADA</p>
                        <p>RUC: 20600345665</p>
                        <p>Domicilio: Jr. Cahuide 298, El Tambo, Huancayo</p>
                    </div>
                    <div>
                        <p className="font-bold mb-1">EL DEUDOR (EL CLIENTE):</p>
                        <p>{data.clienteNombre || data.cliente || 'Por confirmar'}</p>
                        <p>Doc: {data.clienteDocumento || 'Por confirmar'}</p>
                        <p>Dirección: {data.clienteDireccion || 'Registrada en ficha'}</p>
                    </div>
                </div>
            </section>

            {/* OBJETO DEL CONTRATO */}
            <section className="mb-6">
                <h2 className="font-bold border-b mb-3">CLÁUSULA SEGUNDA: OBJETO DEL CONTRATO</h2>
                <p className="text-justify">
                    Por el presente contrato, EL ACREEDOR otorga a EL DEUDOR un préstamo de dinero (mutuo)
                    por la suma especificada a continuación, y EL DEUDOR constituye garantía mobiliaria
                    con desplazamiento sobre el bien detallado en la Cláusula Tercera, conforme a lo
                    establecido en la Ley de Garantía Mobiliaria (Ley N° 28677) y sus modificatorias.
                </p>
            </section>

            {/* DESCRIPCIÓN DE LA GARANTÍA */}
            <section className="mb-6">
                <h2 className="font-bold border-b mb-3">CLÁUSULA TERCERA: DESCRIPCIÓN DE LA GARANTÍA</h2>
                <table className="w-full text-sm border border-gray-400">
                    <tbody>
                        <tr>
                            <td className="border p-2 font-bold bg-gray-100 w-1/3">Descripción del Artículo</td>
                            <td className="border p-2">{data.garantiaDescripcion || data.descripcion || 'Según fotografías adjuntas'}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 font-bold bg-gray-100">Estado de Conservación</td>
                            <td className="border p-2">{data.garantiaEstado || 'Operativo / En buen estado'}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 font-bold bg-gray-100">Valor de Tasación</td>
                            <td className="border p-2 font-bold">S/ {(data.valorTasacion || data.monto || 0).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* CONDICIONES DEL PRÉSTAMO */}
            <section className="mb-6">
                <h2 className="font-bold border-b mb-3">CLÁUSULA CUARTA: CONDICIONES FINANCIERAS</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="border p-4 text-center bg-gray-50">
                        <p className="text-xs text-gray-500">Monto del Préstamo</p>
                        <p className="text-xl font-bold">S/ {(data.monto || 0).toFixed(2)}</p>
                    </div>
                    <div className="border p-4 text-center bg-gray-50">
                        <p className="text-xs text-gray-500">Total a Pagar al Vencimiento</p>
                        <p className="text-xl font-bold">S/ {totalPagar.toFixed(2)}</p>
                    </div>
                    <div className="border p-4 text-center">
                        <p className="text-xs text-gray-500">Tasa de Interés Mensual</p>
                        <p className="font-medium">{tasaMensual}%</p>
                    </div>
                    <div className="border p-4 text-center">
                        <p className="text-xs text-gray-500">Interés del Período</p>
                        <p className="font-medium">S/ {montoInteres.toFixed(2)}</p>
                    </div>
                    <div className="border p-4 text-center">
                        <p className="text-xs text-gray-500">Fecha de Desembolso</p>
                        <p className="font-medium">{format(fechaHoy, 'dd/MM/yyyy')}</p>
                    </div>
                    <div className="border p-4 text-center bg-rose-50">
                        <p className="text-xs text-gray-500">Fecha de Vencimiento</p>
                        <p className="font-bold text-rose-600">{format(fechaVencimiento, 'dd/MM/yyyy')}</p>
                    </div>
                </div>
            </section>

            {/* CRONOGRAMA DE PAGO */}
            <section className="mb-6">
                <h2 className="font-bold border-b mb-3">CRONOGRAMA DE PAGO (Opciones de Pago Anticipado)</h2>
                <p className="text-xs text-gray-600 mb-2">El cliente puede pagar en cualquier momento dentro del mes. A menor plazo, menor interés:</p>
                <table className="w-full text-sm border border-gray-400">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Semana</th>
                            <th className="border p-2">Fecha Límite</th>
                            <th className="border p-2 text-right">Capital</th>
                            <th className="border p-2 text-center bg-blue-50">% Interés</th>
                            <th className="border p-2 text-right bg-blue-50">Interés</th>
                            <th className="border p-2 text-right bg-green-50">Total a Pagar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-green-50">
                            <td className="border p-2 text-center">1ª Semana</td>
                            <td className="border p-2 text-center">{format(new Date(fechaHoy.getTime() + 7 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy')}</td>
                            <td className="border p-2 text-right">S/ {monto.toFixed(2)}</td>
                            <td className="border p-2 text-center font-bold text-green-600">{(tasaMensual * 0.25).toFixed(1)}%</td>
                            <td className="border p-2 text-right">S/ {(monto * tasaMensual * 0.25 / 100).toFixed(2)}</td>
                            <td className="border p-2 text-right font-bold text-green-600">S/ {(monto * (1 + tasaMensual * 0.25 / 100)).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 text-center">2ª Semana</td>
                            <td className="border p-2 text-center">{format(new Date(fechaHoy.getTime() + 14 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy')}</td>
                            <td className="border p-2 text-right">S/ {monto.toFixed(2)}</td>
                            <td className="border p-2 text-center font-bold text-yellow-600">{(tasaMensual * 0.50).toFixed(1)}%</td>
                            <td className="border p-2 text-right">S/ {(monto * tasaMensual * 0.50 / 100).toFixed(2)}</td>
                            <td className="border p-2 text-right font-bold">S/ {(monto * (1 + tasaMensual * 0.50 / 100)).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 text-center">3ª Semana</td>
                            <td className="border p-2 text-center">{format(new Date(fechaHoy.getTime() + 21 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy')}</td>
                            <td className="border p-2 text-right">S/ {monto.toFixed(2)}</td>
                            <td className="border p-2 text-center font-bold text-orange-600">{(tasaMensual * 0.75).toFixed(1)}%</td>
                            <td className="border p-2 text-right">S/ {(monto * tasaMensual * 0.75 / 100).toFixed(2)}</td>
                            <td className="border p-2 text-right font-bold">S/ {(monto * (1 + tasaMensual * 0.75 / 100)).toFixed(2)}</td>
                        </tr>
                        <tr className="bg-red-50">
                            <td className="border p-2 text-center font-bold">4ª Semana (Venc.)</td>
                            <td className="border p-2 text-center font-bold">{format(fechaVencimiento, 'dd/MM/yyyy')}</td>
                            <td className="border p-2 text-right">S/ {monto.toFixed(2)}</td>
                            <td className="border p-2 text-center font-bold text-red-600">{tasaMensual}%</td>
                            <td className="border p-2 text-right">S/ {montoInteres.toFixed(2)}</td>
                            <td className="border p-2 text-right font-bold text-red-600">S/ {totalPagar.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-2 p-2 bg-amber-50 border-l-4 border-amber-400 text-xs">
                    <strong>💡 BENEFICIO POR PAGO ANTICIPADO:</strong> Mientras más pronto pagues, menor será el interés.
                    ¡Pagando en la 1ª semana ahorras S/ {(monto * tasaMensual * 0.75 / 100).toFixed(2)}!
                </div>
            </section>

            {/* CLÁUSULAS LEGALES */}
            <section className="mb-6 text-xs text-justify columns-2 gap-6">
                <h2 className="font-bold border-b mb-2 text-sm column-span-all">CLÁUSULAS GENERALES</h2>

                <p className="mb-2"><strong>QUINTA:</strong> EL DEUDOR declara ser propietario legítimo del bien entregado en garantía y se compromete a no gravarlo ni enajenarlo mientras dure la obligación.</p>

                <p className="mb-2"><strong>SEXTA:</strong> En caso de incumplimiento de pago al vencimiento, EL ACREEDOR procederá a la venta extrajudicial del bien conforme a la Ley de Garantía Mobiliaria. El excedente, de existir, será devuelto a EL DEUDOR.</p>

                <p className="mb-2"><strong>SÉPTIMA:</strong> EL ACREEDOR custodiará el bien con diligencia ordinaria. No responde por deterioro natural, caso fortuito o fuerza mayor.</p>

                <p className="mb-2"><strong>OCTAVA:</strong> El interés moratorio será del 0.5% diario adicional sobre el saldo adeudado desde la fecha de vencimiento.</p>

                <p className="mb-2"><strong>NOVENA:</strong> Para cualquier controversia, las partes se someten a la jurisdicción de los jueces y tribunales de Lima.</p>
            </section>

            {/* FIRMAS */}
            <section className="mt-12">
                <p className="text-sm text-center mb-8">
                    Leído el presente contrato, las partes lo suscriben en señal de conformidad en Lima,
                    el {format(fechaHoy, "dd 'de' MMMM 'de' yyyy", { locale: es })}.
                </p>

                <div className="grid grid-cols-2 gap-16 mt-16">
                    <div className="text-center">
                        <div className="border-t border-black w-48 mx-auto mb-2"></div>
                        <p className="font-bold">JUNTAY S.A.C.</p>
                        <p className="text-xs">EL ACREEDOR</p>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black w-48 mx-auto mb-2"></div>
                        <p className="font-bold">{data.clienteNombre || data.cliente || '________________'}</p>
                        <p className="text-xs">EL DEUDOR</p>
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <div className="border border-black w-24 h-32 flex items-center justify-center text-xs text-gray-400">
                        Huella<br />Digital
                    </div>
                </div>
            </section>

            {/* PIE DE PÁGINA */}
            <div className="mt-8 pt-4 border-t text-xs text-center text-gray-500">
                <p>JUNTAY Soluciones Financieras S.A.C. - RUC 20123456789 - Av. Principal 123, Lima</p>
                <p>Libro de Reclamaciones disponible en establecimiento y en www.juntay.com</p>
            </div>
        </A4Layout>
    )
}

// ============================================================================
// TICKET TÉRMICO 80mm - Para impresora POS
// ============================================================================
const TicketEmpeño = ({ data }: { data: PrintData }) => {
    const fechaHoy = new Date()
    const fechaVencimiento = new Date()
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30)
    const montoInteres = (data.monto || 0) * 0.10
    const totalPagar = (data.monto || 0) + montoInteres

    return (
        <TicketLayout>
            {/* ENCABEZADO */}
            <div className="text-center mb-3">
                <h1 className="text-base font-bold">JUNTAY EMPEÑOS</h1>
                <p>RUC: 20123456789</p>
                <p>Av. Principal 123, Lima</p>
                <p>Tel: (01) 555-0909</p>
            </div>

            <div className="border-b border-dashed border-black my-2"></div>

            <div className="text-center mb-2">
                <p className="font-bold">CONTRATO DE PRENDA</p>
                <p className="font-bold text-sm">#{data.codigo || 'PENDIENTE'}</p>
            </div>

            <div className="border-b border-dashed border-black my-2"></div>

            {/* DATOS OPERACIÓN */}
            <div className="mb-3">
                <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span>{format(fechaHoy, 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <div className="flex justify-between">
                    <span>Cliente:</span>
                    <span className="text-right max-w-[45mm] truncate">{data.clienteNombre || data.cliente}</span>
                </div>
                <div className="flex justify-between">
                    <span>DNI:</span>
                    <span>{data.clienteDocumento || '--------'}</span>
                </div>
            </div>

            <div className="border-b border-dashed border-black my-2"></div>

            {/* ARTÍCULO */}
            <div className="mb-3">
                <p className="font-bold">ARTÍCULO:</p>
                <p className="pl-2">{data.garantiaDescripcion || data.descripcion || 'Según contrato'}</p>
            </div>

            <div className="border-b border-dashed border-black my-2"></div>

            {/* MONTOS */}
            <div className="mb-3">
                <div className="flex justify-between font-bold">
                    <span>PRÉSTAMO:</span>
                    <span>S/ {(data.monto || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Interés (10%):</span>
                    <span>S/ {montoInteres.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-black font-bold text-sm">
                    <span>TOTAL A PAGAR:</span>
                    <span>S/ {totalPagar.toFixed(2)}</span>
                </div>
            </div>

            <div className="border-b border-dashed border-black my-2"></div>

            {/* VENCIMIENTO */}
            <div className="text-center mb-3 p-2 border border-black">
                <p className="font-bold">VENCE:</p>
                <p className="text-base font-bold">{format(fechaVencimiento, 'dd/MM/yyyy')}</p>
            </div>

            {/* LEGAL */}
            <div className="text-[9px] text-justify mb-4">
                <p>
                    Declaro ser propietario del bien empeñado.
                    Pasada la fecha de vencimiento sin renovación,
                    la prenda pasará a proceso de remate según ley.
                </p>
            </div>

            {/* FIRMA */}
            <div className="text-center mt-8 mb-4">
                <div className="border-t border-black w-3/4 mx-auto mb-1"></div>
                <p>Firma del Cliente</p>
            </div>

            <div className="border-b border-dashed border-black my-2"></div>

            <div className="text-center text-[9px]">
                <p>*** CONSERVE ESTE DOCUMENTO ***</p>
                <p>Es requerido para recoger su prenda</p>
                <p className="mt-2">www.juntay.com</p>
            </div>
        </TicketLayout>
    )
}

// ============================================================================
// Tipos
// ============================================================================
interface PrintData {
    codigo?: string
    monto?: number
    cliente?: string
    clienteNombre?: string
    clienteDocumento?: string
    clienteDireccion?: string
    descripcion?: string
    garantiaDescripcion?: string
    garantiaEstado?: string
    valorTasacion?: number
    estado?: string
    tasaInteres?: number // Tasa mensual configurable (por defecto 20%)
    fotos?: string[] // URLs de fotos del bien en garantía
}

interface PrintSuccessModalProps {
    open: boolean
    data: PrintData | null
    onClose: () => void
    onReset: () => void
}
// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export function PrintSuccessModal({ open, data, onClose, onReset }: PrintSuccessModalProps) {
    if (!data) return null

    // Función para imprimir usando window.open (más confiable)
    const printHTML = (title: string, content: string) => {
        const printWindow = window.open('', '_blank', 'width=800,height=600')
        if (!printWindow) {
            alert('Por favor permite las ventanas emergentes para imprimir')
            return
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <meta charset="UTF-8">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Roboto', sans-serif; font-size: 11pt; line-height: 1.4; color: #000; background: #fff; }
                    .container { width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                    .title { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 15px; }
                    .section { margin-bottom: 15px; }
                    .section-title { font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 8px; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
                    .box { border: 1px solid #000; padding: 8px; text-align: center; }
                    .highlight { background: #ffe4e6; }
                    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: center; }
                    th { background: #f0f0f0; }
                    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 50px; text-align: center; }
                    .signature-line { border-top: 1px solid #000; padding-top: 5px; margin: 0 auto; width: 200px; }
                    .fingerprint { width: 80px; height: 100px; border: 1px solid #000; margin: 20px auto; display: flex; align-items: center; justify-content: center; font-size: 9pt; color: #999; }
                    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #000; font-size: 9pt; text-align: center; color: #666; }
                    .small { font-size: 9pt; }
                    .bold { font-weight: bold; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `)

        printWindow.document.close()
        printWindow.focus()

        // Esperar a que cargue y luego imprimir
        setTimeout(() => {
            printWindow.print()
            // printWindow.close() - Dejamos abierta para que el usuario vea
        }, 500)
    }

    const handlePrintContract = () => {
        const fechaHoy = new Date()
        const fechaVencimiento = new Date()
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30)

        // Tasa mensual configurable (por defecto 20%)
        const tasaMensual = data.tasaInteres || 20
        // Tasas proporcionales por semana
        const tasaSemana1 = tasaMensual * 0.25
        const tasaSemana2 = tasaMensual * 0.50
        const tasaSemana3 = tasaMensual * 0.75

        const monto = data.monto || 0
        const montoInteres = monto * (tasaMensual / 100)
        const totalPagar = monto + montoInteres
        const montoMaximoGarantizado = totalPagar * 1.3 // Capital + intereses + costos ejecución

        const formatDate = (d: Date) => d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        const formatDateLong = (d: Date) => d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })

        // Calcular fechas de semanas
        const fechaSem1 = new Date(fechaHoy.getTime() + 7 * 24 * 60 * 60 * 1000)
        const fechaSem2 = new Date(fechaHoy.getTime() + 14 * 24 * 60 * 60 * 1000)
        const fechaSem3 = new Date(fechaHoy.getTime() + 21 * 24 * 60 * 60 * 1000)

        const content = `
            <div class="contract">
                <!-- ENCABEZADO -->
                <div class="header">
                    <div>
                        <div style="font-size: 22pt; font-weight: bold; color: #1e40af;">JUNTAY</div>
                        <div style="font-size: 10pt;">Marca de FREECLOUD S.A.C.</div>
                        <div style="font-size: 9pt; color: #666;">RUC: 20600345665</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold; font-size: 11pt;">CONTRATO N° ${data.codigo || 'PENDIENTE'}</div>
                        <div style="font-size: 9pt;">Fecha: ${formatDate(fechaHoy)}</div>
                    </div>
                </div>

                <div class="title">CONTRATO DE MUTUO CON GARANTÍA PRENDARIA</div>
                <p style="text-align: center; font-size: 9pt; margin-bottom: 15px; color: #666;">Ley de Garantía Mobiliaria - Ley N° 28677</p>

                <!-- INTRODUCCIÓN -->
                <p style="font-size: 9pt; text-align: justify; margin-bottom: 15px;">
                    Conste por el presente documento privado, el contrato de mutuo dinerario con constitución de garantía prendaria, que celebran de una parte <strong>FREECLOUD SOCIEDAD ANÓNIMA CERRADA</strong>, con RUC N° 20600345665, con domicilio en Jr. Cahuide 298, El Tambo, Huancayo, Junín, operando bajo la marca comercial "JUNTAY", a quien en adelante se denominará <strong>"EL ACREEDOR"</strong>; y de la otra parte <strong>${data.clienteNombre || data.cliente || '_________________'}</strong>, identificado(a) con DNI N° ${data.clienteDocumento || '________'}, domiciliado(a) en ${data.clienteDireccion || 'según ficha de registro'}, a quien en adelante se denominará <strong>"EL DEUDOR"</strong>.
                </p>

                <!-- CLÁUSULA PRIMERA -->
                <div class="section">
                    <div class="section-title">CLÁUSULA PRIMERA: OBJETO Y MONTO (Art. 32 Ley 28677)</div>
                    <p>EL ACREEDOR otorga a EL DEUDOR un préstamo de dinero, constituyéndose GARANTÍA PRENDARIA CON DESPLAZAMIENTO sobre el bien descrito en la Cláusula Segunda.</p>
                    <table class="data-table">
                        <tr><td class="label">MONTO DEL PRÉSTAMO</td><td class="value"><strong>S/ ${monto.toFixed(2)}</strong></td></tr>
                        <tr><td class="label">Tasa de Interés Mensual</td><td class="value">${tasaMensual}%</td></tr>
                        <tr><td class="label">Interés del Período (30 días)</td><td class="value">S/ ${montoInteres.toFixed(2)}</td></tr>
                        <tr><td class="label">TOTAL A PAGAR AL VENCIMIENTO</td><td class="value"><strong>S/ ${totalPagar.toFixed(2)}</strong></td></tr>
                        <tr><td class="label">Monto Máximo Garantizado</td><td class="value">S/ ${montoMaximoGarantizado.toFixed(2)}</td></tr>
                    </table>
                </div>

                <!-- CLÁUSULA SEGUNDA -->
                <div class="section">
                    <div class="section-title">CLÁUSULA SEGUNDA: BIEN EN GARANTÍA (Art. 32 inc. 3 Ley 28677)</div>
                    <div class="box">${data.garantiaDescripcion || data.descripcion || 'Según detalle en ficha de registro'}</div>
                    <table class="data-table" style="margin-top: 8px;">
                        <tr><td class="label">Valor de Tasación</td><td class="value">S/ ${(data.valorTasacion || monto).toFixed(2)}</td></tr>
                        <tr><td class="label">Estado</td><td class="value">${data.garantiaEstado || 'Operativo'}</td></tr>
                        <tr><td class="label">Ubicación del Bien</td><td class="value">Custodia de JUNTAY - Jr. Cahuide 298, El Tambo</td></tr>
                    </table>
                    ${data.fotos && data.fotos.length > 0 ? `
                    <div class="photo-gallery">
                        <p style="font-size: 8pt; font-weight: bold; margin: 8px 0 5px 0;">EVIDENCIA FOTOGRÁFICA:</p>
                        <div class="photo-grid">
                            ${data.fotos.slice(0, 4).map((foto, i) => `<img src="${foto}" alt="Foto ${i + 1}" class="photo-thumb" />`).join('')}
                        </div>
                    </div>
                    ` : ''}
                    <p style="font-size: 8pt; margin-top: 5px;">EL DEUDOR declara bajo juramento ser el único y legítimo propietario del bien, que está libre de gravámenes y que no proviene de acto ilícito.</p>
                </div>

                <!-- CLÁUSULA TERCERA -->
                <div class="section">
                    <div class="section-title">CLÁUSULA TERCERA: PLAZO Y CRONOGRAMA DE PAGO</div>
                    <table class="data-table">
                        <tr><td class="label">Fecha de Desembolso</td><td class="value">${formatDate(fechaHoy)}</td></tr>
                        <tr><td class="label">FECHA DE VENCIMIENTO</td><td class="value" style="color: #dc2626; font-weight: bold;">${formatDate(fechaVencimiento)}</td></tr>
                    </table>
                    <p style="font-size: 9pt; margin: 10px 0 5px 0;"><strong>PAGO ANTICIPADO SIN PENALIDAD:</strong></p>
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th>Período</th>
                                <th>Fecha Límite</th>
                                <th>% Interés</th>
                                <th>Interés</th>
                                <th>Total a Pagar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="background: #f0fdf4;">
                                <td>1ª Semana</td>
                                <td>${formatDate(fechaSem1)}</td>
                                <td style="color: #16a34a; font-weight: bold;">${tasaSemana1.toFixed(1)}%</td>
                                <td>S/ ${(monto * tasaSemana1 / 100).toFixed(2)}</td>
                                <td style="font-weight: bold; color: #16a34a;">S/ ${(monto * (1 + tasaSemana1 / 100)).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>2ª Semana</td>
                                <td>${formatDate(fechaSem2)}</td>
                                <td style="color: #ca8a04; font-weight: bold;">${tasaSemana2.toFixed(1)}%</td>
                                <td>S/ ${(monto * tasaSemana2 / 100).toFixed(2)}</td>
                                <td style="font-weight: bold;">S/ ${(monto * (1 + tasaSemana2 / 100)).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>3ª Semana</td>
                                <td>${formatDate(fechaSem3)}</td>
                                <td style="color: #ea580c; font-weight: bold;">${tasaSemana3.toFixed(1)}%</td>
                                <td>S/ ${(monto * tasaSemana3 / 100).toFixed(2)}</td>
                                <td style="font-weight: bold;">S/ ${(monto * (1 + tasaSemana3 / 100)).toFixed(2)}</td>
                            </tr>
                            <tr style="background: #fef2f2;">
                                <td><strong>Vencimiento</strong></td>
                                <td><strong>${formatDate(fechaVencimiento)}</strong></td>
                                <td style="color: #dc2626; font-weight: bold;">${tasaMensual}%</td>
                                <td>S/ ${montoInteres.toFixed(2)}</td>
                                <td style="font-weight: bold; color: #dc2626;">S/ ${totalPagar.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- CLÁUSULAS LEGALES EN COLUMNAS -->
                <div class="legal-columns">
                    <div class="section-title" style="column-span: all;">CLÁUSULAS LEGALES</div>
                    
                    <p><strong>CUARTA - MORA AUTOMÁTICA:</strong> Conforme al Art. 1333° del Código Civil, la mora opera de pleno derecho desde el día siguiente al vencimiento, sin necesidad de requerimiento. Interés moratorio: 0.3% diario adicional.</p>
                    
                    <p><strong>QUINTA - VENTA EXTRAJUDICIAL (Art. 47 Ley 28677):</strong> EL DEUDOR autoriza expresamente a EL ACREEDOR para la venta directa del bien sin intervención judicial. Transcurridos 7 días calendario desde el vencimiento sin pago, se procederá a la venta. Del precio se descontarán capital, intereses y gastos; el remanente quedará a disposición de EL DEUDOR por 30 días.</p>
                    
                    <p><strong>SEXTA - DECLARACIONES:</strong> EL DEUDOR declara que la información proporcionada es veraz, que no está en insolvencia, y que ha leído y comprendido este contrato.</p>
                    
                    <p><strong>SÉPTIMA - VENCIMIENTO ANTICIPADO:</strong> EL ACREEDOR podrá exigir pago inmediato si: (a) la información proporcionada es falsa, (b) el bien tiene gravámenes ocultos, o (c) EL DEUDOR es declarado insolvente.</p>
                    
                    <p><strong>OCTAVA - CUSTODIA:</strong> EL ACREEDOR custodiará el bien con diligencia ordinaria. No responde por deterioro natural ni caso fortuito.</p>
                    
                    <p><strong>NOVENA - COMPETENCIA:</strong> Las partes se someten a los Jueces de Huancayo. EL DEUDOR renuncia al fuero de su domicilio.</p>
                    
                    <p><strong>DÉCIMA - PAGARÉ:</strong> EL DEUDOR suscribe pagaré incompleto (Art. 10 Ley 27287), autorizando a EL ACREEDOR a completarlo con el monto adeudado en caso de incumplimiento.</p>
                </div>

                <!-- FIRMAS -->
                <p style="text-align: center; font-size: 9pt; margin-top: 20px;">
                    Leído el presente contrato, las partes lo suscriben en Huancayo, el ${formatDateLong(fechaHoy)}.
                </p>

                <div class="signatures">
                    <div>
                        <div class="signature-line"></div>
                        <div style="font-weight: bold;">FREECLOUD S.A.C.</div>
                        <div style="font-size: 9pt;">Marca: JUNTAY</div>
                        <div style="font-size: 8pt;">EL ACREEDOR</div>
                    </div>
                    <div>
                        <div class="signature-line"></div>
                        <div style="font-weight: bold;">${data.clienteNombre || data.cliente || '_________________'}</div>
                        <div style="font-size: 9pt;">DNI: ${data.clienteDocumento || '________'}</div>
                        <div style="font-size: 8pt;">EL DEUDOR</div>
                    </div>
                </div>

                <div class="fingerprint">
                    <div style="border: 1px solid #000; width: 60px; height: 80px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        <span style="font-size: 8pt; text-align: center;">Huella<br/>Digital</span>
                    </div>
                </div>

                <!-- CONSTANCIA -->
                <div style="margin-top: 15px; padding: 10px; border: 1px solid #ccc; font-size: 9pt;">
                    <strong>CONSTANCIA DE RECEPCIÓN:</strong> Declaro haber recibido S/ ${monto.toFixed(2)} en efectivo y copia del presente contrato.<br/>
                    Firma: _________________ Fecha: ${formatDate(fechaHoy)}
                </div>

                <!-- PIE DE PÁGINA CON QR -->
                <div class="footer-with-qr">
                    <div class="qr-section">
                        <img src="https://chart.googleapis.com/chart?cht=qr&chs=80x80&chl=JUNTAY-${data.codigo || 'PENDIENTE'}" alt="QR Contrato" />
                        <div class="qr-label">Escanea para verificar</div>
                    </div>
                    <div class="footer-text">
                        <p><strong>JUNTAY</strong> - Marca de FREECLOUD S.A.C.</p>
                        <p>RUC 20600345665 | Jr. Cahuide 298, El Tambo, Huancayo</p>
                        <p style="font-size: 7pt;">Libro de Reclamaciones disponible | Contrato N° ${data.codigo || 'PENDIENTE'}</p>
                    </div>
                </div>
            </div>
        `

        // CSS mejorado para impresión legal
        const printWindow = window.open('', '_blank', 'width=800,height=600')
        if (!printWindow) {
            alert('Por favor permite las ventanas emergentes para imprimir')
            return
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Contrato ${data.codigo}</title>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.4; padding: 15mm; }
                    .contract { max-width: 190mm; margin: 0 auto; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e40af; padding-bottom: 10px; margin-bottom: 15px; }
                    .title { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 5px; }
                    .section { margin-bottom: 12px; }
                    .section-title { font-weight: bold; font-size: 10pt; background: #f3f4f6; padding: 4px 8px; margin-bottom: 6px; border-left: 3px solid #1e40af; }
                    .box { border: 1px solid #ccc; padding: 8px; background: #fafafa; font-size: 9pt; }
                    .data-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
                    .data-table td { padding: 4px 8px; border: 1px solid #ddd; }
                    .data-table .label { background: #f9fafb; width: 40%; font-weight: 500; }
                    .data-table .value { text-align: right; }
                    .schedule-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 5px; }
                    .schedule-table th, .schedule-table td { border: 1px solid #ddd; padding: 4px 6px; text-align: center; }
                    .schedule-table th { background: #e5e7eb; font-weight: bold; }
                    .legal-columns { column-count: 2; column-gap: 15px; font-size: 8pt; text-align: justify; margin: 10px 0; }
                    .legal-columns p { margin-bottom: 6px; break-inside: avoid; }
                    .signatures { display: flex; justify-content: space-around; margin-top: 30px; text-align: center; }
                    .signature-line { border-top: 1px solid #000; width: 150px; margin: 0 auto 5px auto; }
                    .fingerprint { text-align: center; margin-top: 15px; }
                    .footer-with-qr { display: flex; align-items: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid #ccc; gap: 15px; }
                    .qr-section { text-align: center; }
                    .qr-section img { width: 80px; height: 80px; }
                    .qr-label { font-size: 7pt; color: #666; margin-top: 2px; }
                    .footer-text { text-align: left; font-size: 8pt; color: #666; flex: 1; }
                    .photo-gallery { margin-top: 10px; }
                    .photo-grid { display: flex; gap: 8px; flex-wrap: wrap; }
                    .photo-thumb { width: 80px; height: 80px; object-fit: cover; border: 1px solid #ccc; border-radius: 4px; }
                    @media print { 
                        body { padding: 10mm; }
                        .legal-columns { column-count: 2; }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `)

        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => { printWindow.print() }, 500)
    }

    const handlePrintTicket = () => {
        const fechaHoy = new Date()
        const fechaVencimiento = new Date()
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30)
        const montoInteres = (data.monto || 0) * 0.10
        const totalPagar = (data.monto || 0) + montoInteres
        const formatDate = (d: Date) => d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        const formatDateTime = (d: Date) => d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

        const content = `
            <div style="width: 80mm; padding: 10px; font-family: 'Courier New', monospace; font-size: 10pt;">
                <div style="text-align: center; margin-bottom: 10px;">
                    <div style="font-size: 14pt; font-weight: bold;">JUNTAY EMPEÑOS</div>
                    <div style="font-size: 9pt;">FREECLOUD S.A.C.</div>
                    <div>RUC: 20600345665</div>
                    <div>Jr. Cahuide 298, El Tambo</div>
                    <div>Huancayo - Tel: 920120843</div>
                </div>

                <div style="border-bottom: 1px dashed #000; margin: 8px 0;"></div>

                <div style="text-align: center;">
                    <div style="font-weight: bold;">CONTRATO DE PRENDA</div>
                    <div style="font-size: 12pt; font-weight: bold;">#${data.codigo || 'PENDIENTE'}</div>
                </div>

                <div style="border-bottom: 1px dashed #000; margin: 8px 0;"></div>

                <div>
                    <div style="display: flex; justify-content: space-between;"><span>Fecha:</span><span>${formatDateTime(fechaHoy)}</span></div>
                    <div style="display: flex; justify-content: space-between;"><span>Cliente:</span><span>${data.clienteNombre || data.cliente || '---'}</span></div>
                    <div style="display: flex; justify-content: space-between;"><span>DNI:</span><span>${data.clienteDocumento || '--------'}</span></div>
                </div>

                <div style="border-bottom: 1px dashed #000; margin: 8px 0;"></div>

                <div>
                    <div style="font-weight: bold;">ARTÍCULO:</div>
                    <div style="padding-left: 5px;">${data.garantiaDescripcion || data.descripcion || 'Según contrato'}</div>
                </div>

                <div style="border-bottom: 1px dashed #000; margin: 8px 0;"></div>

                <div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold;"><span>PRÉSTAMO:</span><span>S/ ${(data.monto || 0).toFixed(2)}</span></div>
                    <div style="display: flex; justify-content: space-between;"><span>Interés (10%):</span><span>S/ ${montoInteres.toFixed(2)}</span></div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12pt; border-top: 1px solid #000; margin-top: 5px; padding-top: 5px;">
                        <span>TOTAL A PAGAR:</span><span>S/ ${totalPagar.toFixed(2)}</span>
                    </div>
                </div>

                <div style="border-bottom: 1px dashed #000; margin: 8px 0;"></div>

                <div style="text-align: center; padding: 10px; border: 1px solid #000;">
                    <div style="font-weight: bold;">VENCE:</div>
                    <div style="font-size: 14pt; font-weight: bold;">${formatDate(fechaVencimiento)}</div>
                </div>

                <div style="font-size: 8pt; text-align: justify; margin: 10px 0;">
                    Declaro ser propietario del bien empeñado. Pasada la fecha de vencimiento sin renovación, la prenda pasará a proceso de remate según ley.
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <div style="border-top: 1px solid #000; width: 60%; margin: 0 auto;"></div>
                    <div>Firma del Cliente</div>
                </div>

                <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>

                <div style="text-align: center; font-size: 8pt;">
                    <div>*** CONSERVE ESTE DOCUMENTO ***</div>
                    <div>Es requerido para recoger su prenda</div>
                    <div style="margin-top: 5px;">www.juntay.com</div>
                </div>
            </div>
        `

        printHTML(`Ticket ${data.codigo}`, content)
    }

    const handlePrintPagare = () => {
        const fechaHoy = new Date()
        const formatDate = (d: Date) => d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        const formatDateLong = (d: Date) => d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
        const monto = data.monto || 0
        const tasaMensual = data.tasaInteres || 20

        const content = `
            <div class="pagare">
                <div class="header">
                    <div class="title">PAGARÉ INCOMPLETO</div>
                    <div class="subtitle">Ley N° 27287 - Ley de Títulos Valores (Art. 10)</div>
                    <div class="contract-ref">Anexo al Contrato N° ${data.codigo || 'PENDIENTE'}</div>
                </div>

                <div class="section">
                    <table class="info-table">
                        <tr>
                            <td class="label">Lugar y fecha de emisión:</td>
                            <td>Huancayo, ${formatDateLong(fechaHoy)}</td>
                        </tr>
                        <tr>
                            <td class="label">Vencimiento:</td>
                            <td class="fill-line">____________________________</td>
                        </tr>
                        <tr>
                            <td class="label">Por la suma de:</td>
                            <td class="fill-line">S/ ________________________</td>
                        </tr>
                    </table>
                </div>

                <div class="section">
                    <p class="body-text">
                        <strong>DEBO(EMOS) Y PAGARÉ(MOS) INCONDICIONALMENTE</strong> a la orden de 
                        <strong>FREECLOUD SOCIEDAD ANÓNIMA CERRADA</strong>, con RUC N° 20600345665, 
                        domiciliado en Jr. Cahuide 298, El Tambo, Huancayo, Junín, la cantidad arriba indicada.
                    </p>
                </div>

                <div class="section">
                    <div class="section-title">OBLIGADO PRINCIPAL / EMITENTE:</div>
                    <table class="info-table">
                        <tr>
                            <td class="label">Nombre completo:</td>
                            <td>${data.clienteNombre || data.cliente || '____________________________'}</td>
                        </tr>
                        <tr>
                            <td class="label">Documento:</td>
                            <td>DNI N° ${data.clienteDocumento || '________'}</td>
                        </tr>
                        <tr>
                            <td class="label">Domicilio:</td>
                            <td>${data.clienteDireccion || '____________________________'}</td>
                        </tr>
                    </table>
                </div>

                <div class="section authorization">
                    <div class="section-title">CLÁUSULA DE AUTORIZACIÓN DE LLENADO (Art. 10 Ley 27287)</div>
                    <p class="body-text">
                        <strong>AUTORIZO EXPRESAMENTE</strong> a FREECLOUD S.A.C. (marca JUNTAY) a completar este pagaré 
                        con el monto total de la deuda que resulte de la liquidación del Contrato de Mutuo con Garantía 
                        Prendaria N° ${data.codigo || '________'}, incluyendo:
                    </p>
                    <ul>
                        <li>Capital adeudado: S/ ${monto.toFixed(2)}</li>
                        <li>Intereses compensatorios (${tasaMensual}% mensual)</li>
                        <li>Intereses moratorios (0.3% diario)</li>
                        <li>Gastos de cobranza y ejecución</li>
                    </ul>
                    <p class="body-text">
                        Asimismo, autorizo a completar la fecha de vencimiento que corresponda según la liquidación 
                        practicada. <strong>Esta autorización es IRREVOCABLE.</strong>
                    </p>
                </div>

                <div class="signatures">
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="signature-name">${data.clienteNombre || data.cliente || '____________________'}</div>
                        <div class="signature-doc">DNI: ${data.clienteDocumento || '________'}</div>
                        <div class="signature-label">FIRMA DEL EMITENTE</div>
                    </div>
                    <div class="fingerprint-box">
                        <div class="fingerprint">HUELLA<br/>DIGITAL</div>
                        <div class="fingerprint-label">Índice Derecho</div>
                    </div>
                </div>

                <div class="receipt">
                    <p><strong>CONSTANCIA:</strong> Recibí copia de este pagaré incompleto.</p>
                    <p>Firma: _________________ Fecha: ${formatDate(fechaHoy)}</p>
                </div>

                <div class="footer">
                    <p>JUNTAY - Marca de FREECLOUD S.A.C. - RUC 20600345665</p>
                    <p>Jr. Cahuide 298, El Tambo, Huancayo</p>
                </div>
            </div>
        `

        const printWindow = window.open('', '_blank', 'width=800,height=600')
        if (!printWindow) {
            alert('Por favor permite las ventanas emergentes para imprimir')
            return
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Pagaré ${data.codigo}</title>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; padding: 20mm; }
                    .pagare { max-width: 180mm; margin: 0 auto; border: 2px solid #333; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #999; }
                    .title { font-size: 18pt; font-weight: bold; letter-spacing: 2px; }
                    .subtitle { font-size: 10pt; color: #666; margin-top: 5px; }
                    .contract-ref { font-size: 11pt; font-weight: bold; margin-top: 10px; }
                    .section { margin-bottom: 15px; }
                    .section-title { font-weight: bold; font-size: 10pt; background: #f0f0f0; padding: 5px 10px; margin-bottom: 10px; }
                    .info-table { width: 100%; border-collapse: collapse; }
                    .info-table td { padding: 5px 0; vertical-align: top; }
                    .info-table .label { width: 40%; font-weight: bold; }
                    .fill-line { font-style: italic; color: #999; }
                    .body-text { text-align: justify; margin-bottom: 10px; }
                    .authorization { background: #fffef0; border: 1px solid #e0d080; padding: 15px; }
                    .authorization ul { margin-left: 20px; margin-bottom: 10px; }
                    .authorization li { margin-bottom: 3px; }
                    .signatures { display: flex; justify-content: space-around; margin-top: 30px; padding-top: 20px; }
                    .signature-box { text-align: center; width: 45%; }
                    .signature-line { border-top: 1px solid #000; width: 80%; margin: 0 auto 10px auto; }
                    .signature-name { font-weight: bold; font-size: 10pt; }
                    .signature-doc { font-size: 9pt; }
                    .signature-label { font-size: 9pt; margin-top: 5px; color: #666; }
                    .fingerprint-box { text-align: center; width: 25%; }
                    .fingerprint { border: 1px solid #000; width: 60px; height: 80px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 8pt; }
                    .fingerprint-label { font-size: 8pt; margin-top: 5px; }
                    .receipt { margin-top: 20px; padding: 10px; border: 1px dashed #999; font-size: 10pt; }
                    .footer { margin-top: 20px; text-align: center; font-size: 9pt; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
                    @media print { body { padding: 10mm; } .pagare { border: 1px solid #000; } }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `)

        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => { printWindow.print() }, 500)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md text-center" onInteractOutside={(e) => e.preventDefault()}>
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                </div>

                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-slate-800">
                        {data.estado === 'DESEMBOLSADO' ? '¡Efectivo Desembolsado!' : '¡Crédito Aprobado!'}
                    </DialogTitle>
                    <p className="text-slate-500">
                        La operación #{data.codigo} ha sido registrada correctamente.
                    </p>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-3 py-6">
                    <Button variant="outline" className="h-20 flex-col gap-1 hover:bg-blue-50 border-2" onClick={handlePrintContract}>
                        <FileText className="h-6 w-6 text-blue-600" />
                        <span className="text-xs">Contrato</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-1 hover:bg-amber-50 border-2" onClick={handlePrintPagare}>
                        <Scroll className="h-6 w-6 text-amber-600" />
                        <span className="text-xs">Pagaré</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-1 hover:bg-emerald-50 border-2" onClick={handlePrintTicket}>
                        <Printer className="h-6 w-6 text-emerald-600" />
                        <span className="text-xs">Ticket</span>
                    </Button>
                </div>

                <DialogFooter className="sm:justify-center gap-2">
                    <Button variant="ghost" onClick={onClose}>
                        Cerrar
                    </Button>
                    <Button className="w-full bg-slate-900" onClick={() => {
                        onClose()
                        onReset()
                    }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Cliente
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
