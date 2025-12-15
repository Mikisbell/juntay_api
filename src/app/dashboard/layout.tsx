"use client"

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamically import MainLayout with SSR disabled.
// This ensures the Sidebar logic NEVER runs on the server, guaranteeing
// that the server HTML (loading state) always matches the initial client HTML.
const MainLayout = dynamic(
    () => import('@/components/layout/MainLayout').then(mod => mod.MainLayout),
    {
        ssr: false,
        loading: () => (
            <div className="flex min-h-screen w-full bg-slate-50 items-center justify-center">
                <div className="animate-pulse text-slate-400">Cargando dashboard...</div>
            </div>
        )
    }
)

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <MainLayout defaultOpen={true}>
            {children}
        </MainLayout>
    )
}
