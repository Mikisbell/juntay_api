'use client'

import { useState, useCallback } from 'react'
import {
    TipoInteres,
    FrecuenciaCapitalizacion,
    calcularInteresCompuesto,
    calcularInteresSimple
} from '@/lib/utils/rendimientos-inversionista'

// ============================================================================
// TYPES
// ============================================================================

export type TipoRelacion = 'SOCIO' | 'PRESTAMISTA'
export type ModalidadPago = 'BULLET' | 'INTERES_MENSUAL' | 'AMORTIZABLE'
export type MedioPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'YAPE_PLIN'
export type OrigenFondos = 'AHORROS' | 'NEGOCIO' | 'VENTA_BIENES' | 'HERENCIA' | 'OTRO'

export interface PersonaSeleccionada {
    id: string
    nombres: string
    apellidos: string
    dni: string
    esNueva: boolean
}

export interface DatosIdentificacion {
    persona: PersonaSeleccionada | null
    telefono: string
    email: string
    origenFondos: OrigenFondos | ''
    ocupacion: string
}

export interface DatosTerminos {
    tipoRelacion: TipoRelacion
    monto: number
    // SOCIO
    porcentaje: number
    frecuenciaDividendos: 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL'
    // PRESTAMISTA
    tasaInteres: number
    tipoTasa: 'ANUAL' | 'MENSUAL'
    tipoInteres: TipoInteres
    frecuenciaCapitalizacion: FrecuenciaCapitalizacion
    plazoMeses: number
    modalidadPago: ModalidadPago
    diaPago: number
    frecuenciaPago: 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL'
}

export interface DatosDeposito {
    fechaDeposito: string
    medioPago: MedioPago | ''
    bancoOrigen: string
    numeroOperacion: string
    tieneCuentaBancaria: boolean
    banco: string
    numeroCuenta: string
    cci: string
    cuentaDestinoId: string
    registrarIngreso: boolean
    referenciaIngreso: string
}

export interface InversionistaFormData {
    identificacion: DatosIdentificacion
    terminos: DatosTerminos
    deposito: DatosDeposito
    notas: string
}

export interface CalculoRendimiento {
    interesSimple: number
    interesCompuesto: number
    interesAplicado: number
    totalDevolver: number
    fechaVencimiento: string
    diferencia: number
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialIdentificacion: DatosIdentificacion = {
    persona: null,
    telefono: '',
    email: '',
    origenFondos: '',
    ocupacion: ''
}

const initialTerminos: DatosTerminos = {
    tipoRelacion: 'PRESTAMISTA',
    monto: 0,
    porcentaje: 0,
    frecuenciaDividendos: 'MENSUAL',
    tasaInteres: 10, // 10% default
    tipoTasa: 'ANUAL',
    tipoInteres: 'SIMPLE',
    frecuenciaCapitalizacion: 'MENSUAL',
    plazoMeses: 12,
    modalidadPago: 'BULLET',
    diaPago: 1,
    frecuenciaPago: 'MENSUAL'
}

const initialDeposito: DatosDeposito = {
    fechaDeposito: new Date().toISOString().split('T')[0],
    medioPago: '',
    bancoOrigen: '',
    numeroOperacion: '',
    tieneCuentaBancaria: false,
    banco: '',
    numeroCuenta: '',
    cci: '',
    cuentaDestinoId: '',
    registrarIngreso: true,
    referenciaIngreso: ''
}

// ============================================================================
// HOOK
// ============================================================================

export function useInversionistaForm(initialData?: Partial<InversionistaFormData>) {
    const [identificacion, setIdentificacion] = useState<DatosIdentificacion>({
        ...initialIdentificacion,
        ...initialData?.identificacion
    })

    const [terminos, setTerminos] = useState<DatosTerminos>({
        ...initialTerminos,
        ...initialData?.terminos
    })

    const [deposito, setDeposito] = useState<DatosDeposito>({
        ...initialDeposito,
        ...initialData?.deposito
    })

    const [notas, setNotas] = useState(initialData?.notas || '')
    const [step, setStep] = useState(1)

    // ========== CALCULATIONS ==========

    const calcularRendimiento = useCallback((): CalculoRendimiento | null => {
        if (terminos.monto <= 0 || terminos.plazoMeses <= 0) return null

        const tasaAnual = terminos.tipoTasa === 'MENSUAL'
            ? terminos.tasaInteres * 12
            : terminos.tasaInteres

        const resultado = calcularInteresCompuesto({
            capital: terminos.monto,
            tasaAnual,
            meses: terminos.plazoMeses,
            capitalizacion: terminos.frecuenciaCapitalizacion
        })

        const interesAplicado = terminos.tipoInteres === 'COMPUESTO'
            ? resultado.interesCompuesto
            : resultado.interesSimple

        const fechaVencimiento = new Date(deposito.fechaDeposito)
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + terminos.plazoMeses)

        return {
            interesSimple: resultado.interesSimple,
            interesCompuesto: resultado.interesCompuesto,
            interesAplicado,
            totalDevolver: terminos.monto + interesAplicado,
            fechaVencimiento: fechaVencimiento.toLocaleDateString('es-PE'),
            diferencia: resultado.diferencia
        }
    }, [terminos, deposito.fechaDeposito])

    // ========== VALIDATIONS ==========

    const validarStep1 = useCallback((): boolean => {
        return (
            identificacion.persona !== null &&
            identificacion.telefono.length >= 9 &&
            identificacion.origenFondos !== ''
        )
    }, [identificacion])

    const validarStep2 = useCallback((): boolean => {
        if (terminos.monto <= 0) return false

        if (terminos.tipoRelacion === 'SOCIO') {
            return terminos.porcentaje > 0 && terminos.porcentaje <= 100
        }

        return (
            terminos.tasaInteres > 0 &&
            terminos.plazoMeses > 0
        )
    }, [terminos])

    const validarStep3 = useCallback((): boolean => {
        if (deposito.medioPago === '') return false

        if (deposito.medioPago === 'TRANSFERENCIA' && !deposito.numeroOperacion) {
            return false
        }

        return true
    }, [deposito])

    const puedeAvanzar = useCallback((stepActual: number): boolean => {
        switch (stepActual) {
            case 1: return validarStep1()
            case 2: return validarStep2()
            case 3: return validarStep3()
            default: return true
        }
    }, [validarStep1, validarStep2, validarStep3])

    // ========== NAVIGATION ==========

    const siguiente = useCallback(() => {
        if (puedeAvanzar(step) && step < 4) {
            setStep(step + 1)
        }
    }, [step, puedeAvanzar])

    const anterior = useCallback(() => {
        if (step > 1) {
            setStep(step - 1)
        }
    }, [step])

    const irAStep = useCallback((nuevoStep: number) => {
        if (nuevoStep >= 1 && nuevoStep <= 4) {
            setStep(nuevoStep)
        }
    }, [])

    // ========== FORM DATA ==========

    const getFormData = useCallback((): InversionistaFormData => ({
        identificacion,
        terminos,
        deposito,
        notas
    }), [identificacion, terminos, deposito, notas])

    const reset = useCallback(() => {
        setIdentificacion(initialIdentificacion)
        setTerminos(initialTerminos)
        setDeposito(initialDeposito)
        setNotas('')
        setStep(1)
    }, [])

    return {
        // State
        identificacion,
        terminos,
        deposito,
        notas,
        step,

        // Setters
        setIdentificacion,
        setTerminos,
        setDeposito,
        setNotas,

        // Calculations
        calcularRendimiento,

        // Navigation
        siguiente,
        anterior,
        irAStep,
        puedeAvanzar,

        // Form
        getFormData,
        reset
    }
}

export type UseInversionistaFormReturn = ReturnType<typeof useInversionistaForm>
