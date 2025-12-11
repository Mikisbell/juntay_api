'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const supabase = createClient()

            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) {
                // No loggear errores de red esperados - solo mostrar UI
                const isNetworkError = authError.message.includes('Failed to fetch') ||
                    authError.name === 'AuthRetryableFetchError'

                if (authError.message === 'Invalid login credentials') {
                    setError('Credenciales inválidas. Verifica tu correo y contraseña.')
                } else if (isNetworkError) {
                    setError('No se puede conectar al servidor. Verifica que el servicio esté activo.')
                } else {
                    // Solo loggear errores inesperados en desarrollo
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('[Auth] Error inesperado:', authError.message)
                    }
                    setError(authError.message)
                }
                setLoading(false)
                return
            }

            // Éxito - redirigir al dashboard
            router.push('/dashboard')
            router.refresh()
        } catch (err: unknown) {
            // Errores de red capturados silenciosamente
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
            const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network')

            if (!isNetworkError && process.env.NODE_ENV === 'development') {
                console.warn('[Auth] Error de red:', errorMessage)
            }

            setError('Error de conexión. Verifica tu red o que el servidor esté funcionando.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-slate-50 overflow-hidden">
            <div className="relative z-10 w-full max-w-md px-6">
                <div className="group relative bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/70">

                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="relative text-center mb-10">
                        <div className="flex justify-center mb-4">
                            <Image
                                src="/logo.png"
                                alt="Juntay Logo"
                                width={80}
                                height={80}
                                className="object-contain"
                            />
                        </div>
                        <h1 className="text-4xl font-serif font-light tracking-wider text-slate-800 mb-2">
                            JUNTAY
                        </h1>
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-3 opacity-50" />
                        <p className="text-[10px] text-slate-500 tracking-[0.2em] uppercase font-medium">
                            Finanzas & Empeño
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative">
                        {error && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className={`p-4 rounded-xl border ${error.includes('conectar') || error.includes('conexión')
                                    ? 'bg-amber-50 border-amber-200'
                                    : 'bg-red-50 border-red-200'
                                    }`}>
                                    <div className="flex gap-3">
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${error.includes('conectar') || error.includes('conexión')
                                            ? 'bg-amber-100'
                                            : 'bg-red-100'
                                            }`}>
                                            {error.includes('conectar') || error.includes('conexión') ? (
                                                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-sm font-semibold ${error.includes('conectar') || error.includes('conexión')
                                                ? 'text-amber-800'
                                                : 'text-red-800'
                                                }`}>
                                                {error.includes('conectar') || error.includes('conexión')
                                                    ? 'Problema de conexión'
                                                    : 'No se pudo iniciar sesión'}
                                            </h3>
                                            <p className={`text-sm mt-1 ${error.includes('conectar') || error.includes('conexión')
                                                ? 'text-amber-700'
                                                : 'text-red-700'
                                                }`}>
                                                {error}
                                            </p>
                                            {(error.includes('conectar') || error.includes('conexión')) && (
                                                <div className="mt-3 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setError('')}
                                                        className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2"
                                                    >
                                                        Reintentar
                                                    </button>
                                                    <span className="text-amber-400">•</span>
                                                    <span className="text-xs text-amber-600">
                                                        Verifica que Supabase esté activo
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="block text-xs font-medium text-slate-600 ml-1 tracking-wide"
                            >
                                CORREO ELECTRÓNICO
                            </label>
                            <div className="relative group/input">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white/50 border border-slate-200/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-slate-800 placeholder-slate-400 transition-all duration-300 backdrop-blur-sm"
                                    placeholder="usuario@juntay.com"
                                />
                                <div className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-md" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="password"
                                className="block text-xs font-medium text-slate-600 ml-1 tracking-wide"
                            >
                                CONTRASEÑA
                            </label>
                            <div className="relative group/input">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white/50 border border-slate-200/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-slate-800 placeholder-slate-400 transition-all duration-300 backdrop-blur-sm"
                                    placeholder="••••••••"
                                />
                                <div className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-md" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative overflow-hidden bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-medium py-4 rounded-xl transition-all duration-300 mt-8 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 group/btn"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Iniciando...
                                    </>
                                ) : (
                                    <>
                                        Iniciar Sesión
                                        <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-200/50 text-center">
                        <p className="text-xs text-slate-400 font-light">
                            Acceso seguro • JUNTAY v1.0
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center opacity-60 hover:opacity-100 transition-opacity duration-300">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                        © 2025 Juntay Financial
                    </p>
                </div>
            </div>
        </div>
    )
}
