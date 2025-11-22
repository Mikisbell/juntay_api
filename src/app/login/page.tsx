export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">JUNTAY</h1>
                    <p className="text-slate-600 mt-2">Sistema de Casa de Empeño</p>
                </div>

                <form action="/dashboard" method="get" className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            placeholder="usuario@juntay.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                        Iniciar Sesión
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Sistema seguro • v1.0
                </p>
            </div>
        </div>
    );
}
