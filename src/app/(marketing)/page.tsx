import { LandingHeroB2C } from "@/components/landing/LandingHeroB2C";
import { LandingTrustB2C } from "@/components/landing/LandingTrustB2C";
import { LandingItemsB2C } from "@/components/landing/LandingItemsB2C";
import { LandingProcessB2C } from "@/components/landing/LandingProcessB2C";
import { LandingSimulatorB2C } from "@/components/landing/LandingSimulatorB2C";
import { LandingLocationB2C } from "@/components/landing/LandingLocationB2C";

export default function LandingPage() {
    return (
        <div className="bg-white">
            <LandingHeroB2C />
            <LandingTrustB2C />
            <div id="assets">
                <LandingItemsB2C />
            </div>
            <div id="process">
                <LandingProcessB2C />
            </div>
            <LandingSimulatorB2C />
            <LandingLocationB2C />
        </div>
    );
}
