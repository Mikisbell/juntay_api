import React from 'react'
import { A4Layout } from './A4Layout'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ContratoLegalProps {
    contratoId: string
    cliente: {
        nombres: string
        apellidos: string
        tipoDocumento: string
        numeroDocumento: string
        direccion?: string
    }
    garantia: {
        descripcion: string
        marca: string
        modelo: string
        serie: string
        estado: string
        valorTasacion: number
    }
    prestamo: {
        monto: number
        tasaInteres: number
        plazo: number
        fechaInicio: Date
        fechaVencimiento: Date
        totalPagar: number
    }
}

export const ContratoLegal = ({
    contratoId,
    cliente,
    garantia,
    prestamo
}: ContratoLegalProps) => {
    const Header = () => (
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold font-serif">JUNTAY</h1>
                <p className="text-sm">Soluciones Financieras</p>
            </div>
            <div className="text-right">
                <p className="font-bold">CONTRATO DE MUTUO CON GARANTÍA MOBILIARIA</p>
                <p className="text-sm">N° {contratoId}</p>
            </div>
        </div>
    )

    const Footer = ({ page }: { page: number }) => (
        <div className="fixed bottom-0 left-0 w-full px-[20mm] pb-[10mm] text-xs text-center border-t pt-2">
            <p>JUNTAY S.A.C. - RUC 20123456789 - Av. Principal 123, Lima</p>
            <p>Página {page} de 4</p>
        </div>
    )

    return (
        <A4Layout>
            {/* PÁGINA 1: RESUMEN Y DATOS */}
            <div className="relative h-full">
                <Header />

                <div className="space-y-6">
                    <section>
                        <h2 className="font-bold border-b mb-2">1. INTERVINIENTES</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-bold">EL ACREEDOR (LA EMPRESA):</p>
                                <p>Razón Social: JUNTAY S.A.C.</p>
                                <p>RUC: 20123456789</p>
                                <p>Dirección: Av. Principal 123, Lima</p>
                            </div>
                            <div>
                                <p className="font-bold">EL DEUDOR (EL CLIENTE):</p>
                                <p>Nombre: {cliente.nombres} {cliente.apellidos}</p>
                                <p>{cliente.tipoDocumento}: {cliente.numeroDocumento}</p>
                                <p>Dirección: {cliente.direccion || 'No registrada'}</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="font-bold border-b mb-2">2. OBJETO DEL CONTRATO</h2>
                        <p className="text-justify text-sm">
                            Por el presente documento, EL ACREEDOR otorga en calidad de préstamo (mutuo) a favor de EL DEUDOR la suma descrita a continuación, y EL DEUDOR constituye primera y preferente garantía mobiliaria sobre el bien descrito en la cláusula tercera.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-bold border-b mb-2">3. DESCRIPCIÓN DE LA GARANTÍA</h2>
                        <table className="w-full text-sm border-collapse border border-gray-300">
                            <tbody>
                                <tr>
                                    <td className="border p-2 font-bold bg-gray-50">Descripción</td>
                                    <td className="border p-2">{garantia.descripcion}</td>
                                </tr>
                                <tr>
                                    <td className="border p-2 font-bold bg-gray-50">Marca / Modelo</td>
                                    <td className="border p-2">{garantia.marca} / {garantia.modelo}</td>
                                </tr>
                                <tr>
                                    <td className="border p-2 font-bold bg-gray-50">Serie / Identificador</td>
                                    <td className="border p-2">{garantia.serie || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td className="border p-2 font-bold bg-gray-50">Estado</td>
                                    <td className="border p-2">{garantia.estado}</td>
                                </tr>
                                <tr>
                                    <td className="border p-2 font-bold bg-gray-50">Valor de Tasación</td>
                                    <td className="border p-2">S/ {garantia.valorTasacion.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section>
                        <h2 className="font-bold border-b mb-2">4. CONDICIONES DEL PRÉSTAMO</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border p-4 rounded bg-gray-50">
                                <p className="text-xs text-gray-500">Monto del Préstamo</p>
                                <p className="text-xl font-bold">S/ {prestamo.monto.toFixed(2)}</p>
                            </div>
                            <div className="border p-4 rounded bg-gray-50">
                                <p className="text-xs text-gray-500">Total a Pagar</p>
                                <p className="text-xl font-bold">S/ {prestamo.totalPagar.toFixed(2)}</p>
                            </div>
                            <div className="border p-4 rounded bg-gray-50">
                                <p className="text-xs text-gray-500">Fecha de Inicio</p>
                                <p className="font-medium">{format(prestamo.fechaInicio, 'dd/MM/yyyy')}</p>
                            </div>
                            <div className="border p-4 rounded bg-gray-50">
                                <p className="text-xs text-gray-500">Fecha de Vencimiento</p>
                                <p className="font-medium">{format(prestamo.fechaVencimiento, 'dd/MM/yyyy')}</p>
                            </div>
                        </div>
                    </section>
                </div>
                <Footer page={1} />
            </div>

            <div className="page-break"></div>

            {/* PÁGINA 2: CRONOGRAMA */}
            <div className="relative h-full">
                <Header />
                <h2 className="font-bold border-b mb-4">ANEXO 1: CRONOGRAMA DE PAGOS</h2>

                <table className="w-full text-sm border-collapse border border-gray-300 mb-8">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">N° Cuota</th>
                            <th className="border p-2">Fecha Vencimiento</th>
                            <th className="border p-2 text-right">Amortización</th>
                            <th className="border p-2 text-right">Interés</th>
                            <th className="border p-2 text-right">Total Cuota</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Ejemplo simplificado de una sola cuota al final para este MVP */}
                        <tr>
                            <td className="border p-2 text-center">1</td>
                            <td className="border p-2 text-center">{format(prestamo.fechaVencimiento, 'dd/MM/yyyy')}</td>
                            <td className="border p-2 text-right">S/ {prestamo.monto.toFixed(2)}</td>
                            <td className="border p-2 text-right">S/ {(prestamo.totalPagar - prestamo.monto).toFixed(2)}</td>
                            <td className="border p-2 text-right font-bold">S/ {prestamo.totalPagar.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="text-sm text-justify space-y-4">
                    <p>
                        <strong>NOTA IMPORTANTE:</strong> El incumplimiento en el pago de las cuotas en las fechas establecidas generará intereses moratorios adicionales según el tarifario vigente, sin perjuicio de la ejecución de la garantía mobiliaria.
                    </p>
                </div>
                <Footer page={2} />
            </div>

            <div className="page-break"></div>

            {/* PÁGINA 3: CLÁUSULAS */}
            <div className="relative h-full">
                <Header />
                <h2 className="font-bold border-b mb-4">CLÁUSULAS GENERALES DE CONTRATACIÓN</h2>

                <div className="text-xs text-justify space-y-2 columns-2 gap-8">
                    <p><strong>PRIMERA: DEL MUTUO.</strong> EL ACREEDOR entrega a EL DEUDOR la suma de dinero indicada en las condiciones particulares, quien declara recibirla a su entera satisfacción.</p>

                    <p><strong>SEGUNDA: DE LA GARANTÍA.</strong> Para garantizar el cumplimiento de la obligación, EL DEUDOR constituye garantía mobiliaria sobre el bien descrito, entregándolo en custodia a EL ACREEDOR (desplazamiento).</p>

                    <p><strong>TERCERA: DEL PLAZO.</strong> El plazo del préstamo es forzoso para EL DEUDOR. El pago deberá realizarse en la fecha de vencimiento indicada.</p>

                    <p><strong>CUARTA: DE LOS INTERESES.</strong> El préstamo devengará intereses compensatorios a la tasa pactada. En caso de mora, se aplicarán intereses moratorios.</p>

                    <p><strong>QUINTA: DE LA EJECUCIÓN.</strong> En caso de incumplimiento de pago al vencimiento, EL ACREEDOR queda facultado para proceder a la venta extrajudicial del bien otorgado en garantía, conforme a la Ley de Garantía Mobiliaria.</p>

                    <p><strong>SEXTA: DE LA CUSTODIA.</strong> EL ACREEDOR se obliga a custodiar el bien con la diligencia ordinaria. No responde por deterioro natural o caso fortuito.</p>

                    <p><strong>SÉPTIMA: DOMICILIO.</strong> Las partes señalan como sus domicilios los indicados en la introducción. Cualquier cambio deberá ser comunicado por conducto notarial.</p>

                    <p><strong>OCTAVA: JURISDICCIÓN.</strong> Para todo lo relacionado con este contrato, las partes se someten a la competencia de los jueces y tribunales del distrito judicial de Lima.</p>
                </div>
                <Footer page={3} />
            </div>

            <div className="page-break"></div>

            {/* PÁGINA 4: FIRMAS */}
            <div className="relative h-full flex flex-col justify-between">
                <div>
                    <Header />
                    <h2 className="font-bold border-b mb-8">SUSCRIPCIÓN DEL CONTRATO</h2>
                    <p className="text-sm text-justify mb-12">
                        Leído el presente contrato y estando las partes conformes con su contenido, lo firman en señal de aceptación en la ciudad de Lima, el día {format(new Date(), 'dd', { locale: es })} de {format(new Date(), 'MMMM', { locale: es })} del {format(new Date(), 'yyyy')}.
                    </p>

                    <div className="grid grid-cols-2 gap-16 mt-20">
                        <div className="text-center">
                            <div className="border-t border-black w-3/4 mx-auto mb-2"></div>
                            <p className="font-bold">JUNTAY S.A.C.</p>
                            <p className="text-xs">EL ACREEDOR</p>
                        </div>

                        <div className="text-center">
                            <div className="border-t border-black w-3/4 mx-auto mb-2"></div>
                            <p className="font-bold">{cliente.nombres} {cliente.apellidos}</p>
                            <p className="text-xs">EL DEUDOR</p>
                            <p className="text-xs">{cliente.tipoDocumento}: {cliente.numeroDocumento}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-32 flex justify-center">
                    <div className="border border-black w-32 h-40 flex items-center justify-center text-xs text-gray-400">
                        Huella Digital
                    </div>
                </div>

                <Footer page={4} />
            </div>
        </A4Layout>
    )
}
