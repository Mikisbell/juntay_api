export default function LandingPage() {
    return (
        <div className="relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-gold-600/5 blur-[100px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10 pt-20 pb-32 flex flex-col items-center text-center">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-sm text-gold-400 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
                    </span>
                    Nuevo: Gestión Multi-sucursal activada
                </div>

                {/* Hero Title */}
                <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl">
                    Protege tu Capital. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-700">
                        Escala tu Negocio.
                    </span>
                </h1>

                {/* Hero Subtitle */}
                <p className="mt-6 max-w-2xl text-lg text-white/60 md:text-xl">
                    El sistema operativo definitivo para casas de empeño modernas.
                    Control total de contratos, garantías y caja en una bóveda digital impenetrable.
                </p>

                {/* CTA Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button className="group relative px-8 py-4 bg-gold-500 rounded-full font-bold text-black hover:bg-gold-400 transition-all shadow-[0_0_20px_-5px_rgba(204,172,66,0.5)] hover:shadow-[0_0_30px_-5px_rgba(204,172,66,0.6)]">
                        <span className="relative z-10">Comenzar Prueba Gratis</span>
                    </button>

                    <button className="px-8 py-4 rounded-full font-medium text-white border border-white/20 hover:bg-white/5 transition-all backdrop-blur-sm">
                        Ver Demo en Vivo
                    </button>
                </div>

                {/* Mockup / Visual */}
                <div className="mt-20 w-full max-w-5xl relative group">
                    <div className="absolute -inset-1 bg-gradient-to-b from-gold-500/30 to-transparent rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl p-2 md:p-4 shadow-2xl">
                        {/* Fake Dashboard UI Header */}
                        <div className="flex items-center gap-4 mb-4 px-4 py-2 border-b border-white/5">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                            </div>
                            <div className="h-6 w-96 bg-white/5 rounded-md mx-auto"></div>
                        </div>
                        {/* Content Area Placeholder */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                            <div className="h-40 rounded-lg bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-4">
                                <div className="h-8 w-8 rounded-full bg-gold-500/20 mb-4"></div>
                                <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                                <div className="h-8 w-32 bg-white/20 rounded"></div>
                            </div>
                            <div className="h-40 rounded-lg bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-4">
                                <div className="h-8 w-8 rounded-full bg-blue-500/20 mb-4"></div>
                                <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                                <div className="h-8 w-32 bg-white/20 rounded"></div>
                            </div>
                            <div className="h-40 rounded-lg bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-4">
                                <div className="h-8 w-8 rounded-full bg-purple-500/20 mb-4"></div>
                                <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                                <div className="h-8 w-32 bg-white/20 rounded"></div>
                            </div>
                        </div>
                        {/* Table Mockup */}
                        <div className="mt-4 border-t border-white/5 pt-4">
                            <div className="space-y-3 p-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 w-full bg-white/5 rounded flex items-center px-4 justify-between">
                                        <div className="h-4 w-32 bg-white/10 rounded"></div>
                                        <div className="h-4 w-20 bg-gold-500/20 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
