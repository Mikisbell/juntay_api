
const url = 'https://whatsapp-juntay.onrender.com/api/sendText';
const body = JSON.stringify({
    session: 'default',
    chatId: '51943818788@c.us',
    text: '🔔 Test Auth Probe',
});

async function tryAuth(name, headers) {
    console.log(`\n🔍 Probando: ${name}`);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body
        });
        console.log(`Status: ${res.status} ${res.statusText}`);
        if (res.ok) {
            console.log('✅ ÉXITO! Este es el método correcto.');
            const json = await res.json();
            console.log(json);
        } else {
            console.log('❌ Falló.');
            console.log(await res.text());
        }
    } catch (e) {
        console.log('💥 Error de red:', e.message);
    }
}

async function run() {
    // 1. Sin Auth
    await tryAuth('Sin Autenticación', {});

    // 2. Basic Auth (admin:mikis123)
    await tryAuth('Basic Auth (admin:mikis123)', {
        'Authorization': 'Basic YWRtaW46bWlraXMxMjM='
    });

    // 3. API Key (mikis123)
    await tryAuth('X-Api-Key: mikis123', {
        'X-Api-Key': 'mikis123'
    });

    // 4. API Key (admin)
    await tryAuth('X-Api-Key: admin', {
        'X-Api-Key': 'admin'
    });
    // 5. API Key (secret)
    await tryAuth('X-Api-Key: secret', { 'X-Api-Key': 'secret' });

    // 6. API Key (123456)
    await tryAuth('X-Api-Key: 123456', { 'X-Api-Key': '123456' });

    // 7. API Key (321)
    await tryAuth('X-Api-Key: 321', { 'X-Api-Key': '321' });
    // 8. API Key (Juntay_Secret_Key_2025) - LA NUEVA
    await tryAuth('X-Api-Key: Juntay_Secret_Key_2025', { 'X-Api-Key': 'Juntay_Secret_Key_2025' });
}

run();
