"use client"

import React, { useState, useEffect } from 'react'
import { MainLayout } from './MainLayout'

export function ClientLayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // Force return null or loader during SSR and first client render
    if (!isClient) {
        return (
            <div className="flex min-h-screen w-full bg-slate-50 items-center justify-center">
                <div className="animate-pulse text-slate-400">Cargando Juntay...</div>
            </div>
        )
    }

    // Only render the complex layout on the client after mount
    return (
        <MainLayout defaultOpen={true}>
            {children}
        </MainLayout>
    )
}
