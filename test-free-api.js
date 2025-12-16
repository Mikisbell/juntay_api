const dni = '43708661';

console.log('Testing Free API with DNI:', dni);

async function testApi() {
    try {
        const response = await fetch(`https://api.apis.net.pe/v1/dni?numero=${dni}`);
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testApi();
