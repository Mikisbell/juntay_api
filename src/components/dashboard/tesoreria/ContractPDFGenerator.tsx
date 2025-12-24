"use client"

import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import { useState } from "react"

interface ContractPDFProps {
    inversionista: {
        nombre_completo: string
        numero_documento?: string
        tipo_relacion: string
        fecha_ingreso: string
        metadata?: any
    }
    variant?: "default" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

export function ContractPDFGenerator({ inversionista, variant = "secondary", size = "sm" }: ContractPDFProps) {
    const [generating, setGenerating] = useState(false)

    const generatePDF = async () => {
        setGenerating(true)
        try {
            // Simular carga
            await new Promise(resolve => setTimeout(resolve, 500))

            const doc = new jsPDF()

            // Configuración
            doc.setFont("helvetica")

            // Header
            doc.setFontSize(22)
            doc.text("JUNTAY CAPITAL", 105, 20, { align: "center" })

            doc.setFontSize(14)
            doc.text("CONTRATO DE INVERSIÓN", 105, 30, { align: "center" })

            // Metadata
            const fecha = new Date(inversionista.fecha_ingreso).toLocaleDateString("es-PE", { year: 'numeric', month: 'long', day: 'numeric' })
            const docNum = inversionista.numero_documento || "________________"

            // Cuerpo del texto
            doc.setFontSize(11)
            let y = 50
            const lineHeight = 7

            const texto = `Conste por el presente documento el contrato de inversión que celebran de una parte:\n\n` +
                `LA EMPRESA: JUNTAY CAPITAL S.A.C., con RUC 20600000001, debidamente representada por su Gerente General.\n\n` +
                `Y de la otra parte:\n\n` +
                `EL INVERSIONISTA: ${inversionista.nombre_completo.toUpperCase()}, identificado con DNI N° ${docNum}.\n\n` +
                `Quienes acuerdan los siguientes términos:\n\n` +
                `PRIMERO: EL INVERSIONISTA realiza un aporte de capital a favor de LA EMPRESA bajo la modalidad de ${inversionista.tipo_relacion}.\n\n` +
                `SEGUNDO: La fecha de inicio de esta inversión se contabiliza a partir del ${fecha}.\n\n` +
                `TERCERO: Las condiciones financieras tasa, plazo y cronograma se detallan en el Anexo 1 adjunto a este contrato.\n\n` +
                `Firmado en señal de conformidad,`

            const splitText = doc.splitTextToSize(texto, 170)
            doc.text(splitText, 20, y)

            // Firmas
            y += 120
            doc.line(30, y, 90, y)
            doc.text("LA EMPRESA", 60, y + 5, { align: "center" })

            doc.line(120, y, 180, y)
            doc.text("EL INVERSIONISTA", 150, y + 5, { align: "center" })

            // Footer
            doc.setFontSize(8)
            doc.text(`Generado digitalmente el ${new Date().toLocaleString()}`, 105, 290, { align: "center" })

            // Guardar
            const filename = `Contrato_${inversionista.nombre_completo.replace(/\s+/g, '_')}_${fecha}.pdf`
            doc.save(filename)

        } catch (error) {
            console.error("Error generating PDF", error)
            alert("Error al generar el PDF")
        } finally {
            setGenerating(false)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={(e) => {
                e.stopPropagation()
                generatePDF()
            }}
            disabled={generating}
        >
            {generating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <FileDown className="w-4 h-4 mr-2" />
            )}
            {generating ? "Generando..." : "Descargar PDF"}
        </Button>
    )
}
