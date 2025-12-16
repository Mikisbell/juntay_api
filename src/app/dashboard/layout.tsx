
import React from 'react'
import { ClientLayoutWrapper } from '@/components/layout/ClientLayoutWrapper'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClientLayoutWrapper>
            {children}
        </ClientLayoutWrapper>
    )
}
