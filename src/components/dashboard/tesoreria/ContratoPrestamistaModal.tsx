'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, Printer } from 'lucide-react'

interface ContratoPrestamistaProps {
    inversionista: {
        nombre: string
        dni: string
    }
    empresa: {
        nombre: string
        ruc: string
        direccion?: string
        representante?: string
    }
    terminos: {
        monto: number
        tasaInteres: number
        tipoTasa: 'ANUAL' | 'MENSUAL'
        plazoMeses: number
        modalidadPago: 'BULLET' | 'INTERES_MENSUAL'
        fechaIngreso: string
        fechaVencimiento: string
        totalDevolver: number
        formaPago: string
        notas?: string
    }
}

export function ContratoPrestamistaModal({ inversionista, empresa, terminos }: ContratoPrestamistaProps) {
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const content = printRef.current
        if (!content) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        printWindow.document.write(`
            <html>
                <head>
                    <title>Contrato de Préstamo - ${inversionista.nombre}</title>
                    <style>
                        body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; }
                        h1 { text-align: center; font-size: 18px; margin-bottom: 30px; }
                        h2 { font-size: 14px; margin-top: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .section { margin-bottom: 20px; }
                        .clause { margin-bottom: 15px; text-align: justify; }
                        .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
                        .signature { text-align: center; width: 200px; }
                        .signature-line { border-top: 1px solid black; margin-top: 60px; padding-top: 5px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        td { padding: 8px; border: 1px solid #ccc; }
                        .label { font-weight: bold; width: 40%; background: #f5f5f5; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    ${content.innerHTML}
                </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.print()
    }

    const formatCurrency = (amount: number) => {
        return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    const hoy = new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Ver Contrato
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Contrato de Préstamo</span>
                        <Button onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" />
                            Imprimir
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                {/* Printable Contract Content */}
                <div ref={printRef} className="p-6 bg-white text-black text-sm">
                    <div className="header">
                        <h1>CONTRATO DE MUTUO DINERARIO<br />(PRÉSTAMO CON INTERESES)</h1>
                    </div>

                    <p className="clause">
                        Conste por el presente documento, el <strong>CONTRATO DE MUTUO DINERARIO</strong> que
                        celebran de una parte:
                    </p>

                    <div className="section">
                        <h2>LAS PARTES:</h2>
                        <p className="clause">
                            <strong>EL MUTUANTE (Prestamista):</strong><br />
                            Nombre: <strong>{inversionista.nombre}</strong><br />
                            DNI: <strong>{inversionista.dni}</strong><br />
                            En adelante denominado "EL PRESTAMISTA".
                        </p>
                        <p className="clause">
                            <strong>EL MUTUATARIO (Prestatario):</strong><br />
                            Razón Social: <strong>{empresa.nombre}</strong><br />
                            RUC: <strong>{empresa.ruc}</strong><br />
                            {empresa.representante && <>Representante Legal: <strong>{empresa.representante}</strong><br /></>}
                            En adelante denominado "LA EMPRESA".
                        </p>
                    </div>

                    <div className="section">
                        <h2>CLÁUSULA PRIMERA: OBJETO DEL CONTRATO</h2>
                        <p className="clause">
                            Por el presente contrato, EL PRESTAMISTA entrega en calidad de préstamo a
                            LA EMPRESA la suma de <strong>{formatCurrency(terminos.monto)}</strong>
                            (en adelante "EL CAPITAL"), cantidad que LA EMPRESA declara recibir
                            a su entera satisfacción.
                        </p>
                    </div>

                    <div className="section">
                        <h2>CLÁUSULA SEGUNDA: TÉRMINOS FINANCIEROS</h2>
                        <table>
                            <tbody>
                                <tr>
                                    <td className="label">Capital Prestado</td>
                                    <td>{formatCurrency(terminos.monto)}</td>
                                </tr>
                                <tr>
                                    <td className="label">Tasa de Interés</td>
                                    <td>{terminos.tasaInteres}% {terminos.tipoTasa.toLowerCase()}</td>
                                </tr>
                                <tr>
                                    <td className="label">Plazo</td>
                                    <td>{terminos.plazoMeses} meses</td>
                                </tr>
                                <tr>
                                    <td className="label">Fecha de Desembolso</td>
                                    <td>{formatDate(terminos.fechaIngreso)}</td>
                                </tr>
                                <tr>
                                    <td className="label">Fecha de Vencimiento</td>
                                    <td>{terminos.fechaVencimiento}</td>
                                </tr>
                                <tr>
                                    <td className="label">Modalidad de Pago</td>
                                    <td>{terminos.modalidadPago === 'BULLET'
                                        ? 'Capital e intereses al vencimiento'
                                        : 'Intereses mensuales, capital al vencimiento'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="label">Total a Devolver</td>
                                    <td><strong>{formatCurrency(terminos.totalDevolver)}</strong></td>
                                </tr>
                                <tr>
                                    <td className="label">Forma de Devolución</td>
                                    <td>{terminos.formaPago}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="section">
                        <h2>CLÁUSULA TERCERA: OBLIGACIONES DE LA EMPRESA</h2>
                        <p className="clause">
                            LA EMPRESA se compromete a devolver el capital más los intereses acordados
                            en la fecha de vencimiento establecida. El incumplimiento generará intereses
                            moratorios equivalentes al 50% de la tasa pactada.
                        </p>
                    </div>

                    <div className="section">
                        <h2>CLÁUSULA CUARTA: PREPAGO</h2>
                        <p className="clause">
                            LA EMPRESA podrá cancelar el préstamo antes del vencimiento, pagando el
                            capital más los intereses devengados hasta la fecha de cancelación,
                            sin penalidad alguna.
                        </p>
                    </div>

                    <div className="section">
                        <h2>CLÁUSULA QUINTA: RESOLUCIÓN DE CONTROVERSIAS</h2>
                        <p className="clause">
                            Las partes acuerdan que cualquier controversia derivada del presente contrato
                            será resuelta de manera amigable. En caso de no llegar a un acuerdo,
                            se someterán a la jurisdicción de los jueces y tribunales del domicilio
                            de LA EMPRESA.
                        </p>
                    </div>

                    {terminos.notas && (
                        <div className="section">
                            <h2>CLÁUSULA SEXTA: CONDICIONES ESPECIALES</h2>
                            <p className="clause">{terminos.notas}</p>
                        </div>
                    )}

                    <p className="clause" style={{ marginTop: '30px' }}>
                        En señal de conformidad, las partes suscriben el presente contrato en dos ejemplares
                        de igual tenor y valor, en la ciudad de Lima, a los {hoy}.
                    </p>

                    <div className="signatures">
                        <div className="signature">
                            <div className="signature-line">
                                {inversionista.nombre}<br />
                                DNI: {inversionista.dni}<br />
                                <em>EL PRESTAMISTA</em>
                            </div>
                        </div>
                        <div className="signature">
                            <div className="signature-line">
                                {empresa.representante || 'Representante Legal'}<br />
                                {empresa.nombre}<br />
                                <em>LA EMPRESA</em>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
