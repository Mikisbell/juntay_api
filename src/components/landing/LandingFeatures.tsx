import { Shield, Coins, Smartphone, FileText, Database, Lock } from "lucide-react";

const features = [
    {
        name: "Multi-Tenant Seguro",
        description: "Cada empresa tiene su propia bóveda de datos aislada. Tu información nunca se mezcla con la de otros.",
        icon: Shield,
    },
    {
        name: "Interés Flexible",
        description: "Configura tasas diarias, semanales o mensuales. Moras automáticas y condonaciones controladas.",
        icon: Coins,
    },
    {
        name: "Notificaciones WhatsApp",
        description: "Recordatorios de pago automáticos que llegan directo al celular de tus clientes.",
        icon: Smartphone,
    },
    {
        name: "Contratos Digitales",
        description: "Generación automática de contratos de mutuo y adhesión en PDF listos para imprimir.",
        icon: FileText,
    },
    {
        name: "Bóveda Centralizada",
        description: "Control total de ingresos y egresos. Arqueos de caja ciegos y auditoría de movimientos.",
        icon: Database,
    },
    {
        name: "Roles y Permisos",
        description: "Tú decides qué ven tus cajeros. Sistema de permisos granular para máxima seguridad interna.",
        icon: Lock,
    },
];

export function LandingFeatures() {
    return (
        <div className="py-24 bg-gray-50" id="features">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Características</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Todo lo que necesitas para operar
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        Olvídate de Excel y cuadernos. JUNTAY profesionaliza tu casa de empeño desde el primer día.
                    </p>
                </div>

                <div className="mt-20">
                    <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                        {features.map((feature) => (
                            <div key={feature.name} className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}
