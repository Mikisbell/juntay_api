/**
 * Hooks de RxDB - Exportación centralizada
 * 
 * @example
 * import { useCreditosLocales, useRegistrarPagoLocal, useRxDB } from '@/lib/rxdb/hooks'
 */

// Re-exportar hook del provider
export { useRxDB } from '@/components/providers/RxDBProvider'

// Hooks de créditos
export {
    useCreditosLocales,
    useCrearCreditoLocal,
    useCreditoPorCodigo,
    useCreditosVigentes
} from './useCreditos'

// Hooks de pagos
export {
    usePagosDeCredito,
    useRegistrarPagoLocal,
    usePagosDelDia,
    usePagosPendientes
} from './usePagos'

// Hooks de caja
export {
    useMovimientosCaja,
    useRegistrarMovimientoLocal,
    useResumenCajaHoy
} from './useCaja'
