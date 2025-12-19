'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { InteractiveParticles } from '@/components/ui/InteractiveParticles'
import { motion } from 'framer-motion'

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

            // Wrap in inner try-catch to handle network-level failures gracefully
            let authResult;
            try {
                authResult = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
            } catch (_networkErr: unknown) {
                // This catches raw TypeError: Failed to fetch when server is down
                // Intentionally DO NOT log to console - this is expected when server is offline
                setError('⚠️ Servidor no disponible. Verifica que Docker/Supabase esté corriendo.')
                setLoading(false)
                return
            }

            const { error: authError } = authResult

            if (authError) {
                const isNetworkError = authError.message.includes('Failed to fetch') ||
                    authError.name === 'AuthRetryableFetchError'

                if (authError.message === 'Invalid login credentials') {
                    setError('Credenciales inválidas. Verifica tu correo y contraseña.')
                } else if (isNetworkError) {
                    setError('⚠️ Servidor no disponible. Verifica que Docker/Supabase esté corriendo.')
                } else {
                    // Only log truly unexpected errors in development
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('[Auth] Error inesperado:', authError.message)
                    }
                    setError(authError.message)
                }
                setLoading(false)
                return
            }

            router.push('/dashboard')
            router.refresh()
        } catch (err: unknown) {
            // Fallback catch for any other unexpected errors
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido'

            // Only log if it's NOT a known network error pattern
            const isNetworkError = errorMessage.toLowerCase().includes('fetch') ||
                errorMessage.toLowerCase().includes('network') ||
                errorMessage.toLowerCase().includes('econnrefused')

            if (!isNetworkError && process.env.NODE_ENV === 'development') {
                console.error('[Auth] Error no manejado:', err)
            }

            setError(isNetworkError
                ? '⚠️ Servidor no disponible. Verifica tu conexión a internet o que el backend esté activo.'
                : 'Error inesperado. Por favor intenta de nuevo.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-slate-950 overflow-hidden text-slate-200 selection:bg-blue-500/30">
            {/* Background Particles */}
            <div className="absolute inset-0 z-0">
                <InteractiveParticles />
            </div>

            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/80 via-slate-900/50 to-slate-950/90 pointer-events-none" />

            <div className="relative z-10 w-full max-w-[420px] px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="group relative bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.2)] p-10 transition-all duration-500 hover:shadow-[0_20px_60px_rgb(66,133,244,0.15)] hover:bg-slate-900/50 hover:border-white/20"
                >
                    {/* Inner lighting effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="relative text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex justify-center mb-6"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse-slow"></div>
                                <Image
                                    src="/icon.png"
                                    alt="Juntay Logo"
                                    width={70}
                                    height={70}
                                    priority
                                    className="object-contain relative z-10 drop-shadow-2xl w-auto h-auto"
                                />
                            </div>
                        </motion.div>
                        <h1 className="text-4xl font-sans font-medium tracking-tight text-white mb-2">
                            Antigravity
                        </h1>
                        <div className="flex items-center justify-center gap-3 mb-4 opacity-70">
                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-400/50"></div>
                            <span className="text-[10px] tracking-[0.3em] uppercase font-semibold text-blue-300">Agent Manager</span>
                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-400/50"></div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="overflow-hidden rounded-xl bg-red-500/10 border border-red-500/20 p-4"
                            >
                                <div className="flex gap-3 items-start">
                                    <div className="text-red-400 mt-0.5">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-red-200">{error}</p>
                                </div>
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-[11px] font-semibold text-slate-400 ml-1 tracking-widest uppercase">
                                Cuenta
                            </label>
                            <div className="relative group/input">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 -z-10" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-950/40 border border-slate-700/50 rounded-xl focus:bg-slate-900/60 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-white placeholder-slate-600 transition-all duration-300 backdrop-blur-md"
                                    placeholder="agente@antigravity.dev"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-[11px] font-semibold text-slate-400 ml-1 tracking-widest uppercase">
                                Acceso
                            </label>
                            <div className="relative group/input">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 -z-10" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-950/40 border border-slate-700/50 rounded-xl focus:bg-slate-900/60 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-white placeholder-slate-600 transition-all duration-300 backdrop-blur-md"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative overflow-hidden bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-4 rounded-xl transition-all duration-300 mt-8 shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 group/btn"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white/80" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span className="tracking-wide">Inicializando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="tracking-wide">Iniciar Sistema</span>
                                        <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-[10px] text-slate-500 font-mono">
                            SECURE TERMINAL • V2.5.0-ALPHA
                        </p>
                    </div>
                </motion.div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 font-mono tracking-widest opacity-60">
                        GOOGLE DEEPMIND • ADVANCED AGENTIC CODING
                    </p>
                </div>
            </div>
        </div>
    )
}
