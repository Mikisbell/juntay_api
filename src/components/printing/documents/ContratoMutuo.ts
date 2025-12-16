/**
 * CONTRATO DE MUTUO PRENDARIO - Documento Legal A4
 * Conforme a normativa peruana (Ley de Garantía Mobiliaria - Ley N° 28677)
 * 
 * Este archivo contiene TODO el contrato legal en un solo lugar
 * para facilitar auditorías legales y actualizaciones regulatorias.
 */

import { PrintData, EMPRESA, calcularFinancieros } from './types'

interface ContratoMutuoProps {
    data: PrintData
}

/**
 * Genera el contenido HTML del contrato completo para impresión
 */
export function generarContratoMutuoHTML(data: PrintData): string {
    const { fechaHoy, fechaVencimiento, tasaMensual, monto, interes, totalPagar } = calcularFinancieros(data)

    const formatDate = (d: Date) => d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const formatDateLong = (d: Date) => d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })

    // Tasas proporcionales por semana
    const tasaSemana1 = tasaMensual * 0.25
    const tasaSemana2 = tasaMensual * 0.50
    const tasaSemana3 = tasaMensual * 0.75
    const montoMaximoGarantizado = totalPagar * 1.3 // Capital + intereses + costos ejecución

    // Fechas de semanas
    const fechaSem1 = new Date(fechaHoy.getTime() + 7 * 24 * 60 * 60 * 1000)
    const fechaSem2 = new Date(fechaHoy.getTime() + 14 * 24 * 60 * 60 * 1000)
    const fechaSem3 = new Date(fechaHoy.getTime() + 21 * 24 * 60 * 60 * 1000)

    return `
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
            <div class="contract">
                <!-- ENCABEZADO -->
                <div class="header">
                    <div>
                        <div style="font-size: 22pt; font-weight: bold; color: #1e40af;">${EMPRESA.marca}</div>
                        <div style="font-size: 10pt;">Marca de ${EMPRESA.nombre}</div>
                        <div style="font-size: 9pt; color: #666;">RUC: ${EMPRESA.ruc}</div>
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
                    Conste por el presente documento privado, el contrato de mutuo dinerario con constitución de garantía prendaria, que celebran de una parte <strong>${EMPRESA.nombre}</strong>, con RUC N° ${EMPRESA.ruc}, con domicilio en ${EMPRESA.direccion}, operando bajo la marca comercial "${EMPRESA.marca}", a quien en adelante se denominará <strong>"EL ACREEDOR"</strong>; y de la otra parte <strong>${data.clienteNombre || data.cliente || '_________________'}</strong>, identificado(a) con DNI N° ${data.clienteDocumento || '________'}, domiciliado(a) en ${data.clienteDireccion || 'según ficha de registro'}, a quien en adelante se denominará <strong>"EL DEUDOR"</strong>.
                </p>

                <!-- CLÁUSULA PRIMERA: MONTO -->
                <div class="section">
                    <div class="section-title">CLÁUSULA PRIMERA: OBJETO Y MONTO (Art. 32 Ley 28677)</div>
                    <p>EL ACREEDOR otorga a EL DEUDOR un préstamo de dinero, constituyéndose GARANTÍA PRENDARIA CON DESPLAZAMIENTO sobre el bien descrito en la Cláusula Segunda.</p>
                    <table class="data-table">
                        <tr><td class="label">MONTO DEL PRÉSTAMO</td><td class="value"><strong>S/ ${monto.toFixed(2)}</strong></td></tr>
                        <tr><td class="label">Tasa de Interés Mensual</td><td class="value">${tasaMensual}%</td></tr>
                        <tr><td class="label">Interés del Período (30 días)</td><td class="value">S/ ${interes.toFixed(2)}</td></tr>
                        <tr><td class="label">TOTAL A PAGAR AL VENCIMIENTO</td><td class="value"><strong>S/ ${totalPagar.toFixed(2)}</strong></td></tr>
                        <tr><td class="label">Monto Máximo Garantizado</td><td class="value">S/ ${montoMaximoGarantizado.toFixed(2)}</td></tr>
                    </table>
                </div>

                <!-- CLÁUSULA SEGUNDA: GARANTÍA -->
                <div class="section">
                    <div class="section-title">CLÁUSULA SEGUNDA: BIEN EN GARANTÍA (Art. 32 inc. 3 Ley 28677)</div>
                    <div class="box">${data.garantiaDescripcion || data.descripcion || 'Según detalle en ficha de registro'}</div>
                    <table class="data-table" style="margin-top: 8px;">
                        <tr><td class="label">Valor de Tasación</td><td class="value">S/ ${(data.valorTasacion || monto).toFixed(2)}</td></tr>
                        <tr><td class="label">Estado</td><td class="value">${data.garantiaEstado || 'Operativo'}</td></tr>
                        <tr><td class="label">Ubicación del Bien</td><td class="value">Custodia de ${EMPRESA.marca} - ${EMPRESA.direccion}</td></tr>
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

                <!-- CLÁUSULA TERCERA: PLAZO Y CRONOGRAMA -->
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
                                <td>S/ ${interes.toFixed(2)}</td>
                                <td style="font-weight: bold; color: #dc2626;">S/ ${totalPagar.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- CLÁUSULAS LEGALES -->
                <div class="legal-columns">
                    <div class="section-title" style="column-span: all;">CLÁUSULAS LEGALES</div>
                    
                    <p><strong>CUARTA - MORA AUTOMÁTICA:</strong> Conforme al Art. 1333° del Código Civil, la mora opera de pleno derecho desde el día siguiente al vencimiento, sin necesidad de requerimiento. Interés moratorio: 0.3% diario adicional.</p>
                    
                    <p><strong>QUINTA - VENTA EXTRAJUDICIAL (Art. 47 Ley 28677):</strong> EL DEUDOR autoriza expresamente a EL ACREEDOR para la venta directa del bien sin intervención judicial. Transcurridos 7 días calendario desde el vencimiento sin pago, se procederá a la venta. Del precio se descontarán capital, intereses y gastos; el remanente quedará a disposición de EL DEUDOR por 30 días.</p>
                    
                    <p><strong>SEXTA - DECLARACIONES:</strong> EL DEUDOR declara que la información proporcionada es veraz, que no está en insolvencia, y que ha leído y comprendido este contrato.</p>
                    
                    <p><strong>SÉPTIMA - VENCIMIENTO ANTICIPADO:</strong> EL ACREEDOR podrá exigir pago inmediato si: (a) la información proporcionada es falsa, (b) el bien tiene gravámenes ocultos, o (c) EL DEUDOR es declarado insolvente.</p>
                    
                    <p><strong>OCTAVA - CUSTODIA:</strong> EL ACREEDOR custodiará el bien con diligencia ordinaria. No responde por deterioro natural ni caso fortuito.</p>
                    
                    <p><strong>NOVENA - COMPETENCIA:</strong> Las partes se someten a los Jueces de Huancayo. EL DEUDOR renuncia al fuero de su domicilio.</p>
                    
                    <p><strong>DÉCIMA - PAGARÉ:</strong> EL DEUDOR suscribe pagaré incompleto (Art. 10 Ley 27287), autorizando a EL ACREEDOR a completarlo con el monto adeudado en caso de incumplimiento.</p>
                    
                    <p><strong>UNDÉCIMA - AUTORIZACIÓN DE COMUNICACIONES:</strong> EL DEUDOR autoriza expresamente a EL ACREEDOR a enviarle recordatorios de pago, notificaciones de vencimiento y comunicaciones relacionadas al presente contrato, a través de: (a) mensajes de texto SMS, (b) mensajes de WhatsApp, (c) llamadas telefónicas, y (d) correo electrónico, a los datos de contacto proporcionados en su ficha de registro. Esta autorización es voluntaria y puede ser revocada mediante comunicación escrita.</p>
                </div>

                <!-- FIRMAS -->
                <p style="text-align: center; font-size: 9pt; margin-top: 20px;">
                    Leído el presente contrato, las partes lo suscriben en Huancayo, el ${formatDateLong(fechaHoy)}.
                </p>

                <div class="signatures">
                    <div>
                        <div class="signature-line"></div>
                        <div style="font-weight: bold;">${EMPRESA.nombre}</div>
                        <div style="font-size: 9pt;">Marca: ${EMPRESA.marca}</div>
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

                <!-- PIE DE PÁGINA -->
                <div class="footer-with-qr">
                    <div class="qr-section">
                        <img src="https://chart.googleapis.com/chart?cht=qr&chs=80x80&chl=JUNTAY-${data.codigo || 'PENDIENTE'}" alt="QR Contrato" />
                        <div class="qr-label">Escanea para verificar</div>
                    </div>
                    <div class="footer-text">
                        <p><strong>${EMPRESA.marca}</strong> - Marca de ${EMPRESA.nombre}</p>
                        <p>RUC ${EMPRESA.ruc} | ${EMPRESA.direccion}</p>
                        <p style="font-size: 7pt;">Libro de Reclamaciones disponible | Contrato N° ${data.codigo || 'PENDIENTE'}</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `
}

/**
 * Abre la ventana de impresión del contrato
 */
export function imprimirContratoMutuo(data: PrintData) {
    const html = generarContratoMutuoHTML(data)
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
