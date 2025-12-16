import React from 'react'

interface A4LayoutProps {
    children: React.ReactNode
}

export const A4Layout = ({ children }: A4LayoutProps) => {
    return (
        <div
            className="a4-container bg-white text-black font-serif text-sm leading-normal mx-auto"
            style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '20mm',
                boxSizing: 'border-box'
            }}
        >
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0; /* We handle margins in the container */
                    }
                    body * {
                        visibility: hidden;
                    }
                    .a4-container, .a4-container * {
                        visibility: visible;
                    }
                    .a4-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm !important;
                        padding: 20mm !important;
                        margin: 0 !important;
                    }
                    /* Utility for page breaks */
                    .page-break {
                        page-break-after: always;
                    }
                }
                /* Screen preview styles */
                @media screen {
                    .a4-container {
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        margin-bottom: 20px;
                    }
                }
            `}</style>
            {children}
        </div>
    )
}
