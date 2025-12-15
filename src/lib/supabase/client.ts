import { createBrowserClient } from '@supabase/ssr'

// Singleton to prevent multiple GoTrueClient instances
let supabaseBrowserClient: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
    if (supabaseBrowserClient) return supabaseBrowserClient

    supabaseBrowserClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    return supabaseBrowserClient
}
