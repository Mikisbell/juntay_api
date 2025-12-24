'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const supabase = createClient()

            let authResult;
            try {
                authResult = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
            } catch (_networkErr: unknown) {
                setError('⚠️ Servidor no disponible. Verifica que el backend esté activo.')
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
                    setError('⚠️ Servidor no disponible. Verifica tu conexión.')
                } else {
                    setError(authError.message)
                }
                setLoading(false)
                return
            }

            router.push('/dashboard')
            router.refresh()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
            const isNetworkError = errorMessage.toLowerCase().includes('fetch') ||
                errorMessage.toLowerCase().includes('network')

            setError(isNetworkError
                ? '⚠️ Sin conexión al servidor.'
                : 'Error inesperado. Intenta de nuevo.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative flex overflow-hidden">
            {/* Left Panel - Brand & Features */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Floating Orbs */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        scale: [1, 0.95, 1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-32 right-20 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-500/10 rounded-full blur-3xl"
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
                                <Image
                                    src="/icon.png"
                                    alt="JUNTAY"
                                    width={60}
                                    height={60}
                                    className="relative z-10"
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">JUNTAY</h1>
                                <p className="text-emerald-200/80 text-sm">Sistema de Gestión Financiera</p>
                            </div>
                        </div>

                        <h2 className="text-4xl font-light leading-tight mb-6 max-w-md">
                            Tu negocio de <span className="font-semibold text-emerald-300">empeños</span>,
                            ahora <span className="font-semibold text-cyan-300">digital</span>
                        </h2>

                        <div className="space-y-4 mt-10">
                            {[
                                { icon: '📊', title: 'Dashboard Gerencial', desc: 'Visión 360° de tu cartera' },
                                { icon: '💳', title: 'Control de Caja', desc: 'Operaciones en tiempo real' },
                                { icon: '📱', title: 'App PWA', desc: 'Accede desde cualquier dispositivo' },
                            ].map((feature, i) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                                >
                                    <span className="text-2xl">{feature.icon}</span>
                                    <div>
                                        <p className="font-medium">{feature.title}</p>
                                        <p className="text-sm text-white/60">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="absolute bottom-8 left-16 text-white/40 text-xs">
                        © 2025 JUNTAY SaaS • Versión 3.0
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-10">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <Image src="/icon.png" alt="JUNTAY" width={48} height={48} />
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">JUNTAY</span>
                        </div>
                        <p className="text-slate-500 text-sm">Sistema de Gestión Financiera</p>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                            Bienvenido de vuelta
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                            >
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                placeholder="usuario@empresa.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Contraseña
                                </label>
                                <button
                                    type="button"
                                    className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                    onClick={() => {/* TODO: Forgot password flow */ }}
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Verificando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Iniciar sesión</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-slate-50 dark:bg-slate-950 text-slate-400">
                                ¿Nuevo en JUNTAY?
                            </span>
                        </div>
                    </div>

                    {/* CTA for new users */}
                    <a
                        href="/start"
                        className="block w-full py-3 px-4 text-center border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors font-medium"
                    >
                        Crear cuenta gratis
                    </a>

                    <p className="text-center text-xs text-slate-400 mt-8">
                        Diciembre 2025 • Versión Profesional 3.0
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
