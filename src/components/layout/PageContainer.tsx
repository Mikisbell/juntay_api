import { cn } from '@/lib/utils'

interface PageContainerProps {
    children: React.ReactNode
    className?: string
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const maxWidthVariants = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-[1600px]',
    full: 'max-w-full'
}

export function PageContainer({
    children,
    className,
    maxWidth = '2xl'
}: PageContainerProps) {
    return (
        <div className={cn(
            "container mx-auto space-y-6",
            maxWidthVariants[maxWidth],
            className
        )}>
            {children}
        </div>
    )
}
