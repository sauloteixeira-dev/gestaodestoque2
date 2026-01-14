
const baseUrl = 'https://gestao-estoque-api.gestao-estoque-saulo.workers.dev';

async function testEndpoints() {
    try {
        console.log('Testing /saidas-estoque endpoint...');
        const response = await fetch(`${baseUrl}/saidas-estoque`);
        console.log('Saidas status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Saidas count:', data.length);
            if (data.length > 0) {
                console.log('First saida date (Most Recent):', data[0].data_saida);
                console.log('Last saida date (Oldest):', data[data.length - 1].data_saida);

                // Check if any is within 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const recents = data.filter(d => new Date(d.data_saida) > thirtyDaysAgo);
                console.log('Saidas in last 30 days:', recents.length);
            }
        } else {
            console.log('Error:', await response.text());
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testEndpoints();
