import React from 'react'

interface TicketLayoutProps {
    children: React.ReactNode
    width?: string // Default '80mm'
}

export const TicketLayout = ({ children, width = '80mm' }: TicketLayoutProps) => {
    return (
        <div
            className="ticket-container bg-white text-black font-mono text-xs leading-tight"
            style={{
                width: width,
                margin: '0 auto',
                padding: '10px 0', // Small padding for roll edges
            }}
        >
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto; /* auto is better for roll paper */
                    }
                    body * {
                        visibility: hidden;
                    }
                    .ticket-container, .ticket-container * {
                        visibility: visible;
                    }
                    .ticket-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: ${width} !important;
                    }
                }
            `}</style>
            {children}
        </div>
    )
}
