'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'cajero' | 'gerente' | 'admin' | 'unknown'

interface UserRoleData {
    role: UserRole
    isLoading: boolean
    userId: string | null
    email: string | null
}

export function useUserRole(): UserRoleData {
    const [data, setData] = useState<UserRoleData>({
        role: 'unknown',
        isLoading: true,
        userId: null,
        email: null
    })
    const supabase = createClient()

    useEffect(() => {
        async function fetchRole() {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    setData({ role: 'unknown', isLoading: false, userId: null, email: null })
                    return
                }

                // Get user role from empleados table
                const { data: empleado } = await supabase
                    .from('empleados')
                    .select('rol')
                    .eq('usuario_id', user.id)
                    .single()

                let role: UserRole = 'cajero' // default

                const empleadoData = empleado as { rol: string } | null
                if (empleadoData?.rol) {
                    const rolLower = empleadoData.rol.toLowerCase()
                    if (rolLower.includes('admin') || rolLower.includes('sistema')) {
                        role = 'admin'
                    } else if (rolLower.includes('gerente') || rolLower.includes('supervisor')) {
                        role = 'gerente'
                    } else {
                        role = 'cajero'
                    }
                }

                setData({
                    role,
                    isLoading: false,
                    userId: user.id,
                    email: user.email || null
                })
            } catch (error) {
                console.error('Error fetching user role:', error)
                setData({ role: 'cajero', isLoading: false, userId: null, email: null })
            }
        }

        fetchRole()
    }, [supabase])

    return data
}

// Role-based visibility helper
export function canView(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
    const roleHierarchy: Record<UserRole, number> = {
        'unknown': 0,
        'cajero': 1,
        'gerente': 2,
        'admin': 3
    }

    const userLevel = roleHierarchy[userRole]

    if (Array.isArray(requiredRole)) {
        return requiredRole.some(r => userLevel >= roleHierarchy[r])
    }

    return userLevel >= roleHierarchy[requiredRole]
}

// Component wrapper for role-based rendering
interface RoleGateProps {
    children: React.ReactNode
    roles: UserRole | UserRole[]
    fallback?: React.ReactNode
    userRole: UserRole
}

export function RoleGate({ children, roles, fallback = null, userRole }: RoleGateProps) {
    if (canView(userRole, roles)) {
        return <>{children} </>
    }
    return <>{fallback} </>
}
