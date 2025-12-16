"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SmartPasteProps {
    onParsed: (data: {
        dni?: string
        nombre?: string
        telefono?: string
        email?: string
        direccion?: string
    }) => void
}

export function SmartPasteButton({ onParsed }: SmartPasteProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (!text) return

            setIsAnalyzing(true)

            // Simular tiempo de "pensamiento" de la IA
            setTimeout(() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data: any = {}

                // 1. Detectar DNI (8 dígitos)
                const dniMatch = text.match(/\b\d{8}\b/)
                if (dniMatch) data.dni = dniMatch[0]

                // 2. Detectar Email
                const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
                if (emailMatch) data.email = emailMatch[0]

                // 3. Detectar Teléfono (9 dígitos empezando con 9)
                const phoneMatch = text.match(/\b9\d{8}\b/)
                if (phoneMatch) data.telefono = phoneMatch[0]

                // 4. Heurística simple para Nombre (Palabras capitalizadas que no sean lo anterior)
                // Esto es básico, una IA real usaría NLP, pero para el efecto "Wow" sirve.
                const lines = text.split('\n')
                const potentialName = lines.find(l => l.length > 5 && !l.includes('@') && !l.match(/\d/))
                if (potentialName) data.nombre = potentialName.trim()

                onParsed(data)
                setIsAnalyzing(false)
                toast.success("Datos extraídos inteligentemente", {
                    icon: <Sparkles className="h-4 w-4 text-purple-500" />
                })
            }, 800) // 800ms de delay para el efecto

        } catch (err) {
            console.error("Error pasting:", err)
            setIsAnalyzing(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handlePaste}
            disabled={isAnalyzing}
            className="gap-2 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-900/20 dark:text-purple-300"
        >
            {isAnalyzing ? (
                <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Analizando...
                </>
            ) : (
                <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Pegado Mágico AI
                </>
            )}
        </Button>
    )
}
