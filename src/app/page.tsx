import { LandingNavbarSaaS } from "@/components/landing/saas/LandingNavbarSaaS";
import { LandingHeroSaaS } from "@/components/landing/saas/LandingHeroSaaS";

export default function SaaSPage() {
    return (
        <main className="min-h-screen bg-[#0B1120] text-white selection:bg-[#D4AF37] selection:text-[#0B1120]">
            <LandingNavbarSaaS />
            <LandingHeroSaaS />
            {/* Features Section placeholder */}
            <section className="py-20 border-t border-white/5">
                <div className="text-center">
                    <p className="text-slate-500 text-sm font-mono">POWERED BY JUNTAY ENGINE v2.0</p>
                </div>
            </section>
        </main>
    );
}
