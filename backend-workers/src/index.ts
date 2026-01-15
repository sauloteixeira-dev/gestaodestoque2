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
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
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
    const { codigo_barras, nome, quantidade, unidade } = await c.req.json();
    const user = c.get('user');

    if (!codigo_barras || !nome || quantidade == null || quantidade <= 0) {
        return c.json({ error: 'Todos os campos são obrigatórios e a quantidade deve ser positiva.' }, 400);
    }

    try {
        const { error } = await supabase.rpc('adicionar_ou_atualizar_produto', {
            p_codigo_barras: codigo_barras,
            p_nome: nome,
            p_quantidade: quantidade,
            p_unidade: unidade || null
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
                    produto_nome: produto.unidade ? `${produto.nome} ${produto.unidade}` : produto.nome,
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
        itens:itens_saida(*, produto:produtos(unidade)),
        devolucoes:devolucoes(*, itens:itens_devolucao(*, produto:produtos(unidade)))
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
                        unidade: item.unidade,
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

// ===================================================
// ROTAS DE DEVOLUÇÃO
// ===================================================

// Rota para criar uma devolução (Protegida)
app.post('/devolucoes', authenticateUser, async (c) => {
    const supabase = getSupabase(c);
    const { saida_id, observacao, itens } = await c.req.json();
    const user = c.get('user');

    // Validações básicas
    if (!saida_id || !itens || !Array.isArray(itens) || itens.length === 0) {
        return c.json({ error: 'Dados incompletos. É necessário informar a saída e os itens a devolver.' }, 400);
    }

    try {
        // 1. Verificar se a saída existe
        const { data: saida, error: errorSaida } = await supabase
            .from('saidas_estoque')
            .select('*')
            .eq('id', saida_id)
            .single();

        if (errorSaida || !saida) {
            return c.json({ error: 'Saída não encontrada.' }, 404);
        }

        // 2. Buscar itens da saída original
        const { data: itensSaida, error: errorItensSaida } = await supabase
            .from('itens_saida')
            .select('*')
            .eq('saida_id', saida_id);

        if (errorItensSaida) throw errorItensSaida;

        // 3. OTIMIZAÇÃO: Buscar todas as devoluções anteriores para os itens desta saída de uma vez
        const itemSaidaIds = itensSaida?.map(i => i.id) || [];
        const { data: todasDevolucoesAnteriores, error: errorDevAnt } = await supabase
            .from('itens_devolucao')
            .select('item_saida_id, quantidade_devolvida')
            .in('item_saida_id', itemSaidaIds);

        if (errorDevAnt) throw errorDevAnt;

        // Agrupar quantidades devolvidas por item_saida_id para fácil consulta
        const resumoDevolucoes = (todasDevolucoesAnteriores || []).reduce((acc: any, curr) => {
            acc[curr.item_saida_id] = (acc[curr.item_saida_id] || 0) + curr.quantidade_devolvida;
            return acc;
        }, {});

        // 4. Validar cada item a ser devolvido
        for (const itemDevolucao of itens) {
            const itemOriginal = itensSaida?.find(i => i.id === itemDevolucao.item_saida_id);
            if (!itemOriginal) {
                return c.json({ error: `Item de saída ${itemDevolucao.item_saida_id} não encontrado nesta saída.` }, 400);
            }

            const totalJaDevolvido = resumoDevolucoes[itemDevolucao.item_saida_id] || 0;
            const quantidadeDisponivel = itemOriginal.quantidade - totalJaDevolvido;

            if (itemDevolucao.quantidade_devolvida <= 0) {
                return c.json({ error: `Quantidade de devolução deve ser maior que zero para o produto ${itemOriginal.produto_nome}.` }, 400);
            }

            if (itemDevolucao.quantidade_devolvida > quantidadeDisponivel) {
                return c.json({
                    error: `Quantidade de devolução (${itemDevolucao.quantidade_devolvida}) excede a disponível (${quantidadeDisponivel}) para o produto ${itemOriginal.produto_nome}.`
                }, 400);
            }
        }

        // 5. Criar registro de devolução
        const { data: devolucao, error: errorDevolucao } = await supabase
            .from('devolucoes')
            .insert([{
                saida_id,
                observacao,
                user_id: user.id,
                comprovante_numero: '' // Preenchido pelo trigger
            }])
            .select()
            .single();

        if (errorDevolucao) throw errorDevolucao;

        // 6. OTIMIZAÇÃO: Buscar todos os produtos envolvidos de uma vez
        const produtoIds = [...new Set(itens.map(i => i.produto_id))];
        const { data: produtosAtuais, error: errorProdutos } = await supabase
            .from('produtos')
            .select('*')
            .in('id', produtoIds);

        if (errorProdutos) throw errorProdutos;

        const produtosMap = new Map(produtosAtuais?.map(p => [p.id, p]));
        const itensParaInserir = [];
        let totalItensDevolvidos = 0;

        // 7. Processar cada item e preparar inserção/atualização
        for (const itemDevolucao of itens) {
            const produto = produtosMap.get(itemDevolucao.produto_id);
            if (!produto) continue;

            // Registrar registro de devolução
            itensParaInserir.push({
                devolucao_id: devolucao.id,
                item_saida_id: itemDevolucao.item_saida_id,
                produto_id: itemDevolucao.produto_id,
                produto_nome: produto.unidade ? `${produto.nome} ${produto.unidade}` : produto.nome,
                produto_codigo_barras: produto.codigo_barras,
                quantidade_devolvida: itemDevolucao.quantidade_devolvida,
                motivo: itemDevolucao.motivo
            });

            // Atualizar estoque (ainda um por um para segurança, mas podemos otimizar mais no futuro)
            const novaQuantidade = produto.quantidade + itemDevolucao.quantidade_devolvida;
            await supabase
                .from('produtos')
                .update({ quantidade: novaQuantidade })
                .eq('id', itemDevolucao.produto_id);

            totalItensDevolvidos += itemDevolucao.quantidade_devolvida;
        }

        // 8. OTIMIZAÇÃO: Inserir todos os itens da devolução em um único comando
        if (itensParaInserir.length > 0) {
            const { error: errorBulkInsert } = await supabase
                .from('itens_devolucao')
                .insert(itensParaInserir);

            if (errorBulkInsert) throw errorBulkInsert;
        }

        // 9. Atualizar saída
        const { error: errorUpdateSaida } = await supabase
            .from('saidas_estoque')
            .update({
                tem_devolucao: true,
                total_itens_devolvidos: (saida.total_itens_devolvidos || 0) + totalItensDevolvidos
            })
            .eq('id', saida_id);

        if (errorUpdateSaida) throw errorUpdateSaida;

        return c.json({
            message: 'Devolução processada com sucesso!',
            devolucao_id: devolucao.id,
            comprovante_numero: devolucao.comprovante_numero
        }, 201);

    } catch (err: any) {
        console.error('Erro ao processar devolução:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para listar todas as devoluções
app.get('/devolucoes', async (c) => {
    const supabase = getSupabase(c);
    try {
        const { data: devolucoes, error } = await supabase
            .from('devolucoes')
            .select(`
                *,
                saida:saidas_estoque(
                    id,
                    data_saida,
                    usuario_retirada,
                    local:locais_saida(nome)
                ),
                itens:itens_devolucao(*, produto:produtos(unidade))
            `)
            .order('data_devolucao', { ascending: false });

        if (error) throw error;

        // Enriquecer com informações de usuário
        const userIds = [...new Set(devolucoes.map(d => d.user_id).filter(Boolean))];

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

        const devolucoesEnriquecidas = devolucoes.map(devolucao => {
            const profile = profilesMap.get(devolucao.user_id);
            const nomeUsuario = profile ? (profile.nickname || profile.email) : 'Usuário desconhecido';
            return {
                ...devolucao,
                usuario: {
                    nickname: profile?.nickname,
                    email: profile?.email,
                    nome: nomeUsuario
                }
            };
        });

        return c.json(devolucoesEnriquecidas);
    } catch (err: any) {
        console.error('Erro ao buscar devoluções:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para buscar detalhes de uma devolução específica
app.get('/devolucoes/:id', async (c) => {
    const supabase = getSupabase(c);
    const id = c.req.param('id');

    try {
        const { data: devolucao, error } = await supabase
            .from('devolucoes')
            .select(`
                *,
                saida:saidas_estoque(
                    *,
                    local:locais_saida(nome)
                ),
                itens:itens_devolucao(*, produto:produtos(unidade))
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return c.json({ error: 'Devolução não encontrada.' }, 404);
            }
            throw error;
        }

        // Buscar informações do usuário
        if (devolucao.user_id) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('nickname, email')
                .eq('id', devolucao.user_id)
                .single();

            if (profile) {
                devolucao.usuario = {
                    nickname: profile.nickname,
                    email: profile.email,
                    nome: profile.nickname || profile.email
                };
            }
        }

        return c.json(devolucao);
    } catch (err: any) {
        console.error('Erro ao buscar devolução:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Rota para validar se uma saída pode ter devolução
app.get('/saidas-estoque/:id/validar-devolucao', async (c) => {
    const supabase = getSupabase(c);
    const id = c.req.param('id');

    try {
        // Buscar a saída
        const { data: saida, error: errorSaida } = await supabase
            .from('saidas_estoque')
            .select('*')
            .eq('id', id)
            .single();

        if (errorSaida) {
            if (errorSaida.code === 'PGRST116') {
                return c.json({ error: 'Saída não encontrada.' }, 404);
            }
            throw errorSaida;
        }

        // Buscar itens da saída
        const { data: itensSaida, error: errorItens } = await supabase
            .from('itens_saida')
            .select('*')
            .eq('saida_id', id);

        if (errorItens) throw errorItens;

        if (!itensSaida || itensSaida.length === 0) {
            return c.json({
                pode_devolver: false,
                motivo: 'A saída não possui itens.',
                itens: []
            });
        }

        // Buscar TODAS as devoluções já feitas para os itens desta saída em uma única consulta
        const itemSaidaIds = itensSaida.map(i => i.id);
        const { data: todasDevolucoes, error: errorDevs } = await supabase
            .from('itens_devolucao')
            .select('item_saida_id, quantidade_devolvida')
            .in('item_saida_id', itemSaidaIds);

        if (errorDevs) throw errorDevs;

        // Criar um mapa de quantidades já devolvidas por item_saida_id
        const mapaDevolucoes = (todasDevolucoes || []).reduce((acc: any, dev) => {
            acc[dev.item_saida_id] = (acc[dev.item_saida_id] || 0) + dev.quantidade_devolvida;
            return acc;
        }, {});

        // Mapear os itens com a disponibilidade calculada
        const itensComDisponibilidade = itensSaida.map(item => {
            const totalJaDevolvido = mapaDevolucoes[item.id] || 0;
            const quantidadeDisponivel = item.quantidade - totalJaDevolvido;

            return {
                item_saida_id: item.id,
                produto_id: item.produto_id,
                produto_nome: item.produto_nome,
                produto_codigo_barras: item.produto_codigo_barras,
                quantidade_original: item.quantidade,
                quantidade_ja_devolvida: totalJaDevolvido,
                quantidade_disponivel_devolucao: quantidadeDisponivel
            };
        });

        // Verificar se há pelo menos um item com quantidade disponível
        const podeDevolver = itensComDisponibilidade.some(item => item.quantidade_disponivel_devolucao > 0);

        return c.json({
            pode_devolver: podeDevolver,
            motivo: podeDevolver ? null : 'Todos os itens desta saída já foram devolvidos.',
            saida_id: saida.id,
            itens: itensComDisponibilidade
        });

    } catch (err: any) {
        console.error('Erro ao validar devolução:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Exporta a aplicação Hono
export default app;
