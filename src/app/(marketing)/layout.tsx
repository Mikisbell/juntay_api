import { Instrument_Sans } from "next/font/google";
import "@/app/globals.css";
import { LandingNavbarB2C } from "@/components/landing/LandingNavbarB2C";
import { LandingFooterB2C } from "@/components/landing/LandingFooterB2C";

const font = Instrument_Sans({ subsets: ["latin"] });

export const metadata = {
    title: "Juntay - Tu Casa de Empeño Digital",
    description: "Gestiona tu casa de empeño con seguridad de nivel bancario. Sistema SaaS Nº1 en Perú.",
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`min-h-screen bg-black text-white ${font.className}`}>
            <LandingNavbarB2C />

            <main className="pt-0">
                {children}
            </main>

            <LandingFooterB2C />
        </div>
    );
}
