"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SortableColumnHeaderProps {
    column: string
    label: string
    className?: string
}

export function SortableColumnHeader({ column, label, className }: SortableColumnHeaderProps) {
    const searchParams = useSearchParams()
    const currentSort = searchParams.get('sort')
    const currentDir = searchParams.get('dir') || 'asc'

    const isActive = currentSort === column
    const nextDir = isActive && currentDir === 'asc' ? 'desc' : 'asc'

    // Build new URL preserving other params
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', column)
    params.set('dir', nextDir)
    params.set('page', '1') // Reset to page 1 on sort change

    return (
        <Link
            href={`/dashboard/clientes?${params.toString()}`}
            className={cn(
                "inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer select-none",
                isActive && "text-primary font-bold",
                className
            )}
        >
            {label}
            {isActive ? (
                currentDir === 'asc'
                    ? <ArrowUp className="h-3.5 w-3.5" />
                    : <ArrowDown className="h-3.5 w-3.5" />
            ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
            )}
        </Link>
    )
}
