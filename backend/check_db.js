require('dotenv').config({ path: './backend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('KEY:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- Testing Relationship Query ---');
    console.log('--- Checking itens_saida columns ---');
    const { data, error } = await supabase
        .from('itens_saida')
        .select('*')
        .limit(1);

    if (error) {
        console.error('QUERY ERROR:', JSON.stringify(error, null, 2));
    } else {
        if (data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, cannot infer columns from data.');
        }
    }
}

check();
