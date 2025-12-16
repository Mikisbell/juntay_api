
import React from 'react'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react'

interface TrustScoreProps {
    score: number // 0 to 100
    level: 'VIP' | 'Regular' | 'Riesgoso' | 'Nuevo'
}

export function TrustScore({ score, level }: TrustScoreProps) {
    const data = [{ value: score }]

    // Determine color and icon based on score
    let color = '#22c55e' // Green
    let Icon = ShieldCheck
    let text = 'Confiable'

    if (score < 50) {
        color = '#ef4444' // Red
        Icon = ShieldAlert
        text = 'Riesgo Alto'
    } else if (score < 80) {
        color = '#eab308' // Yellow
        Icon = Shield
        text = 'Regular'
    }

    return (
        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={10} data={data} startAngle={180} endAngle={0}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar
                            background
                            dataKey="value"
                            angleAxisId={0}
                            fill={color}
                            cornerRadius={10}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                    <span className="text-3xl font-bold font-mono tracking-tighter" style={{ color }}>{score}</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">Puntaje</span>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-[-10px]">
                <Icon size={16} color={color} />
                <span className="text-sm font-medium text-slate-600">{level}</span>
            </div>
        </div>
    )
}
