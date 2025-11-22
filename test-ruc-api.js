const ruc = '20100047218'; // RUC de ejemplo (Petroperu)

console.log('Testing Free API with RUC:', ruc);

async function testRucApi() {
    try {
        const response = await fetch(`https://api.apis.net.pe/v1/ruc?numero=${ruc}`);
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testRucApi();
