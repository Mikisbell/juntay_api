"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coins, ArrowRightLeft, AlertTriangle } from "lucide-react"
import { inyectarCapitalAction, asignarCajaAction, obtenerCajeros } from "@/lib/actions/tesoreria-actions"

interface Props {
    bovedaDisponible: number
}

export function TesoreriaClient({ bovedaDisponible }: Props) {
    return (
        <div className="flex gap-4 justify-end">
            <ModalInyeccion />
            <ModalAsignacion bovedaDisponible={bovedaDisponible} />
        </div>
    )
}

// MODAL 1: INYECTAR CAPITAL
function ModalInyeccion() {
    const [open, setOpen] = useState(false)
    const [monto, setMonto] = useState("")
    const [origen, setOrigen] = useState("SOCIO")
    const [referencia, setReferencia] = useState("")
    const [nombreAportante, setNombreAportante] = useState("")
    const [numeroCuenta, setNumeroCuenta] = useState("")
    const [numeroOperacion, setNumeroOperacion] = useState("")
    const [tipoComprobante, setTipoComprobante] = useState("TRANSFERENCIA")
    const [loading, setLoading] = useState(false)

    const handleInyectar = async () => {
        if (!monto || parseFloat(monto) <= 0) {
            alert("Ingresa un monto válido")
            return
        }

        if (!nombreAportante) {
            alert("El nombre del aportante/banco es obligatorio")
            return
        }

        setLoading(true)
        try {
            // Construir metadata completa para auditoría
            const metadata = {
                nombre_aportante: nombreAportante,
                numero_cuenta: numeroCuenta || null,
                numero_operacion: numeroOperacion || null,
                tipo_comprobante: tipoComprobante,
                fecha_registro: new Date().toISOString(),
                usuario_registro: "Sistema" // En producción: obtener del auth
            }

            const result = await inyectarCapitalAction(
                parseFloat(monto),
                origen,
                referencia || `${origen} - ${nombreAportante}`,
                metadata
            )

            if (result.error) {
                alert("Error: " + result.error)
            } else {
                alert("✅ Capital inyectado exitosamente")
                setOpen(false)
                window.location.reload()
            }
        } catch (e) {
            console.error(e)
            alert("Error inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Coins className="h-4 w-4" /> Inyectar Capital
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-white">
                <DialogHeader>
                    <DialogTitle className="text-slate-900">Inyectar Dinero a Bóveda</DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Registra el ingreso de capital con toda la información de auditoría
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">

                    {/* Origen del Capital */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Origen del Capital *</Label>
                        <Select value={origen} onValueChange={setOrigen}>
                            <SelectTrigger className="bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="SOCIO">Aporte de Socio</SelectItem>
                                <SelectItem value="BANCO">Préstamo Bancario</SelectItem>
                                <SelectItem value="PRESTAMO_EXTERNO">Préstamo Externo</SelectItem>
                                <SelectItem value="UTILIDADES">Reinversión de Utilidades</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Nombre Aportante */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">
                            Nombre del Aportante / Institución *
                        </Label>
                        <Input
                            placeholder="Ej: Juan Pérez Gómez / Banco BCP"
                            value={nombreAportante}
                            onChange={(e) => setNombreAportante(e.target.value)}
                            className="bg-white"
                        />
                        <p className="text-xs text-slate-500">Persona o entidad que aporta el capital</p>
                    </div>

                    {/* Monto */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Monto (S/) *</Label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            className="text-2xl font-bold bg-white"
                        />
                    </div>

                    {/* Tipo de Comprobante */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Tipo de Comprobante</Label>
                        <Select value={tipoComprobante} onValueChange={setTipoComprobante}>
                            <SelectTrigger className="bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="TRANSFERENCIA">Transferencia Bancaria</SelectItem>
                                <SelectItem value="DEPOSITO">Depósito en Efectivo</SelectItem>
                                <SelectItem value="CHEQUE">Cheque</SelectItem>
                                <SelectItem value="EFECTIVO">Efectivo Directo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Número de Cuenta */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Número de Cuenta (Opcional)</Label>
                        <Input
                            placeholder="Ej: 194-1234567-0-89"
                            value={numeroCuenta}
                            onChange={(e) => setNumeroCuenta(e.target.value)}
                            className="bg-white font-mono"
                        />
                        <p className="text-xs text-slate-500">Cuenta bancaria de origen o destino</p>
                    </div>

                    {/* Número de Operación */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Número de Operación / Voucher</Label>
                        <Input
                            placeholder="Ej: 00123456789"
                            value={numeroOperacion}
                            onChange={(e) => setNumeroOperacion(e.target.value)}
                            className="bg-white font-mono"
                        />
                        <p className="text-xs text-slate-500">Código de la transacción bancaria</p>
                    </div>

                    {/* Referencia/Observaciones */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Referencia / Observaciones</Label>
                        <Input
                            placeholder="Ej: Capital inicial para apertura de sucursal"
                            value={referencia}
                            onChange={(e) => setReferencia(e.target.value)}
                            className="bg-white"
                        />
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertTriangle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-xs">
                            <strong>Importante:</strong> Toda esta información quedará registrada permanentemente
                            en la auditoría de bóveda para futuros controles.
                        </AlertDescription>
                    </Alert>

                </div>

                <Button
                    onClick={handleInyectar}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={loading}
                >
                    {loading ? "Procesando..." : "Confirmar Depósito"}
                </Button>
            </DialogContent>
        </Dialog>
    )
}

// MODAL 2: ASIGNAR CAJA
function ModalAsignacion({ bovedaDisponible }: { bovedaDisponible: number }) {
    const [open, setOpen] = useState(false)
    const [monto, setMonto] = useState("")
    const [cajeroId, setCajeroId] = useState("")
    const [observacion, setObservacion] = useState("")
    const [cajeros, setCajeros] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            obtenerCajeros().then(setCajeros)
        }
    }, [open])

    const handleAsignar = async () => {
        if (!cajeroId) {
            alert("Selecciona un cajero")
            return
        }
        if (!monto || parseFloat(monto) <= 0) {
            alert("Ingresa un monto válido")
            return
        }
        if (parseFloat(monto) > bovedaDisponible) {
            alert("Fondos insuficientes en bóveda")
            return
        }

        setLoading(true)
        try {
            const result = await asignarCajaAction(
                cajeroId,
                parseFloat(monto),
                observacion || "Apertura de turno"
            )

            if (result.error) {
                alert("Error: " + result.error)
            } else {
                alert("✅ Fondos asignados exitosamente")
                setOpen(false)
                window.location.reload()
            }
        } catch (e) {
            console.error(e)
            alert("Error inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <ArrowRightLeft className="h-4 w-4" /> Abrir Caja / Asignar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-slate-900">Asignar Efectivo a Cajero</DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Transfiere fondos desde la bóveda a una caja operativa
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertTriangle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-xs">
                            Disponible en bóveda: <strong>S/ {bovedaDisponible.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Cajero *</Label>
                        <Select value={cajeroId} onValueChange={setCajeroId}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Seleccionar cajero..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {cajeros.length === 0 ? (
                                    <SelectItem value="loading" disabled>
                                        Cargando cajeros...
                                    </SelectItem>
                                ) : (
                                    cajeros.map((cajero) => (
                                        <SelectItem key={cajero.id} value={cajero.id}>
                                            {cajero.nombres} {cajero.apellido_paterno || ''}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Monto Inicial (S/) *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-500">
                                S/
                            </span>
                            <Input
                                type="text"
                                placeholder="0.00"
                                value={monto}
                                onChange={(e) => {
                                    // Permitir solo números y un punto decimal
                                    const value = e.target.value.replace(/[^0-9.]/g, '')
                                    const parts = value.split('.')
                                    if (parts.length > 2) return // Solo un punto decimal
                                    if (parts[1]?.length > 2) return // Max 2 decimales
                                    setMonto(value)
                                }}
                                onBlur={() => {
                                    // Formatear al salir del campo
                                    if (monto && parseFloat(monto) > 0) {
                                        setMonto(parseFloat(monto).toFixed(2))
                                    }
                                }}
                                className="text-2xl font-bold pl-12 bg-white"
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            {monto && parseFloat(monto) > 0
                                ? `${parseFloat(monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })} soles`
                                : 'Ingresa el monto a asignar'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Observación (Opcional)</Label>
                        <Input
                            placeholder="Ej: Apertura de turno mañana"
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            className="bg-white"
                        />
                    </div>

                    <Button
                        onClick={handleAsignar}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? "Procesando..." : "Transferir Fondos"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
