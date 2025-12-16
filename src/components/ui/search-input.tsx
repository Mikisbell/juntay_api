"use client"

import { useDebouncedCallback } from "use-debounce"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { useState } from "react"

export function SearchInput({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const [isSearching, setIsSearching] = useState(false)

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set("q", term)
        } else {
            params.delete("q")
        }

        setIsSearching(true)
        replace(`${pathname}?${params.toString()}`)

        // Simular un pequeño delay para que la UI se sienta reactiva
        setTimeout(() => setIsSearching(false), 300)
    }, 400) // Debounce de 400ms para evitar sobrecarga

    return (
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                className="pl-10 rounded-full bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:bg-white transition-all"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get("q")?.toString()}
            />
            {isSearching && (
                <div className="absolute right-3 top-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
            )}
        </div>
    )
}
