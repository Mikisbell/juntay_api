import React from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { MobileWarning } from '@/components/layout/MobileWarning'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <MobileWarning />
            <MainLayout defaultOpen={true}>
                {children}
            </MainLayout>
        </>
    )
}
