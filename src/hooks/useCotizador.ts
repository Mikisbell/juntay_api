import { create } from 'zustand'

export type TipoBien = 'ORO' | 'ELECTRO'
export type Quilataje = '10k' | '14k' | '18k' | '21k' | '24k'
export type EstadoElectro = 'NUEVO' | 'BUENO' | 'REGULAR' | 'MALO'
export type FrecuenciaPago = 'DIARIO' | 'SEMANAL' | 'QUINCENAL' | 'TRES_SEMANAS' | 'MENSUAL'

export interface Cuota {
    numero: number
    fecha: Date
    capital: number
    interes: number
    total: number
    saldo: number
}

interface CotizadorState {
    // Paso actual del wizard
    step: number
    setStep: (step: number) => void

    // Datos del Cliente
    cliente: {
        id?: string
        dni: string
        nombres: string
        apellido_paterno: string
        apellido_materno: string
    } | null
    setCliente: (cliente: CotizadorState['cliente']) => void

    // Datos de Tasación
    tipoBien: TipoBien
    setTipoBien: (tipo: TipoBien) => void

    // Datos Oro
    gramaje: number
    quilataje: Quilataje
    precioOroBase: number // Leído de system_settings
    setDatosOro: (gramaje: number, quilataje: Quilataje) => void

    // Datos Electro
    categoria: string
    marca: string
    modelo: string
    estado: EstadoElectro
    valorMercado: number
    setDatosElectro: (datos: {
        categoria: string
        marca: string
        modelo: string
        estado: EstadoElectro
        valorMercado: number
    }) => void

    // Resultados
    valorTasacion: number
    montoPrestamoMaximo: number
    montoPrestamo: number // Lo que el cliente pide
    plazo: number // Días

    // Acciones
    calcularTasacion: () => void
    setMontoPrestamo: (monto: number) => void
    setPlazo: (dias: number) => void

    // Tasa de Interés
    tasaInteres: number // porcentaje mensual (default: 20)
    setTasaInteres: (tasa: number) => void

    // Detalles de la Garantía (Paso 2)
    detallesGarantia: {
        categoria: string // Laptop, Celular, Oro, etc.
        marca: string
        modelo: string
        serie: string // Serie/IMEI
        estado_bien: string // NUEVO, EXCELENTE, BUENO, REGULAR, MALO
        descripcion: string // Descripción adicional
        valorMercado: number
        fotos: string[] // URLs de Supabase Storage
    }
    setDetallesGarantia: (detalles: Partial<CotizadorState['detallesGarantia']>) => void

    // Cronograma de Pagos (Paso 3)
    frecuenciaPago: FrecuenciaPago
    numeroCuotas: number
    fechaInicio: Date | null
    cronograma: Cuota[]
    setFrecuenciaPago: (frecuencia: FrecuenciaPago) => void
    setNumeroCuotas: (numero: number) => void
    setFechaInicio: (fecha: Date) => void
    setCronograma: (cronograma: Cuota[]) => void

    restoreState: (state: Partial<CotizadorState>) => void
    reset: () => void
}

export const useCotizador = create<CotizadorState>((set, get) => ({
    step: 1,
    setStep: (step) => set({ step }),

    cliente: null,
    setCliente: (cliente) => set({ cliente }),

    tipoBien: 'ORO',
    setTipoBien: (tipoBien) => set({ tipoBien }),

    // Oro defaults
    gramaje: 0,
    quilataje: '18k',
    precioOroBase: 280,
    setDatosOro: (gramaje, quilataje) => {
        set({ gramaje, quilataje })
        get().calcularTasacion()
    },

    // Electro defaults
    categoria: '',
    marca: '',
    modelo: '',
    estado: 'BUENO',
    valorMercado: 0,
    setDatosElectro: (datos) => {
        set({ ...datos })
        get().calcularTasacion()
    },

    valorTasacion: 0,
    montoPrestamoMaximo: 0,
    montoPrestamo: 0,
    plazo: 30,

    // Nuevos campos defaults
    tasaInteres: 20, // 20% default
    setTasaInteres: (tasa) => set({ tasaInteres: tasa }),

    detallesGarantia: {
        categoria: '',
        marca: '',
        modelo: '',
        serie: '',
        estado_bien: 'BUENO',
        descripcion: '',
        valorMercado: 0,
        fotos: []
    },
    setDetallesGarantia: (detalles) => set((state) => ({
        detallesGarantia: { ...state.detallesGarantia, ...detalles }
    })),

    frecuenciaPago: 'MENSUAL',
    numeroCuotas: 4,
    fechaInicio: null,
    cronograma: [],
    setFrecuenciaPago: (frecuencia) => set({ frecuenciaPago: frecuencia }),
    setNumeroCuotas: (numero) => set({ numeroCuotas: numero }),
    setFechaInicio: (fecha) => set({ fechaInicio: fecha }),
    setCronograma: (cronograma) => set({ cronograma }),

    calcularTasacion: () => {
        const { tipoBien, gramaje, quilataje, precioOroBase, valorMercado, estado } = get()

        let valor = 0
        let maximo = 0

        if (tipoBien === 'ORO') {
            const factores = {
                '10k': 0.417,
                '14k': 0.585,
                '18k': 0.750,
                '21k': 0.875,
                '24k': 0.999
            }
            const factor = factores[quilataje] || 0
            valor = gramaje * precioOroBase * factor
            maximo = valor * 0.90
        } else {
            const factoresEstado = {
                'NUEVO': 0.85,
                'BUENO': 0.70,
                'REGULAR': 0.50,
                'MALO': 0.30
            }
            const factor = factoresEstado[estado] || 0.30
            valor = valorMercado * factor
            maximo = valor
        }

        set({
            valorTasacion: valor,
            montoPrestamoMaximo: maximo,
            montoPrestamo: maximo
        })
    },

    setMontoPrestamo: (monto) => set({ montoPrestamo: monto }),
    setPlazo: (plazo) => set({ plazo }),

    restoreState: (state) => set((current) => ({ ...current, ...state })),

    reset: () => set({
        step: 1,
        cliente: null,
        tipoBien: 'ORO',
        gramaje: 0,
        quilataje: '18k',
        categoria: '',
        marca: '',
        modelo: '',
        estado: 'BUENO',
        valorMercado: 0,
        valorTasacion: 0,
        montoPrestamoMaximo: 0,
        montoPrestamo: 0,
        plazo: 30,
        tasaInteres: 20,
        detallesGarantia: {
            categoria: '',
            marca: '',
            modelo: '',
            serie: '',
            estado_bien: 'BUENO',
            descripcion: '',
            valorMercado: 0,
            fotos: []
        },
        frecuenciaPago: 'MENSUAL',
        numeroCuotas: 4,
        fechaInicio: null,
        cronograma: []
    })
}))
