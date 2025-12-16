import { obtenerInventario } from '@/lib/actions/inventario-actions'
import { TablaInventario } from '@/components/inventario/TablaInventario'
import { Package, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventario</h2>
                    <p className="text-muted-foreground">Gestión de garantías en custodia y artículos en remate.</p>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <Link href="/dashboard/inventario?estado=todos">
                        <Button
                            variant={estado === 'todos' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8"
                        >
                            Todos
                        </Button>
                    </Link>
                    <Link href="/dashboard/inventario?estado=custodia">
                        <Button
                            variant={estado === 'custodia' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8"
                        >
                            🟢 En Custodia
                        </Button>
                    </Link>
                    <Link href="/dashboard/inventario?estado=vencido">
                        <Button
                            variant={estado === 'vencido' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8"
                        >
                            🟡 Vencidos
                        </Button>
                    </Link>
                    <Link href="/dashboard/inventario?estado=remate">
                        <Button
                            variant={estado === 'remate' ? 'destructive' : 'ghost'}
                            size="sm"
                            className={estado === 'remate' ? 'h-8' : 'h-8 text-muted-foreground hover:text-destructive'}
                        >
                            🔴 En Remate
                        </Button>
                    </Link>
                    <Link href="/dashboard/inventario?estado=vendido">
                        <Button
                            variant={estado === 'vendido' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8"
                        >
                            ⚫ Vendidos
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Bóveda Central</CardTitle>
                            <CardDescription>
                                Mostrando {items.length} items en estado: <span className="font-medium uppercase">{estado}</span>
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar artículo..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <TablaInventario items={items} />
                </CardContent>
            </Card>
        </div>
    )
}
