async function testEndpoints() {
    const baseUrl = 'https://gestao-estoque-api.gestao-estoque-saulo.workers.dev';

    try {
        console.log('Testing root endpoint...');
        const rootRes = await fetch(`${baseUrl}/`);
        console.log('Root status:', rootRes.status);
        console.log('Root body:', await rootRes.text());

        console.log('\nTesting /produtos endpoint...');
        const produtosRes = await fetch(`${baseUrl}/produtos`);
        console.log('Produtos status:', produtosRes.status);
        if (produtosRes.ok) {
            const data = await produtosRes.json();
            console.log('Produtos count:', data.length);
            console.log('First product:', data[0] ? data[0].nome : 'No products');
        } else {
            console.log('Produtos error:', await produtosRes.text());
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testEndpoints();
