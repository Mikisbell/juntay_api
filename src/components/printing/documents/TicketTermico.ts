/**
 * TICKET TÉRMICO 80mm - Para impresora POS
 * Comprobante de empeño para el cliente
 */

import { PrintData, EMPRESA, calcularFinancieros } from './types'

/**
 * Genera el contenido HTML del ticket térmico para impresión
 */
export function generarTicketTermicoHTML(data: PrintData): string {
    const { fechaHoy, fechaVencimiento, monto, interes, totalPagar } = calcularFinancieros(data)

    const formatDate = (d: Date) => d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const formatDateTime = (d: Date) => d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ticket ${data.codigo}</title>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Courier New', monospace; 
                    font-size: 10pt; 
                    line-height: 1.4;
                    background: #fff;
                }
                .ticket {
                    width: 80mm;
                    padding: 10px;
                    margin: 0 auto;
                }
                .divider {
                    border-bottom: 1px dashed #000;
                    margin: 8px 0;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .row {
                    display: flex;
                    justify-content: space-between;
                }
                .vencimiento-box {
                    border: 1px solid #000;
                    padding: 10px;
                    text-align: center;
                }
                .legal {
                    font-size: 8pt;
                    text-align: justify;
                    margin: 10px 0;
                }
                .firma {
                    text-align: center;
                    margin-top: 30px;
                }
                .firma-line {
                    border-top: 1px solid #000;
                    width: 60%;
                    margin: 0 auto;
                }
                @media print {
                    @page { size: 80mm auto; margin: 0; }
                    body { width: 80mm; }
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <!-- ENCABEZADO -->
                <div class="text-center" style="margin-bottom: 10px;">
                    <div style="font-size: 14pt; font-weight: bold;">${EMPRESA.marca} EMPEÑOS</div>
                    <div style="font-size: 9pt;">${EMPRESA.nombre}</div>
                    <div>RUC: ${EMPRESA.ruc}</div>
                    <div>${EMPRESA.direccion}</div>
                    <div>Tel: ${EMPRESA.telefono}</div>
                </div>

                <div class="divider"></div>

                <div class="text-center">
                    <div class="font-bold">CONTRATO DE PRENDA</div>
                    <div style="font-size: 12pt; font-weight: bold;">#${data.codigo || 'PENDIENTE'}</div>
                </div>

                <div class="divider"></div>

                <!-- DATOS OPERACIÓN -->
                <div style="margin-bottom: 8px;">
                    <div class="row"><span>Fecha:</span><span>${formatDateTime(fechaHoy)}</span></div>
                    <div class="row"><span>Cliente:</span><span>${data.clienteNombre || data.cliente || '---'}</span></div>
                    <div class="row"><span>DNI:</span><span>${data.clienteDocumento || '--------'}</span></div>
                </div>

                <div class="divider"></div>

                <!-- ARTÍCULO -->
                <div style="margin-bottom: 8px;">
                    <div class="font-bold">ARTÍCULO:</div>
                    <div style="padding-left: 5px;">${data.garantiaDescripcion || data.descripcion || 'Según contrato'}</div>
                </div>

                <div class="divider"></div>

                <!-- MONTOS -->
                <div style="margin-bottom: 8px;">
                    <div class="row font-bold">
                        <span>PRÉSTAMO:</span>
                        <span>S/ ${monto.toFixed(2)}</span>
                    </div>
                    <div class="row">
                        <span>Interés (${data.tasaInteres || 20}%):</span>
                        <span>S/ ${interes.toFixed(2)}</span>
                    </div>
                    <div class="row" style="font-weight: bold; font-size: 12pt; border-top: 1px solid #000; margin-top: 5px; padding-top: 5px;">
                        <span>TOTAL A PAGAR:</span>
                        <span>S/ ${totalPagar.toFixed(2)}</span>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- VENCIMIENTO -->
                <div class="vencimiento-box" style="margin-bottom: 8px;">
                    <div class="font-bold">VENCE:</div>
                    <div style="font-size: 14pt; font-weight: bold;">${formatDate(fechaVencimiento)}</div>
                </div>

                <!-- LEGAL -->
                <div class="legal">
                    Declaro ser propietario del bien empeñado. Pasada la fecha de vencimiento sin renovación, la prenda pasará a proceso de remate según ley.
                </div>

                <!-- FIRMA -->
                <div class="firma">
                    <div class="firma-line"></div>
                    <div>Firma del Cliente</div>
                </div>

                <div class="divider"></div>

                <div class="text-center" style="font-size: 8pt;">
                    <div>*** CONSERVE ESTE DOCUMENTO ***</div>
                    <div>Es requerido para recoger su prenda</div>
                    <div style="margin-top: 5px;">${EMPRESA.web}</div>
                </div>
            </div>
        </body>
        </html>
    `
}

/**
 * Abre la ventana de impresión del ticket
 */
export function imprimirTicketTermico(data: PrintData) {
    const html = generarTicketTermicoHTML(data)
    const printWindow = window.open('', '_blank', 'width=320,height=600')

    if (!printWindow) {
        alert('Por favor permite las ventanas emergentes para imprimir')
        return
    }

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print() }, 500)
}
