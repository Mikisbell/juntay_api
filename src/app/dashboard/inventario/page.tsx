import { obtenerInventario } from '@/lib/actions/inventario-actions'
import { TablaInventario } from '@/components/inventario/TablaInventario'
import { Package, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function InventarioPage({
    searchParams,
}: {
    searchParams: Promise<{ estado?: string }>
}) {
    const params = await searchParams
    const estado = params.estado || 'todos'

    const items = await obtenerInventario(estado)

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Package className="h-8 w-8" />
                        Bóveda Central
                    </h1>
                    <p className="text-slate-500">Gestión de garantías en custodia y remate</p>
                </div>

                <div className="flex gap-2">
                    <Link href="/dashboard/inventario?estado=todos">
                        <Button variant={estado === 'todos' ? 'default' : 'outline'} size="sm">
                            Todos
                        </Button>
                    </Link>
                    <Link href="/dashboard/inventario?estado=custodia">
                        <Button variant={estado === 'custodia' ? 'default' : 'outline'} size="sm">
                            En Custodia
                        </Button>
                    </Link>
                    <Link href="/dashboard/inventario?estado=remate">
                        <Button variant={estado === 'remate' ? 'destructive' : 'outline'} size="sm">
                            En Remate
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <Filter className="h-4 w-4" />
                    <span>Mostrando {items.length} items en estado: <strong>{estado.toUpperCase()}</strong></span>
                </div>

                <TablaInventario items={items} />
            </div>
        </div>
    )
}
