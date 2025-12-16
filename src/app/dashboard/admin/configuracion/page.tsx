import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Save, Settings, Shield, Percent, Calendar } from 'lucide-react'

export default function ConfiguracionPage() {
    return (
        <div className="min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 bg-grid-slate-100 dark:bg-grid-slate-900">
            <div className="flex-1 space-y-8 p-8 pt-6 animate-in-fade-slide">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Configuración del Sistema</h2>
                        <p className="text-muted-foreground">Administración de parámetros globales y reglas de negocio.</p>
                    </div>
                    <Button className="gap-2 shadow-lg shadow-primary/20">
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                    </Button>
                </div>

                <Tabs defaultValue="general" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="financiero">Financiero</TabsTrigger>
                        <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4">
                        <Card className="glass-panel border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Información de la Empresa</CardTitle>
                                <CardDescription>Datos que aparecen en los contratos y tickets.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre Comercial</Label>
                                        <Input id="nombre" defaultValue="JUNTAY Casa de Empeño" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ruc">RUC</Label>
                                        <Input id="ruc" defaultValue="20123456789" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="direccion">Dirección Principal</Label>
                                        <Input id="direccion" defaultValue="Av. Principal 123, Lima" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telefono">Teléfono de Contacto</Label>
                                        <Input id="telefono" defaultValue="+51 999 888 777" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="financiero" className="space-y-4">
                        <Card className="glass-panel border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Parámetros de Crédito</CardTitle>
                                <CardDescription>Reglas para el cálculo de intereses y plazos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Percent className="h-4 w-4 text-primary" />
                                            Tasa de Interés Mensual (%)
                                        </Label>
                                        <Input type="number" defaultValue="6.0" />
                                        <p className="text-xs text-muted-foreground">Tasa base aplicada a nuevos contratos.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            Días de Gracia
                                        </Label>
                                        <Input type="number" defaultValue="3" />
                                        <p className="text-xs text-muted-foreground">Días adicionales antes de aplicar mora.</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium">Límites Operativos</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Monto Máximo por Caja (S/)</Label>
                                            <Input type="number" defaultValue="5000" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Monto Mínimo de Préstamo (S/)</Label>
                                            <Input type="number" defaultValue="50" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="seguridad" className="space-y-4">
                        <Card className="glass-panel border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Control de Acceso</CardTitle>
                                <CardDescription>Gestión de permisos y seguridad.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Autenticación de Dos Factores</Label>
                                        <p className="text-sm text-muted-foreground">Requerir 2FA para administradores.</p>
                                    </div>
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
