'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface PrintContextType {
    print: (content: React.ReactNode) => void
    isPrinting: boolean
}

const PrintContext = createContext<PrintContextType | undefined>(undefined)

export const usePrint = () => {
    const context = useContext(PrintContext)
    if (!context) {
        throw new Error('usePrint must be used within a PrintProvider')
    }
    return context
}

export const PrintProvider = ({ children }: { children: React.ReactNode }) => {
    const [printContent, setPrintContent] = useState<React.ReactNode | null>(null)
    const [isPrinting, setIsPrinting] = useState(false)

    const print = useCallback((content: React.ReactNode) => {
        setPrintContent(content)
        setIsPrinting(true)
    }, [])

    useEffect(() => {
        if (isPrinting && printContent) {
            // Small delay to ensure rendering
            const timer = setTimeout(() => {
                window.print()
                // Reset after print dialog closes
                // Note: window.print() is blocking in many browsers, so this runs after dialog closes
                // In others it might run immediately. Ideally we listen to afterprint.
            }, 100)

            const handleAfterPrint = () => {
                setIsPrinting(false)
                setPrintContent(null)
            }

            window.addEventListener('afterprint', handleAfterPrint)

            return () => {
                clearTimeout(timer)
                window.removeEventListener('afterprint', handleAfterPrint)
                // Fallback cleanup if afterprint doesn't fire (some older browsers)
                setIsPrinting(false)
                setPrintContent(null)
            }
        }
    }, [isPrinting, printContent])

    return (
        <PrintContext.Provider value={{ print, isPrinting }}>
            {children}
            {isPrinting && printContent && (
                <div id="print-root">
                    {printContent}
                </div>
            )}
        </PrintContext.Provider>
    )
}
