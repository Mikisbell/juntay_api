/**
 * PAGARÉ INCOMPLETO - Documento Legal
 * Conforme a Ley N° 27287 - Ley de Títulos Valores (Art. 10)
 * 
 * Documento anexo al Contrato de Mutuo que permite ejecución
 * directa en caso de incumplimiento.
 */

import { PrintData, EMPRESA, calcularFinancieros } from './types'

/**
 * Genera el contenido HTML del pagaré para impresión
 */
export function generarPagareHTML(data: PrintData): string {
    const { fechaHoy, fechaVencimiento, tasaMensual, monto, interes, totalPagar } = calcularFinancieros(data)

    const formatDate = (d: Date) => d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const formatDateLong = (d: Date) => d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Pagaré ${data.codigo}</title>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Times New Roman', Times, serif; 
                    font-size: 11pt; 
                    line-height: 1.5; 
                    padding: 20mm; 
                }
                .pagare { 
                    max-width: 180mm; 
                    margin: 0 auto; 
                    border: 2px solid #333; 
                    padding: 20px; 
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 20px; 
                    padding-bottom: 15px; 
                    border-bottom: 1px solid #999; 
                }
                .title { 
                    font-size: 18pt; 
                    font-weight: bold; 
                    letter-spacing: 2px; 
                }
                .subtitle { 
                    font-size: 10pt; 
                    color: #666; 
                    margin-top: 5px; 
                }
                .contract-ref { 
                    font-size: 11pt; 
                    font-weight: bold; 
                    margin-top: 10px; 
                }
                .section { 
                    margin-bottom: 15px; 
                }
                .section-title { 
                    font-weight: bold; 
                    font-size: 10pt; 
                    background: #f0f0f0; 
                    padding: 5px 10px; 
                    margin-bottom: 10px; 
                }
                .info-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                }
                .info-table td { 
                    padding: 5px 0; 
                    vertical-align: top; 
                }
                .info-table .label { 
                    width: 40%; 
                    font-weight: bold; 
                }
                .body-text { 
                    text-align: justify; 
                    margin-bottom: 10px; 
                }
                .authorization { 
                    background: #fffef0; 
                    border: 1px solid #e0d080; 
                    padding: 15px; 
                }
                .authorization ul { 
                    margin-left: 20px; 
                    margin-bottom: 10px; 
                }
                .authorization li { 
                    margin-bottom: 3px; 
                }
                .signatures { 
                    display: flex; 
                    justify-content: space-around; 
                    margin-top: 30px; 
                    padding-top: 20px; 
                }
                .signature-box { 
                    text-align: center; 
                    width: 45%; 
                }
                .signature-line { 
                    border-top: 1px solid #000; 
                    width: 80%; 
                    margin: 0 auto 10px auto; 
                }
                .signature-name { 
                    font-weight: bold; 
                    font-size: 10pt; 
                }
                .signature-doc { 
                    font-size: 9pt; 
                }
                .signature-label { 
                    font-size: 9pt; 
                    margin-top: 5px; 
                    color: #666; 
                }
                .fingerprint-box { 
                    text-align: center; 
                    width: 25%; 
                }
                .fingerprint { 
                    border: 1px solid #000; 
                    width: 60px; 
                    height: 80px; 
                    margin: 0 auto; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 8pt; 
                }
                .fingerprint-label { 
                    font-size: 8pt; 
                    margin-top: 5px; 
                }
                .receipt { 
                    margin-top: 20px; 
                    padding: 10px; 
                    border: 1px dashed #999; 
                    font-size: 10pt; 
                }
                .footer { 
                    margin-top: 20px; 
                    text-align: center; 
                    font-size: 9pt; 
                    color: #666; 
                    border-top: 1px solid #ccc; 
                    padding-top: 10px; 
                }
                @media print { 
                    body { padding: 10mm; } 
                    .pagare { border: 1px solid #000; } 
                }
            </style>
        </head>
        <body>
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
                            <td><strong>${formatDateLong(fechaVencimiento)}</strong></td>
                        </tr>
                        <tr>
                            <td class="label">Por la suma de:</td>
                            <td><strong>S/ ${totalPagar.toFixed(2)}</strong> (${monto.toFixed(2)} capital + ${interes.toFixed(2)} interés)</td>
                        </tr>
                    </table>
                </div>

                <div class="section">
                    <p class="body-text">
                        <strong>DEBO(EMOS) Y PAGARÉ(MOS) INCONDICIONALMENTE</strong> a la orden de 
                        <strong>${EMPRESA.nombre}</strong>, con RUC N° ${EMPRESA.ruc}, 
                        domiciliado en ${EMPRESA.direccion}, la cantidad arriba indicada.
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
                        <strong>AUTORIZO EXPRESAMENTE</strong> a ${EMPRESA.nombre} (marca ${EMPRESA.marca}) a completar este pagaré 
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
                    <p>${EMPRESA.marca} - Marca de ${EMPRESA.nombre} - RUC ${EMPRESA.ruc}</p>
                    <p>${EMPRESA.direccion}</p>
                </div>
            </div>
        </body>
        </html>
    `
}

/**
 * Abre la ventana de impresión del pagaré
 */
export function imprimirPagare(data: PrintData) {
    const html = generarPagareHTML(data)
    const printWindow = window.open('', '_blank', 'width=800,height=600')

    if (!printWindow) {
        alert('Por favor permite las ventanas emergentes para imprimir')
        return
    }

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print() }, 500)
}
