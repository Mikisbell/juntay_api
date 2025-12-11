'use client'

import { Button } from '@/components/ui/button'
import { LockKeyhole } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CierreCaja() {
    const router = useRouter()

    return (
        <Button
            variant="outline"
            className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            onClick={() => router.push('/dashboard/caja/cierre')}
        >
            <LockKeyhole className="mr-2 h-4 w-4" />
            Cerrar Turno
        </Button>
    )
}
