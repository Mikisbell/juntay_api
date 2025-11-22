const API_KEY = 'Juntay_Secret_Key_2025';
const url = 'https://whatsapp-juntay.onrender.com/api/sendText';

async function test() {
    console.log('🚀 Iniciando prueba de conexión con Render...');
    console.log('URL:', url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': API_KEY,
            },
            body: JSON.stringify({
                session: 'default',
                chatId: '51943818788@c.us', // Número de prueba del historial
                text: '🔔 Test de conexión desde Juntay API (Terminal) - Si lees esto, la integración funciona.',
            }),
        });

        console.log('Status:', response.status);

        if (!response.ok) {
            const text = await response.text();
            console.error('❌ Error del servidor:', text);
        } else {
            const json = await response.json();
            console.log('✅ Éxito! Respuesta:', JSON.stringify(json, null, 2));
        }
    } catch (e) {
        console.error('❌ Error de ejecución:', e.message);
        if (e.cause) console.error('Causa:', e.cause);
    }
}

test();
