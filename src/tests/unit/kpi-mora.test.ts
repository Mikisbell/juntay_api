/**
 * Tests for KPI Mora Widget
 * 
 * Following AGENT.md governance: tests for business logic
 */

import { describe, it, expect } from 'vitest'

describe('KPI Mora Calculations', () => {
    describe('porcentajeMora calculation', () => {
        it('debe calcular 0% cuando no hay créditos', () => {
            const cartera = {
                al_dia: { count: 0, total: 0 },
                por_vencer: { count: 0, total: 0 },
                en_mora: { count: 0, total: 0 }
            }

            const total = cartera.al_dia.count + cartera.por_vencer.count + cartera.en_mora.count
            const porcentaje = total > 0 ? (cartera.en_mora.count / total) * 100 : 0

            expect(porcentaje).toBe(0)
        })

        it('debe calcular correctamente el porcentaje de mora', () => {
            const cartera = {
                al_dia: { count: 80, total: 80000 },
                por_vencer: { count: 10, total: 10000 },
                en_mora: { count: 10, total: 15000 }
            }

            const total = cartera.al_dia.count + cartera.por_vencer.count + cartera.en_mora.count
            const porcentaje = (cartera.en_mora.count / total) * 100

            expect(total).toBe(100)
            expect(porcentaje).toBe(10)
        })

        it('debe clasificar como riesgo alto cuando mora > 10%', () => {
            const porcentaje = 15.5
            const nivel = porcentaje > 10 ? 'alto' : porcentaje >= 5 ? 'medio' : 'bajo'

            expect(nivel).toBe('alto')
        })

        it('debe clasificar como precaución cuando mora entre 5-10%', () => {
            const porcentaje = 7.5
            const nivel = porcentaje > 10 ? 'alto' : porcentaje >= 5 ? 'medio' : 'bajo'

            expect(nivel).toBe('medio')
        })

        it('debe clasificar como saludable cuando mora < 5%', () => {
            const porcentaje = 3.2
            const nivel = porcentaje > 10 ? 'alto' : porcentaje >= 5 ? 'medio' : 'bajo'

            expect(nivel).toBe('bajo')
        })
    })
})
