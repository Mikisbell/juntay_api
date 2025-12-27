'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 z-[9999]">
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: "easeOut"
                    }}
                    className="relative"
                >
                    {/* Glowing background effect */}
                    <div className="absolute inset-0 bg-blue-500/20 dark:bg-amber-500/20 blur-3xl rounded-full" />

                    {/* Logo/Icon Container */}
                    <div className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                        <Loader2 className="w-12 h-12 text-blue-600 dark:text-amber-500 animate-spin" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        JUNTAY
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Cargando entorno seguro...
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
