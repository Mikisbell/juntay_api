const token = process.env.CONSULTASPERU_TOKEN || '6d189ad58ba715e8198161a3cce4f26290a0d795fe8a72fae046801764a6d6d8';
const dni = '43708661';

console.log('Testing API with token:', token);
console.log('Testing DNI:', dni);

async function testApi() {
    try {
        const response = await fetch('https://api.consultasperu.com/api/v1/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                token: token,
                type_document: 'dni',
                document_number: dni,
            }),
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Raw Response:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

testApi();
