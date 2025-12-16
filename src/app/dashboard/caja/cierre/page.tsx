import { redirect } from "next/navigation"

// El cierre de caja ahora se hace desde el Terminal (CierreCajaSheet)
// Esta ruta redirige al dashboard para mantener enlaces antiguos funcionando
export default function CierreCajaPage() {
    redirect('/dashboard')
}
