import { SucursalesPanel } from '@/components/admin/SucursalesPanel'

export const metadata = {
    title: 'Sucursales | Admin | JUNTAY',
    description: 'Gestión de sucursales y reportes consolidados'
}

export default function SucursalesPage() {
    return (
        <div className="container mx-auto p-6">
            <SucursalesPanel />
        </div>
    )
}
