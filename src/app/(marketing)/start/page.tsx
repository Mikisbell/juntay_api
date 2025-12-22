'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { onboardNewTenant } from '@/lib/actions/onboarding-actions'

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Form State
    const [formData, setFormData] = useState({
        adminEmail: '',
        adminPassword: '',
        companyName: '',
        ruc: '',
        plan: 'Free' as 'Free' | 'Pro'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await onboardNewTenant(formData)

            if (result.success) {
                // Redirect to login with success message query param
                router.push('/login?onboarding=success&email=' + encodeURIComponent(formData.adminEmail))
            } else {
                setError(result.error || 'Something went wrong.')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Step navigation
    const nextStep = () => {
        if (step === 1 && (!formData.adminEmail || !formData.adminPassword)) {
            setError('Please fill in all fields')
            return
        }
        setError('')
        setStep(step + 1)
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">

            {/* Header */}
            <div className="mb-8 text-center">
                <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gold-400 to-gold-200">
                    JUNTAY
                </Link>
                <h1 className="text-xl text-slate-400 mt-2">Setup your Secure Vault</h1>
            </div>

            {/* Card */}
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Gold Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50 blur-sm"></div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* STEP 1: Admin Account */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-white mb-4">1. Create Admin Account</h2>

                            <div>
                                <label className="block text-xs text-slate-500 uppercase font-medium mb-1">Email</label>
                                <input
                                    name="adminEmail"
                                    type="email"
                                    required
                                    value={formData.adminEmail}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                                    placeholder="admin@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-500 uppercase font-medium mb-1">Password</label>
                                <input
                                    name="adminPassword"
                                    type="password"
                                    required
                                    value={formData.adminPassword}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                                    placeholder="Secure Password"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={nextStep}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-lg transition-all mt-4"
                            >
                                Continue &rarr;
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Company Details */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-white mb-4">2. Company Details</h2>

                            <div>
                                <label className="block text-xs text-slate-500 uppercase font-medium mb-1">Company Name</label>
                                <input
                                    name="companyName"
                                    type="text"
                                    required
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                                    placeholder="My Pawn Shop S.A.C."
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-500 uppercase font-medium mb-1">RUC (Optional)</label>
                                <input
                                    name="ruc"
                                    type="text"
                                    value={formData.ruc}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors"
                                    placeholder="20123456789"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-bold py-3 rounded-lg shadow-lg shadow-gold-500/20 hover:scale-[1.02] transition-transform mt-6"
                            >
                                {loading ? 'Creating Vault...' : 'Launch JUNTAY'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-slate-500 py-2 text-sm hover:text-white transition-colors"
                            >
                                &larr; Back
                            </button>
                        </div>
                    )}

                </form>
            </div>
        </div>
    )
}
