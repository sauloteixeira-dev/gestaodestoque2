import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient, User } from '@supabase/supabase-js';

type Bindings = {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_KEY: string;
};

type Variables = {
    user: User;
};

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();

// Middleware CORS
app.use('/*', cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://gestao-estoque-five.vercel.app',
        'https://gestao-estoque-git-cloudflare-workers-saulo-teixeiras-projects.vercel.app',
        'https://gestao-estoque-saulo-teixeiras-projects.vercel.app'
    ],
    credentials: true,
}));

// Middleware de Autenticação
const authenticateUser = async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
        return c.json({ error: 'Token de autenticação não fornecido.' }, 401);
    }

    const token = authHeader.split(' ')[1];
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_SERVICE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return c.json({ error: 'Token inválido ou expirado.' }, 401);
        }

        c.set('user', user);
        await next();
    } catch (err) {
        console.error('Erro na autenticação:', err);
        return c.json({ error: 'Erro interno na validação do token.' }, 500);
    }
};

// Helper para criar cliente Supabase
const getSupabase = (c: any) => {
    return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY);
};

// Rota raiz
app.get('/', (c) => {
    return c.json({ message: 'API Gestão de Estoque - Cloudflare Workers' });
});

// Rota para buscar todos os produtos
app.get('/produtos', async (c) => {
    const supabase = getSupabase(c);
    try {
        const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .order('nome', { ascending: true });

        if (error) throw error;
        return c.json(data);
    } catch (err: any) {
        console.error('Erro ao buscar produtos:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para adicionar um produto ou atualizar a quantidade (Protegida)
app.post('/produtos', authenticateUser, async (c) => {
    const supabase = getSupabase(c);
    const { codigo_barras, nome, quantidade } = await c.req.json();
    const user = c.get('user');

    if (!codigo_barras || !nome || quantidade == null || quantidade <= 0) {
        return c.json({ error: 'Todos os campos são obrigatórios e a quantidade deve ser positiva.' }, 400);
    }

    try {
        const { error } = await supabase.rpc('adicionar_ou_atualizar_produto', {
            p_codigo_barras: codigo_barras,
            p_nome: nome,
            p_quantidade: quantidade
        });

        if (error) throw error;

        const { data: prod, error: errorBusca } = await supabase
            .from('produtos')
            .select('id, nome')
            .eq('codigo_barras', codigo_barras)
            .single();

        if (errorBusca) {
            console.error('Erro ao buscar produto para log:', errorBusca);
        } else if (prod) {
            const { error: errorLog } = await supabase.from('entradas_estoque').insert({
                produto_id: prod.id,
                quantidade: quantidade,
                motivo: 'Entrada Manual',
                data_entrada: new Date().toISOString(),
                user_id: user.id
            });

            if (errorLog) console.error('Erro ao inserir log de entrada:', errorLog);
        }

        return c.json({ message: 'Operação de estoque realizada com sucesso!' }, 201);
    } catch (err: any) {
        console.error('Erro ao processar produto:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para dar baixa no estoque (Protegida)
app.post('/produtos/saida', authenticateUser, async (c) => {
    const supabase = getSupabase(c);
    const { produto_id, quantidade } = await c.req.json();

    if (produto_id == null || quantidade == null || quantidade <= 0) {
        return c.json({ error: 'ID do produto e quantidade são obrigatórios e a quantidade deve ser positiva.' }, 400);
    }

    try {
        const { error } = await supabase.rpc('dar_baixa_estoque', {
            p_produto_id: produto_id,
            p_quantidade: quantidade
        });

        if (error) {
            if (error.message.includes('Produto não encontrado') || error.message.includes('Estoque insuficiente')) {
                return c.json({ error: error.message }, 400);
            }
            throw error;
        }

        return c.json({ message: 'Baixa no estoque realizada com sucesso!' }, 200);
    } catch (err: any) {
        console.error('Erro ao dar baixa no estoque:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para excluir um produto (Protegida)
app.delete('/produtos/:id', authenticateUser, async (c) => {
    const supabase = getSupabase(c);
    const id = c.req.param('id');
    const user = c.get('user');

    try {
        const { data: produto, error: errorBusca } = await supabase
            .from('produtos')
            .select('*')
            .eq('id', id)
            .single();

        if (errorBusca) {
            if (errorBusca.code === 'PGRST116') {
                return c.json({ error: 'Produto não encontrado.' }, 404);
            }
            throw errorBusca;
        }

        const { error: errorExclusao } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);

        if (errorExclusao) throw errorExclusao;

        const { error: errorLog } = await supabase
            .from('logs_exclusao')
            .insert({
                produto_id: produto.id,
                produto_nome: produto.nome,
                produto_codigo_barras: produto.codigo_barras,
                produto_quantidade: produto.quantidade,
                usuario_exclusao: 'sistema',
                user_id: user.id
            });

        if (errorLog) {
            console.error('Erro ao registrar log de exclusão:', errorLog);
        }

        return c.json({ message: 'Produto excluído com sucesso!' }, 200);
    } catch (err: any) {
        console.error('Erro ao excluir produto:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para buscar todos os locais de saída
app.get('/locais-saida', async (c) => {
    const supabase = getSupabase(c);
    try {
        const { data, error } = await supabase
            .from('locais_saida')
            .select('*')
            .order('nome', { ascending: true });

        if (error) throw error;
        return c.json(data);
    } catch (err: any) {
        console.error('Erro ao buscar locais de saída:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para adicionar um novo local de saída (Protegida)
app.post('/locais-saida', authenticateUser, async (c) => {
    const supabase = getSupabase(c);
    const { nome, descricao } = await c.req.json();

    if (!nome) {
        return c.json({ error: 'Nome do local é obrigatório.' }, 400);
    }

    try {
        const { data, error } = await supabase
            .from('locais_saida')
            .insert([{ nome, descricao }])
            .select();

        if (error) throw error;
        return c.json(data[0], 201);
    } catch (err: any) {
        console.error('Erro ao adicionar local de saída:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para registrar uma saída de estoque (Protegida)
app.post('/saidas-estoque', authenticateUser, async (c) => {
    const supabase = getSupabase(c);
    const { local_id, usuario_retirada, itens, observacoes } = await c.req.json();
    const user = c.get('user');

    if (!local_id || !usuario_retirada || !itens || itens.length === 0) {
        return c.json({ error: 'Dados incompletos para registrar saída.' }, 400);
    }

    try {
        const { data: saida, error: errorSaida } = await supabase
            .from('saidas_estoque')
            .insert([{ local_id, usuario_retirada, observacoes, user_id: user.id }])
            .select()
            .single();

        if (errorSaida) throw errorSaida;

        for (const item of itens) {
            const { data: produto, error: errorBusca } = await supabase
                .from('produtos')
                .select('*')
                .eq('id', item.produto_id)
                .single();

            if (errorBusca) throw errorBusca;

            if (produto.quantidade < item.quantidade) {
                throw new Error(`Estoque insuficiente para o produto ${produto.nome}`);
            }

            const { error: errorBaixa } = await supabase.rpc('dar_baixa_estoque', {
                p_produto_id: item.produto_id,
                p_quantidade: item.quantidade
            });

            if (errorBaixa) throw errorBaixa;

            const { error: errorItem } = await supabase
                .from('itens_saida')
                .insert([{
                    saida_id: saida.id,
                    produto_id: item.produto_id,
                    produto_nome: produto.nome,
                    produto_codigo_barras: produto.codigo_barras,
                    quantidade: item.quantidade,
                    produto_quantidade_antes: produto.quantidade
                }]);

            if (errorItem) throw errorItem;
        }

        return c.json({ message: 'Saída registrada com sucesso!', saida_id: saida.id }, 201);
    } catch (err: any) {
        console.error('Erro ao registrar saída:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para buscar histórico de saídas
app.get('/saidas-estoque', async (c) => {
    const supabase = getSupabase(c);
    try {
        const { data, error } = await supabase
            .from('saidas_estoque')
            .select(`
        *,
        local:locais_saida(nome),
        itens:itens_saida(*)
      `)
            .order('data_saida', { ascending: false });

        if (error) throw error;
        return c.json(data);
    } catch (err: any) {
        console.error('Erro ao buscar saídas:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para buscar logs de exclusão
app.get('/logs-exclusao', async (c) => {
    const supabase = getSupabase(c);
    try {
        const { data, error } = await supabase
            .from('logs_exclusao')
            .select('*')
            .order('data_exclusao', { ascending: false });

        if (error) throw error;
        return c.json(data);
    } catch (err: any) {
        console.error('Erro ao buscar logs de exclusão:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para entrada de estoque via Nota Fiscal (Lote)
app.post('/api/entrada-estoque', async (c) => {
    const supabase = getSupabase(c);
    const { produtos } = await c.req.json();

    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
        return c.json({ error: 'Lista de produtos inválida.' }, 400);
    }

    try {
        const resultados = [];
        const erros = [];

        for (const item of produtos) {
            const { data: produtoExistente, error: errorBusca } = await supabase
                .from('produtos')
                .select('*')
                .eq('nome', item.nome)
                .maybeSingle();

            if (errorBusca) {
                erros.push({ item: item.nome, error: errorBusca.message });
                continue;
            }

            if (produtoExistente) {
                const novaQuantidade = (produtoExistente.quantidade || 0) + item.quantidade;
                const { error: errorUpdate } = await supabase
                    .from('produtos')
                    .update({ quantidade: novaQuantidade })
                    .eq('id', produtoExistente.id);

                if (errorUpdate) {
                    erros.push({ item: item.nome, error: errorUpdate.message });
                } else {
                    resultados.push({ item: item.nome, status: 'atualizado', nova_quantidade: novaQuantidade });

                    await supabase.from('entradas_estoque').insert({
                        produto_id: produtoExistente.id,
                        quantidade: item.quantidade,
                        motivo: 'Importação NFe'
                    });
                }
            } else {
                const { data: novoProdutoData, error: errorInsert } = await supabase
                    .from('produtos')
                    .insert([{
                        nome: item.nome,
                        quantidade: item.quantidade,
                        codigo_barras: item.codigo,
                    }])
                    .select()
                    .single();

                if (errorInsert) {
                    erros.push({ item: item.nome, error: errorInsert.message });
                } else {
                    resultados.push({ item: item.nome, status: 'criado', quantidade: item.quantidade });

                    if (novoProdutoData) {
                        await supabase.from('entradas_estoque').insert({
                            produto_id: novoProdutoData.id,
                            quantidade: item.quantidade,
                            motivo: 'Importação NFe'
                        });
                    }
                }
            }
        }

        if (erros.length > 0 && resultados.length === 0) {
            return c.json({ error: 'Falha ao processar todos os itens.', detalhes: erros }, 500);
        }

        return c.json({
            message: 'Processamento concluído.',
            resultados,
            erros_parciais: erros.length > 0 ? erros : undefined
        }, 200);

    } catch (err: any) {
        console.error('Erro ao processar entrada de estoque:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para buscar histórico de entradas
app.get('/entradas-estoque', async (c) => {
    const supabase = getSupabase(c);
    try {
        const { data: entradas, error } = await supabase
            .from('entradas_estoque')
            .select(`
        *,
        produto:produtos(nome, codigo_barras)
      `)
            .order('data_entrada', { ascending: false });

        if (error) throw error;

        const userIds = [...new Set(entradas.map(e => e.user_id).filter(Boolean))];

        let profilesMap = new Map();
        if (userIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, nickname, email')
                .in('id', userIds);

            if (!profilesError && profiles) {
                profilesMap = new Map(profiles.map(p => [p.id, p]));
            }
        }

        const entradasEnriquecidas = entradas.map(entrada => {
            const profile = profilesMap.get(entrada.user_id);
            const nomeUsuario = profile ? (profile.nickname || profile.email) : 'Usuário desconhecido';
            return {
                ...entrada,
                usuario_entrada: nomeUsuario
            };
        });

        return c.json(entradasEnriquecidas);
    } catch (err: any) {
        console.error('Erro ao buscar entradas:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Exporta a aplicação Hono
export default app;
