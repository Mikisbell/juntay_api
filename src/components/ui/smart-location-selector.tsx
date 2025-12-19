'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getDepartamentos, getProvincias, getDistritos } from '@/lib/data/ubigeo-data'

interface SmartLocationSelectorProps {
    onLocationChange: (location: {
        departamento: string
        provincia: string
        distrito: string
        departamentoId: string
        provinciaId: string
        distritoId: string
    }) => void
    defaultValues?: {
        departamentoId?: string
        provinciaId?: string
        distritoId?: string
    }
}

export function SmartLocationSelector({ onLocationChange, defaultValues }: SmartLocationSelectorProps) {
    const [deptId, setDeptId] = useState(defaultValues?.departamentoId || '')
    const [provId, setProvId] = useState(defaultValues?.provinciaId || '')
    const [distId, setDistId] = useState(defaultValues?.distritoId || '')

    const departamentos = getDepartamentos()
    const provincias = deptId ? getProvincias(deptId) : []
    const distritos = provId ? getDistritos(provId) : []

    // Efecto para notificar cambios al padre
    useEffect(() => {
        const deptName = departamentos.find(d => d.id === deptId)?.nombre || ''
        const provName = provincias.find(p => p.id === provId)?.nombre || ''
        const distName = distritos.find(d => d.id === distId)?.nombre || ''

        onLocationChange({
            departamento: deptName,
            provincia: provName,
            distrito: distName,
            departamentoId: deptId,
            provinciaId: provId,
            distritoId: distId
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deptId, provId, distId])

    // Auto-select Huancayo/El Tambo si se selecciona Junín y no hay nada seleccionado
    useEffect(() => {
        if (deptId === '12' && !provId) {
            setProvId('1201') // Huancayo
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deptId])

    useEffect(() => {
        if (provId === '1201' && !distId) {
            setDistId('120114') // El Tambo (Default inteligente)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provId])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label>Departamento</Label>
                <Select value={deptId} onValueChange={(val) => {
                    setDeptId(val)
                    setProvId('')
                    setDistId('')
                }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                        {departamentos.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Provincia</Label>
                <Select value={provId} onValueChange={(val) => {
                    setProvId(val)
                    setDistId('')
                }} disabled={!deptId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                        {provincias.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Distrito</Label>
                <Select value={distId} onValueChange={setDistId} disabled={!provId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                        {distritos.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
