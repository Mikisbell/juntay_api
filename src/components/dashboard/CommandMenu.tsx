"use client"

import * as React from "react"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    User,
    Wallet,
    Search,
    FileText,
    LogOut
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-muted-foreground ml-auto mr-4 hidden md:flex"
            >
                <Search className="h-3.5 w-3.5" />
                <span className="lg:hidden">Buscar...</span>
                <span className="hidden lg:inline-flex">Buscar en Juntay...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Escribe un comando o busca..." />
                <CommandList>
                    <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                    <CommandGroup heading="Acciones Rápidas">
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/mostrador/nuevo-empeno'))}>
                            <Calculator className="mr-2 h-4 w-4" />
                            <span>Nuevo Empeño</span>
                            <CommandShortcut>⌘N</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/caja'))}>
                            <Wallet className="mr-2 h-4 w-4" />
                            <span>Ir a Caja</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/clientes'))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Buscar Cliente</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Navegación">
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/contratos'))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Cartera de Contratos</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/pagos'))}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Cobranzas</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/reportes/caja-diaria'))}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Cierre Diario</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/admin/configuracion'))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Configuración</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Sistema">
                        <CommandItem onSelect={() => runCommand(() => console.log("Logout"))}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
