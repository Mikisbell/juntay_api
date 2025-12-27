import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function middleware(request: NextRequest, _options: NextFetchEvent) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANTE: Refrescar la sesión si está por expirar
    // Esto mantiene la sesión activa
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Definición de rutas
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/auth')
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')
    const isRootRoute = request.nextUrl.pathname === '/'

    // 1. PROTECCIÓN DE RUTAS (Usuario no autenticado)
    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 2. REDIRECCIONES (Usuario autenticado)
    if (user) {
        const rol = user.user_metadata?.rol

        // A. Lógica para SUPER_ADMIN
        // Deben ir siempre a su panel de control, no al dashboard de tenant
        if (rol === 'SUPER_ADMIN') {
            // Si intenta entrar al root, login o al dashboard genérico -> Redirigir a SysAdmin
            if (isRootRoute || isAuthRoute || request.nextUrl.pathname === '/dashboard') {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard/sysadmin/empresas'
                return NextResponse.redirect(url)
            }
        }

        // B. Lógica para Usuarios Normales
        // Si intenta entrar al root o login -> Redirigir a Dashboard
        if (isRootRoute || isAuthRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
