import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatearMonto(monto: number | null | undefined): string {
    if (monto === null || monto === undefined) return 'S/ 0.00'
    return `S/ ${monto.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}
