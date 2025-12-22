import { LandingNavbarB2C } from "@/components/landing/LandingNavbarB2C";
import { LandingHeroB2C } from "@/components/landing/LandingHeroB2C";
import { LandingBadgesB2C } from "@/components/landing/LandingBadgesB2C";
import { LandingSimulatorB2C } from "@/components/landing/LandingSimulatorB2C";
import { LandingItemsB2C } from "@/components/landing/LandingItemsB2C";
import { LandingProcessB2C } from "@/components/landing/LandingProcessB2C";
import { LandingTrustB2C } from "@/components/landing/LandingTrustB2C";
import { LandingLocationB2C } from "@/components/landing/LandingLocationB2C";
import { LandingCtaB2C } from "@/components/landing/LandingCtaB2C";
import { LandingFooterB2C } from "@/components/landing/LandingFooterB2C";
import { FloatingWhatsApp } from "@/components/landing/FloatingWhatsApp";

// Optimized section order for maximum conversion:
// 1. Hero - Hook with urgency and social proof
// 2. Badges - Quick trust signals
// 3. Simulator - Primary conversion tool
// 4. Items - What they can pawn
// 5. Process - How it works (with images)
// 6. Trust - Stats and testimonials (builds confidence before CTA)
// 7. Location - Where to find us
// 8. CTA - Final push
// Removed: Referral (better for post-conversion)

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white overflow-x-hidden">
            <LandingNavbarB2C />
            <LandingHeroB2C />
            <LandingBadgesB2C />
            <LandingSimulatorB2C />
            <LandingItemsB2C />
            <LandingProcessB2C />
            <LandingTrustB2C />
            <LandingLocationB2C />
            <LandingCtaB2C />
            <LandingFooterB2C />
            <FloatingWhatsApp />
        </main>
    );
}
