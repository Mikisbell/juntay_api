
/**
 * VOUCHER DE PAGO TÉRMICO 80mm - Para impresora POS
 * Comprobante de pago (Amortización, Renovación, Liquidación)
 */

import { EMPRESA } from './types'
import { formatearSoles } from '@/lib/utils/decimal'

export interface DetallePago {
    id: string
    codigo: string
    concepto: string // 'RENOVACIÓN', 'AMORTIZACIÓN', etc.
    monto: string | number
    saldoAnterior: string | number
    nuevoSaldo: string | number
}

export interface VoucherPagoData {
    clienteNombre: string
    clienteDocumento?: string
    fecha: Date
    usuarioNombre?: string
    cajaId?: string
    items: DetallePago[]
    totalPagado: string | number
}

/**
 * Genera el contenido HTML del voucher de pago
 */
export function generarVoucherPagoHTML(data: VoucherPagoData): string {
    const formatDateTime = (d: Date) => d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    const rowsHtml = data.items.map(item => `
        <div style="margin-bottom: 5px; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">
            <div class="row font-bold">
                <span>${item.codigo}</span>
                <span>${formatearSoles(item.monto)}</span>
            </div>
            <div style="font-size: 8pt; color: #444;">${item.concepto}</div>
            ${item.concepto !== 'LIQUIDACIÓN' ? `
            <div class="row" style="font-size: 8pt;">
                <span>Nuevo Saldo:</span>
                <span>${formatearSoles(item.nuevoSaldo)}</span>
            </div>
            ` : ''}
        </div>
    `).join('')

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Voucher Pago</title>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Courier New', monospace; 
                    font-size: 9pt; 
                    line-height: 1.3;
                    background: #fff;
                    color: #000;
                }
                .ticket {
                    width: 72mm; /* slightly smaller than 80 to be safe */
                    padding: 5px;
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
                .total-box {
                    border-top: 2px solid #000;
                    border-bottom: 2px solid #000;
                    padding: 5px 0;
                    margin: 10px 0;
                    font-size: 12pt;
                    font-weight: bold;
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
                    <div style="font-size: 12pt; font-weight: bold;">${EMPRESA.marca}</div>
                    <div style="font-size: 8pt;">${EMPRESA.nombre}</div>
                    <div style="font-size: 8pt;">RUC: ${EMPRESA.ruc}</div>
                    <div style="font-size: 8pt;">${EMPRESA.direccion}</div>
                    <div style="font-size: 8pt;">Tel: ${EMPRESA.telefono}</div>
                </div>

                <div class="divider"></div>

                <div class="text-center">
                    <div class="font-bold">COMPROBANTE DE PAGO</div>
                    <div style="font-size: 8pt;">${formatDateTime(data.fecha)}</div>
                </div>

                <div class="divider"></div>

                <div style="margin-bottom: 8px;">
                    <div class="row"><span>Cliente:</span><span>${data.clienteNombre}</span></div>
                    ${data.clienteDocumento ? `<div class="row"><span>DNI:</span><span>${data.clienteDocumento}</span></div>` : ''}
                    <div class="row"><span>Cajero:</span><span>${data.usuarioNombre || 'Cajero Turno'}</span></div>
                </div>

                <div class="divider"></div>

                <!-- DETALLE ITEMS -->
                <div style="margin-bottom: 8px;">
                    <div class="font-bold" style="margin-bottom: 5px;">DETALLE DE OPERACIONES:</div>
                    ${rowsHtml}
                </div>

                <!-- TOTALES -->
                <div class="total-box">
                    <div class="row">
                        <span>TOTAL PAGADO:</span>
                        <span>${formatearSoles(data.totalPagado)}</span>
                    </div>
                </div>

                <div class="text-center" style="font-size: 8pt; margin-top: 20px;">
                    <div>Gracias por su preferencia</div>
                    <div>${EMPRESA.web}</div>
                </div>
            </div>
        </body>
        </html>
    `
}

/**
 * Abre la ventana de impresión del voucher
 */
export function imprimirVoucherPago(data: VoucherPagoData) {
    const html = generarVoucherPagoHTML(data)
    const printWindow = window.open('', '_blank', 'width=320,height=600')

    if (!printWindow) {
        alert('Por favor permite las ventanas emergentes para imprimir')
        return
    }

    try {
        printWindow.document.write(html)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
            printWindow.print()
            // Optional: printWindow.close() after print
        }, 500)
    } catch (e) {
        console.error("Error imprimiendo:", e)
        alert("Error al intentar imprimir. Verifique bloqueador de popups.")
    }
}
