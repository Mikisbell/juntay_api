'use server'

// URL de tu servidor Oracle (HTTP)
// En el futuro esto irá en .env, pero por ahora lo usamos directo para probar
const WAHA_URL = "http://129.151.98.218:3000";
const API_KEY = "juntay123";
const SESSION_NAME = "default";

/**
 * Obtiene el estado de la sesión de WhatsApp
 */
export async function getWahaSession() {
    try {
        // Primero verificamos si la sesión existe
        const response = await fetch(`${WAHA_URL}/api/sessions/${SESSION_NAME}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': API_KEY
            },
            cache: 'no-store'
        });

        if (response.status === 404) {
            // Si no existe, la creamos
            console.log("Session not found, creating new one...");
            await createSession();
            return { success: true, data: { status: 'CREATING' } };
        }

        if (!response.ok) {
            throw new Error(`Error conectando con WAHA: ${response.statusText}`);
        }

        const data = await response.json();

        // Si la sesión existe pero está STOPPED, la iniciamos
        if (data.status === 'STOPPED') {
            console.log("Session is STOPPED, starting...");
            await startExistingSession();
            return { success: true, data: { ...data, status: 'STARTING' } };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching WAHA session:", error);
        return { success: false, error: "No se pudo conectar con el servidor de WhatsApp" };
    }
}

/**
 * Obtiene el código QR de WhatsApp
 */
export async function getWahaScreenshot() {
    try {
        // Usamos el endpoint específico para obtener SOLO el QR
        // Este endpoint retorna la imagen PNG del QR directamente
        const response = await fetch(`${WAHA_URL}/api/${SESSION_NAME}/auth/qr`, {
            method: 'GET',
            headers: {
                'X-Api-Key': API_KEY,
                'Accept': 'image/png'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            // Si falla, verificamos el estado de la sesión
            const sessionCheck = await getWahaSession();
            if (sessionCheck.success && sessionCheck.data?.status === 'STOPPED') {
                return { success: false, error: "Iniciando sesión de WhatsApp..." };
            }
            return { success: false, error: "Esperando código QR..." };
        }

        // Convertir la imagen blob a base64 para enviarla al cliente
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        return { success: true, image: `data:image/png;base64,${base64}` };

    } catch (error) {
        console.error("Error fetching QR:", error);
        return { success: false, error: "Error obteniendo código QR" };
    }
}

/**
 * Enviar mensaje de WhatsApp a un número
 */
export async function sendMessage(numero: string, mensaje: string) {
    'use server'

    try {
        // Formatear número: 51XXXXXXXXX@c.us
        const cleanNumber = numero.replace(/\D/g, '');
        const chatId = cleanNumber.startsWith('51')
            ? `${cleanNumber}@c.us`
            : `51${cleanNumber}@c.us`;

        // Usar endpoint sendText en lugar de chats/messages
        const response = await fetch(`${WAHA_URL}/api/sendText`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': API_KEY
            },
            body: JSON.stringify({
                session: 'default',
                chatId: chatId,
                text: mensaje
            }),
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error WAHA sendMessage:', errorText);
            throw new Error(`WAHA Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ WhatsApp message sent successfully:', chatId);
        return { success: true, data };

    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
        return { success: false, error: "Error enviando mensaje de WhatsApp" };
    }
}


/**
 * Crea una nueva sesión de WhatsApp
 */
async function createSession() {
    try {
        const response = await fetch(`${WAHA_URL}/api/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': API_KEY
            },
            body: JSON.stringify({
                name: SESSION_NAME,
                config: {
                    proxy: null,
                    noweb: {
                        store: {
                            enabled: true
                        }
                    }
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Error creating session:", error);
            throw new Error(error);
        }

        return { success: true };
    } catch (error) {
        console.error("Error in createSession:", error);
        return { success: false, error };
    }
}

/**
 * Inicia una sesión existente que está en estado STOPPED
 */
async function startExistingSession() {
    try {
        const response = await fetch(`${WAHA_URL}/api/sessions/${SESSION_NAME}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': API_KEY
            }
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Error starting session:", error);
            throw new Error(error);
        }

        return { success: true };
    } catch (error) {
        console.error("Error in startExistingSession:", error);
        return { success: false, error };
    }
}
