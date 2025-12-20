import { BancoPanel } from '@/components/banco/BancoPanel'

export const metadata = {
    title: 'Integración Bancaria | JUNTAY',
    description: 'Conciliación de depósitos bancarios con pagos'
}

export default function BancoPage() {
    return (
        <div className="container mx-auto p-6">
            <BancoPanel />
        </div>
    )
}
