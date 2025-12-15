'use server'

export async function checkRenderStatus() {
    try {
        // WAHA tiene un endpoint /api/sessions que lista las sesiones
        // Pero como ya tenemos la utility configurada, podemos intentar un "ping" simple
        // O mejor, usar el endpoint de screenshot que sabemos que existe y requiere auth
        // Si responde 200 OK (o imagen), estamos autenticados y el server corre.

        const apiKey = process.env.WHATSAPP_API_KEY || 'mikis123';
        const url = 'https://whatsapp-juntay.onrender.com/api/sessions?all=true';

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
            },
            cache: 'no-store'
        });

        if (response.ok) {
            const data = await response.json();
            // data es un array de sesiones. Buscamos 'default'.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const defaultSession = data.find((s: any) => s.name === 'default');

            if (defaultSession && defaultSession.status === 'WORKING') {
                return { connected: true, status: 'WORKING' };
            } else {
                return { connected: false, status: defaultSession?.status || 'UNKNOWN' };
            }
        } else {
            return { connected: false, error: `Error ${response.status}: ${response.statusText}` };
        }
    } catch (error) {
        console.error('Error checking Render status:', error);
        return { connected: false, error: 'Error de conexión con Render' };
    }
}
