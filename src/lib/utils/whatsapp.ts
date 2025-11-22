
export async function enviarWhatsApp(celular: string, mensaje: string) {
    // Usamos API Key definida por el usuario
    const apiKey = process.env.WHATSAPP_API_KEY || 'mikis123';

    const url = 'https://whatsapp-juntay.onrender.com/api/sendText';

    try {
        // Asegurar que el número tenga el formato correcto para WAHA (51XXXXXXXXX@c.us)
        // Si el celular ya viene con 51, lo usamos, si no, lo agregamos.
        // Asumimos que el input es solo números.
        const cleanNumber = celular.replace(/\D/g, '');
        const chatId = cleanNumber.startsWith('51') ? `${cleanNumber}@c.us` : `51${cleanNumber}@c.us`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey, // <--- Autenticación por Key
            },
            body: JSON.stringify({
                session: 'default',
                chatId: chatId,
                text: mensaje,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response from WAHA:', errorText);
            throw new Error(`Error WAHA: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json(); // Éxito 🎉
    } catch (error) {
        console.error('Error enviando WhatsApp:', error);
        return null;
    }
}
