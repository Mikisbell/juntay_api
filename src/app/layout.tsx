import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
// import ConsoleFix from "@/components/ui/console-fix"; // Disabled for debugging

export const metadata: Metadata = {
    title: "JUNTAY - Sistema de Casa de Empeño",
    description: "Sistema profesional para gestión de empeños y créditos",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className="antialiased">
                <Providers>
                    {/* ConsoleFix temporarily disabled for debugging */}
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
