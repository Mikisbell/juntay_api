import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "JUNTAY | Casa de Empeño en Huancayo - Dinero al Instante",
    description: "Empeña tus joyas, celulares o laptops y recibe dinero en 5 minutos. Sin Infocorp. Casa de empeño regulada por SBS en El Tambo, Huancayo. WhatsApp: 995 060 806",
    keywords: ["casa de empeño", "huancayo", "préstamo", "empeño", "dinero rápido", "sin infocorp", "el tambo"],
    openGraph: {
        title: "JUNTAY | Dinero al Instante en Huancayo",
        description: "Empeña tus joyas, celulares o laptops. Sin Infocorp. Regulados por SBS.",
        type: "website",
        locale: "es_PE",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className={inter.variable}>
            <body className="antialiased font-sans bg-white text-gray-900">
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
