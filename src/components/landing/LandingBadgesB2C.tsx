import { Shield, UserX, Clock, BadgeCheck } from "lucide-react";

const badges = [
    {
        icon: Shield,
        title: "Regulados por SBS",
        desc: "Resolución SBS N° 00270-2024",
        highlight: true,
    },
    {
        icon: UserX,
        title: "Sin Infocorp",
        desc: "No revisamos centrales de riesgo",
        highlight: true,
    },
    {
        icon: Clock,
        title: "5 Minutos",
        desc: "Desembolso inmediato",
        highlight: false,
    },
    {
        icon: BadgeCheck,
        title: "100% Seguro",
        desc: "Tu prenda asegurada",
        highlight: false,
    },
];

export function LandingBadgesB2C() {
    return (
        <section className="py-12 bg-[#1E3A5F]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {badges.map((badge) => (
                        <div
                            key={badge.title}
                            className={`text-center p-6 rounded-2xl ${badge.highlight
                                    ? "bg-[#D4AF37] text-[#1E3A5F]"
                                    : "bg-[#152C4A] text-white"
                                }`}
                        >
                            <badge.icon className={`w-10 h-10 mx-auto mb-3 ${badge.highlight ? "text-[#1E3A5F]" : "text-[#D4AF37]"
                                }`} />
                            <h3 className="font-bold text-lg mb-1">{badge.title}</h3>
                            <p className={`text-sm ${badge.highlight ? "text-[#1E3A5F]/80" : "text-gray-400"
                                }`}>
                                {badge.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
