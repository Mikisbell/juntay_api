'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, CalendarClock } from 'lucide-react'
import { useWhatsApp } from '@/hooks/useWhatsApp'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

interface ExpirationItem {
    id: string
    codigo: string
    cliente_nombre: string
    garantia_descripcion: string
    garantia_foto: string
    fecha_vencimiento: string
    dias_restantes: number
    monto_prestamo: number
    telefono: string
}

export function ExpirationTimeline() {
    const [items, setItems] = useState<ExpirationItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const { sendReminder } = useWhatsApp()

    useEffect(() => {
        const fetchData = async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any).rpc('get_upcoming_expirations', { p_days: 7 })
            if (error) {
                console.error('Error fetching timeline:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                })
            }
            else setItems(data || [])
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) return <div className="h-48 animate-pulse bg-slate-100 rounded-xl" />
    if (items.length === 0) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-slate-500" />
                    Vencimientos Próximos
                </h3>
                <Badge variant="outline">{items.length} contratos</Badge>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {items.map((item) => (
                    <Card key={item.id} className="min-w-[280px] snap-center hover:shadow-md transition-shadow">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                    {item.garantia_foto ? (
                                        <img src={item.garantia_foto} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Sin foto</div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">{item.cliente_nombre}</p>
                                    <p className="text-xs text-slate-500 truncate">{item.garantia_descripcion}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div className={`font-bold ${item.dias_restantes < 0 ? 'text-red-600' : item.dias_restantes === 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                                    {item.dias_restantes < 0 ? `Venció hace ${Math.abs(item.dias_restantes)} días` :
                                        item.dias_restantes === 0 ? 'Vence HOY' :
                                            `Vence en ${item.dias_restantes} días`}
                                </div>
                            </div>

                            <Button
                                size="sm"
                                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => sendReminder(
                                    item.telefono,
                                    item.cliente_nombre,
                                    item.garantia_descripcion,
                                    new Date(item.fecha_vencimiento),
                                    item.monto_prestamo
                                )}
                            >
                                <MessageCircle className="w-4 h-4" />
                                Recordar Pago
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
