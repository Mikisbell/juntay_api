"use client"

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, Eraser } from 'lucide-react'
import { toast } from 'sonner'

interface SmartPasteInputProps {
    onDataExtracted: (data: {
        dni?: string
        celular?: string
        nombres?: string
    }) => void
}

export function SmartPasteInput({ onDataExtracted }: SmartPasteInputProps) {
    const [text, setText] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)

    const handleProcess = () => {
        if (!text.trim()) return

        let dni = ''
        let celular = ''
        let nombres = ''

        // 1. Extraer DNI (8 dígitos)
        const dniMatch = text.match(/\b\d{8}\b/)
        if (dniMatch) {
            dni = dniMatch[0]
        }

        // 2. Extraer Celular (9 dígitos empezando con 9)
        // A veces vienen con espacios: 999 888 777
        const cleanText = text.replace(/\s+/g, ' ')
        const celularMatch = cleanText.replace(/\s/g, '').match(/\b9\d{8}\b/)
        if (celularMatch) {
            celular = celularMatch[0]
        }

        // 3. Extraer Nombres (Heurística simple: Todo lo que no sea número ni etiquetas comunes)
        // Eliminamos DNI y Celular del texto original para ver qué queda
        let remainingText = text
        if (dni) remainingText = remainingText.replace(dni, '')
        if (celular) {
            // Intentar remover el celular con sus espacios originales si es posible, sino el limpio
            // Esta parte es truculenta, simplificamos:
            // Simplemente quitamos secuencias de dígitos largos
            remainingText = remainingText.replace(/\b9[\d\s]{8,}\b/g, '')
        }

        // Limpiar etiquetas comunes (DNI:, Cel:, Nombre:, etc)
        remainingText = remainingText
            .replace(/DNI:?/gi, '')
            .replace(/CEL:?/gi, '')
            .replace(/CELULAR:?/gi, '')
            .replace(/NOMBRE:?/gi, '')
            .replace(/CLIENTE:?/gi, '')
            .replace(/[-_]/g, ' ')
            .trim()

        // Lo que queda asumimos que es el nombre, limpiando caracteres extraños
        nombres = remainingText.replace(/\s+/g, ' ').trim()

        if (!dni && !celular && !nombres) {
            toast.error('No se pudo extraer información válida')
            return
        }

        onDataExtracted({
            dni: dni || undefined,
            celular: celular || undefined,
            nombres: nombres || undefined
        })

        toast.success('Datos extraídos correctamente')
        setText('')
        setIsExpanded(false)
    }

    if (!isExpanded) {
        return (
            <Button
                variant="outline"
                className="w-full border-dashed border-2 border-slate-300 text-slate-500 hover:border-blue-500 hover:text-blue-600 h-12"
                onClick={() => setIsExpanded(true)}
            >
                <Sparkles className="mr-2 h-4 w-4" />
                Smart Paste AI (Pegar datos de WhatsApp)
            </Button>
        )
    }

    return (
        <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Pegar texto desordenado
                </h4>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="h-6 w-6 p-0">
                    ×
                </Button>
            </div>

            <Textarea
                placeholder="Ej: Juan Perez 12345678 999888777"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[80px] bg-white"
            />

            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setText('')} disabled={!text}>
                    <Eraser className="mr-2 h-3 w-3" />
                    Limpiar
                </Button>
                <Button size="sm" onClick={handleProcess} disabled={!text} className="bg-blue-600 hover:bg-blue-700">
                    Procesar
                    <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}
