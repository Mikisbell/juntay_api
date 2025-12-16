"use client"

import { usePathname } from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react"

const routeMapping: Record<string, string> = {
    dashboard: "Inicio",
    caja: "Terminal de Caja",
    mostrador: "Mostrador",
    "nuevo-empeno": "Nuevo Crédito",
    pagos: "Cobranzas",
    contratos: "Cartera de Contratos",
    clientes: "Directorio de Clientes",
    inventario: "Bóveda de Garantías",
    admin: "Administración",
    tesoreria: "Tesorería Central",
    configuracion: "Configuración",
    reportes: "Reportes",
    "caja-diaria": "Cierre Diario",
    cartera: "Análisis de Cartera",
    transacciones: "Historial",
    buscar: "Búsqueda Global"
}

export function DynamicBreadcrumb() {
    const pathname = usePathname()
    const segments = pathname.split("/").filter((item) => item !== "")

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1
                    const href = `/${segments.slice(0, index + 1).join("/")}`
                    const title = routeMapping[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbItem className="hidden md:block">
                                {isLast ? (
                                    <BreadcrumbPage>{title}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>
                                        {title}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
