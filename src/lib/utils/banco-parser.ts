/**
 * Utilidades para parseo de extractos bancarios
 * Este archivo se usa en el cliente (no server actions)
 */

export type TipoBanco = 'bcp' | 'interbank' | 'bbva' | 'scotiabank' | 'otro'

/**
 * Parsea una línea de extracto bancario (formato genérico)
 */
export function parsearLineaExtracto(linea: string, _banco: TipoBanco): {
    fecha: string
    descripcion: string
    referencia?: string
    monto: number
} | null {
    // Formato BCP: DD/MM/YYYY | DESCRIPCION | REFERENCIA | MONTO
    // Formato genérico para CSV
    const partes = linea.split(/[,;\t|]/).map(p => p.trim())

    if (partes.length < 3) return null

    try {
        const fecha = partes[0]
        const descripcion = partes[1]
        const monto = parseFloat(partes[partes.length - 1].replace(/[^\d.-]/g, ''))
        const referencia = partes.length > 3 ? partes[2] : undefined

        if (isNaN(monto) || monto <= 0) return null

        // Convertir fecha DD/MM/YYYY a ISO
        const [d, m, y] = fecha.split('/')
        const fechaISO = y && m && d ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : fecha

        return { fecha: fechaISO, descripcion, referencia, monto }
    } catch {
        return null
    }
}
