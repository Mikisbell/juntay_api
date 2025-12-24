'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, Printer } from 'lucide-react'

interface ContratoSocioProps {
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
        porcentaje: number
        fechaIngreso: string
        formaPago: string
        notas?: string
    }
}

export function ContratoSocioModal({ inversionista, empresa, terminos }: ContratoSocioProps) {
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const content = printRef.current
        if (!content) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        printWindow.document.write(`
            <html>
                <head>
                    <title>Contrato de Participación - ${inversionista.nombre}</title>
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
                        <span>Contrato de Participación Societaria</span>
                        <Button onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" />
                            Imprimir
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                {/* Printable Contract Content */}
                <div ref={printRef} className="p-6 bg-white text-black text-sm">
                    <div className="header">
                        <h1>CONTRATO DE APORTE DE CAPITAL<br />(PARTICIPACIÓN EN UTILIDADES)</h1>
                    </div>

                    <p className="clause">
                        Conste por el presente documento, el <strong>CONTRATO DE APORTE DE CAPITAL</strong> que
                        celebran de una parte:
                    </p>

                    <div className="section">
                        <h2>LAS PARTES:</h2>
                        <p className="clause">
                            <strong>EL SOCIO INVERSIONISTA:</strong><br />
                            Nombre: <strong>{inversionista.nombre}</strong><br />
                            DNI: <strong>{inversionista.dni}</strong><br />
                            En adelante denominado "EL SOCIO".
                        </p>
                        <p className="clause">
                            <strong>LA EMPRESA:</strong><br />
                            Razón Social: <strong>{empresa.nombre}</strong><br />
                            RUC: <strong>{empresa.ruc}</strong><br />
                            {empresa.representante && <>Representante Legal: <strong>{empresa.representante}</strong><br /></>}
                            En adelante denominada "LA EMPRESA".
                        </p>
                    </div>

                    <div className="section">
                        <h2>CLÁUSULA PRIMERA: OBJETO DEL CONTRATO</h2>
                        <p className="clause">
                            Por el presente contrato, EL SOCIO aporta a LA EMPRESA la suma de{' '}
                            <strong>{formatCurrency(terminos.monto)}</strong> a cambio de una participación
                            del <strong>{terminos.porcentaje}%</strong> en las utilidades netas del negocio.
                        </p>
                    </div>

                    <div className="section">
                        <h2>CLÁUSULA SEGUNDA: TÉRMINOS DE LA PARTICIPACIÓN</h2>
                        <table>
                            <tbody>
                                <tr>
                                    <td className="label">Monto del Aporte</td>
                                    <td>{formatCurrency(terminos.monto)}</td>
                                </tr>
                                <tr>
                                    <td className="label">Porcentaje de Participación</td>
                                    <td><strong>{terminos.porcentaje}%</strong> de las utilidades netas</td>
                                </tr>
                                <tr>
                                    <td className="label">Fecha de Aporte</td>
                                    <td>{formatDate(terminos.fechaIngreso)}</td>
                                </tr>
                                <tr>
                                    <td className="label">Forma de Aporte</td>
                                    <td>{terminos.formaPago}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="section">
                        <h2>CLÁUSULA TERCERA: DERECHOS DEL SOCIO</h2>
                        <p className="clause">
                            EL SOCIO tendrá derecho a:
                        </p>
                        <ol style={{ marginLeft: '20px' }}>
                            <li>Recibir el {terminos.porcentaje}% de las utilidades netas mensuales/trimestrales/anuales, según se acuerde.</li>
                            <li>Acceder a información financiera básica de LA EMPRESA.</li>
                            <li>Solicitar la devolución de su aporte con preaviso de 30 días.</li>
                        </ol>
                    </div>

                    <div className="section">
                        <h2>CLÁUSULA CUARTA: OBLIGACIONES DEL SOCIO</h2>
                        <p className="clause">
                            EL SOCIO asume que:
                        </p>
                        <ol style={{ marginLeft: '20px' }}>
                            <li>Participa tanto de las ganancias como de las pérdidas del negocio en proporción a su participación.</li>
                            <li>No puede ceder su participación a terceros sin autorización escrita de LA EMPRESA.</li>
                            <li>Mantendrá confidencialidad sobre la información financiera a la que tenga acceso.</li>
                        </ol>
                    </div>

                    <div className="section">
                        <h2>CLÁUSULA QUINTA: RETIRO DE LA PARTICIPACIÓN</h2>
                        <p className="clause">
                            EL SOCIO podrá solicitar el retiro de su aporte con un preaviso mínimo de 30 días.
                            LA EMPRESA devolverá el capital aportado más/menos el proporcional de las
                            utilidades/pérdidas acumuladas hasta la fecha de retiro.
                        </p>
                    </div>

                    <div className="section">
                        <h2>CLÁUSULA SEXTA: RESOLUCIÓN DE CONTROVERSIAS</h2>
                        <p className="clause">
                            Las partes acuerdan resolver cualquier controversia de manera amigable.
                            De no ser posible, se someterán a la jurisdicción de los jueces del
                            domicilio de LA EMPRESA.
                        </p>
                    </div>

                    {terminos.notas && (
                        <div className="section">
                            <h2>CLÁUSULA SÉPTIMA: CONDICIONES ESPECIALES</h2>
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
                                <em>EL SOCIO</em>
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
