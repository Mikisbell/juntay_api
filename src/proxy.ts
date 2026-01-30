/**
 * Next.js 16 Proxy Configuration
 * Replaces middleware.ts as the network boundary handler
 * Docs: https://nextjs.org/docs/messages/middleware-to-proxy
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Create response once
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Configure Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Apply cookies to response directly
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Verify authentication (this automatically refreshes the session)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define route types
  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/auth");
  const isProtectedRoute = pathname.startsWith("/dashboard");
  const isRootRoute = pathname === "/";

  // ========================================
  // PROTECTION: Unauthenticated users
  // ========================================
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ========================================
  // REDIRECTS: Authenticated users
  // ========================================
  if (user) {
    const rol = user.user_metadata?.rol;

    // SUPER_ADMIN -> Admin panel
    if (rol === "SUPER_ADMIN") {
      if (isRootRoute || isAuthRoute || pathname === "/dashboard") {
        return NextResponse.redirect(
          new URL("/dashboard/sysadmin/empresas", request.url),
        );
      }
    }

    // Normal users -> Dashboard
    if (isRootRoute || isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Return response with applied cookies
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
