"use client"

import React, { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Estado para controlar el montado en el cliente
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Evitar renderizar el layout complejo hasta que estemos en el cliente
    // Esto ELIMINA el riesgo de "Hydration failed" por completo.
    if (!isMounted) {
        return <div className="min-h-screen w-full bg-slate-50" />
    }

    return (
        <MainLayout defaultOpen={true}>
            {children}
        </MainLayout>
    )
}
