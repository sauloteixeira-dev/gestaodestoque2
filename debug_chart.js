
const saidas = [
    { data_saida: '2026-01-13T23:00:21.000Z', itens: [{ quantidade: 5 }] },
    { data_saida: '2026-01-10T15:00:00.000Z', itens: [{ quantidade: 10 }] }
];

const entradas = [
    { data_entrada: '2026-01-13T23:00:21.000Z', quantidade: 20 }
];

const days = 30;
const dataMap = new Map();
const today = new Date(); // Simulates execution time

console.log('Today:', today.toISOString());

// 1. Initialize Map
for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    dataMap.set(dateStr, { entrada: 0, saida: 0 });
    // console.log(`Init Key: ${dateStr} (from ${d.toISOString()})`);
}

// 2. Process Saidas
saidas.forEach(saida => {
    if (!saida.data_saida) return;
    const date = new Date(saida.data_saida);
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    console.log(`Processing Saida: ${saida.data_saida} -> Key: ${dateStr}`);

    if (dataMap.has(dateStr)) {
        const current = dataMap.get(dateStr);
        const totalItems = saida.itens.reduce((acc, item) => acc + item.quantidade, 0);
        dataMap.set(dateStr, { ...current, saida: current.saida + totalItems });
        console.log(`Matched! New Total:`, dataMap.get(dateStr));
    } else {
        console.log('No match for key:', dateStr);
    }
});
