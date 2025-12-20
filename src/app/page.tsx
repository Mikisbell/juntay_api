import { LandingNavbarB2C } from "@/components/landing/LandingNavbarB2C";
import { LandingHeroB2C } from "@/components/landing/LandingHeroB2C";
import { LandingProcessB2C } from "@/components/landing/LandingProcessB2C";
import { LandingLocationB2C } from "@/components/landing/LandingLocationB2C";
import { LandingFooterB2C } from "@/components/landing/LandingFooterB2C";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white font-sans selection:bg-yellow-200 selection:text-black">
            <LandingNavbarB2C />
            <LandingHeroB2C />
            <LandingProcessB2C />
            <LandingLocationB2C />
            <LandingFooterB2C />
        </main>
    );
}
