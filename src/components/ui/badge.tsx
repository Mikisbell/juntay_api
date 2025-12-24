import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Credit status variants
        activo:
          "bg-emerald-100 text-emerald-700 border-emerald-200",
        vigente:
          "bg-emerald-100 text-emerald-700 border-emerald-200",
        vencido:
          "bg-red-100 text-red-700 border-red-200",
        pagado:
          "bg-slate-100 text-slate-600 border-slate-200",
        cancelado:
          "bg-slate-100 text-slate-600 border-slate-200",
        por_vencer:
          "bg-amber-100 text-amber-700 border-amber-200",
        en_mora:
          "bg-red-500 text-white border-red-600",
        // Caja status
        abierta:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        cerrada:
          "bg-slate-100 text-slate-500 border-slate-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
