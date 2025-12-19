'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
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

    // Ref to keep latest callback without adding it to deps
    const onLocationChangeRef = useRef(onLocationChange)
    onLocationChangeRef.current = onLocationChange

    // Refs to track if we've auto-selected defaults
    const hasAutoSelectedProvRef = useRef(false)
    const hasAutoSelectedDistRef = useRef(false)

    const departamentos = getDepartamentos()
    const provincias = useMemo(() => deptId ? getProvincias(deptId) : [], [deptId])
    const distritos = useMemo(() => provId ? getDistritos(provId) : [], [provId])

    // Efecto para notificar cambios al padre
    useEffect(() => {
        const deptName = departamentos.find(d => d.id === deptId)?.nombre || ''
        const provName = provincias.find(p => p.id === provId)?.nombre || ''
        const distName = distritos.find(d => d.id === distId)?.nombre || ''

        onLocationChangeRef.current({
            departamento: deptName,
            provincia: provName,
            distrito: distName,
            departamentoId: deptId,
            provinciaId: provId,
            distritoId: distId
        })
    }, [deptId, provId, distId, departamentos, provincias, distritos])

    // Auto-select Huancayo si se selecciona Junín y no hay provincia
    useEffect(() => {
        if (deptId === '12' && !provId && !hasAutoSelectedProvRef.current) {
            hasAutoSelectedProvRef.current = true
            setProvId('1201') // Huancayo
        }
        // Reset flag when dept changes
        if (deptId !== '12') {
            hasAutoSelectedProvRef.current = false
        }
    }, [deptId, provId])

    // Auto-select El Tambo si se selecciona Huancayo y no hay distrito  
    useEffect(() => {
        if (provId === '1201' && !distId && !hasAutoSelectedDistRef.current) {
            hasAutoSelectedDistRef.current = true
            setDistId('120114') // El Tambo
        }
        // Reset flag when prov changes
        if (provId !== '1201') {
            hasAutoSelectedDistRef.current = false
        }
    }, [provId, distId])

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
