'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone, Send, User, Calendar, DollarSign } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { enviarNotificacion } from '@/lib/actions/vencimientos-actions'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

type Contrato = {
    id: string
    codigo: string
    cliente: string
    telefono: string
    monto: number
    saldo: number
    fechaVencimiento: string
    diasRestantes: number
}

export function VencimientoMesCard({ contrato }: { contrato: Contrato }) {
    return (
        <div className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono">{contrato.codigo}</Badge>
                <span className="text-sm font-medium">{contrato.cliente}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                    {new Date(contrato.fechaVencimiento).toLocaleDateString('es-PE')}
                </span>
                <Badge variant="secondary">{contrato.diasRestantes}d</Badge>
                <span className="font-semibold">S/. {contrato.monto.toFixed(2)}</span>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = `/dashboard/contratos/${contrato.id}`}
                >
                    Ver Detalle
                </Button>
            </div>
        </div>
    )
}
