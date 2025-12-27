'use client'

/**
 * motion.tsx - Reusable animation components
 * 
 * Provides standardized entrance animations and interactions
 * to ensure consistency across the application.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionProps {
    children: ReactNode
    delay?: number
    className?: string
}

export const FadeIn = ({ children, delay = 0, className = "" }: MotionProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
)

export const SlideUp = ({ children, delay = 0, className = "" }: MotionProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
)

export const ScaleIn = ({ children, delay = 0, className = "" }: MotionProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, delay, ease: "backOut" }}
        className={className}
    >
        {children}
    </motion.div>
)

export const StaggerContainer = ({ children, className = "", staggerDelay = 0.1 }: MotionProps & { staggerDelay?: number }) => (
    <motion.div
        initial="hidden"
        animate="show"
        variants={{
            hidden: { opacity: 0 },
            show: {
                opacity: 1,
                transition: {
                    staggerChildren: staggerDelay
                }
            }
        }}
        className={className}
    >
        {children}
    </motion.div>
)

export const StaggerItem = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 }
        }}
        className={className}
    >
        {children}
    </motion.div>
)

export const HoverCard = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
    <motion.div
        whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
        transition={{ duration: 0.2 }}
        className={className}
    >
        {children}
    </motion.div>
)
