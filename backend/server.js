require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = 3001;

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(bodyParser.json());

// Middleware de Autenticação
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Erro na autenticação:', err);
    return res.status(500).json({ error: 'Erro interno na validação do token.' });
  }
};

// Rota para buscar todos os produtos
app.get('/produtos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para adicionar um produto ou atualizar a quantidade (Protegida)
app.post('/produtos', authenticateUser, async (req, res) => {
  const { codigo_barras, nome, quantidade } = req.body;
  const userId = req.user.id; // ID do usuário autenticado

  if (!codigo_barras || !nome || quantidade == null || quantidade <= 0) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios e a quantidade deve ser positiva.' });
  }

  try {
    // Usando uma função RPC para encapsular a lógica da transação no Supabase
    const { error } = await supabase.rpc('adicionar_ou_atualizar_produto', {
      p_codigo_barras: codigo_barras,
      p_nome: nome,
      p_quantidade: quantidade
    });

    if (error) throw error;

    // Busca o produto recém criado/atualizado para obter o ID
    const { data: prod, error: errorBusca } = await supabase
      .from('produtos')
      .select('id, nome')
      .eq('codigo_barras', codigo_barras)
      .single();

    if (errorBusca) {
      console.error('Erro ao buscar produto para log:', errorBusca);
    } else if (prod) {
      // Registra o log de entrada com user_id
      const { error: errorLog } = await supabase.from('entradas_estoque').insert({
        produto_id: prod.id,
        quantidade: quantidade,
        motivo: 'Entrada Manual',
        data_entrada: new Date().toISOString(),
        user_id: userId
      });

      if (errorLog) console.error('Erro ao inserir log de entrada:', errorLog);
    }

    res.status(201).json({ message: 'Operação de estoque realizada com sucesso!' });
  } catch (err) {
    console.error('Erro ao processar produto:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para dar baixa no estoque (Protegida)
app.post('/produtos/saida', authenticateUser, async (req, res) => {
  const { produto_id, quantidade } = req.body;

  if (produto_id == null || quantidade == null || quantidade <= 0) {
    return res.status(400).json({ error: 'ID do produto e quantidade são obrigatórios e a quantidade deve ser positiva.' });
  }

  try {
    const { error } = await supabase.rpc('dar_baixa_estoque', {
      p_produto_id: produto_id,
      p_quantidade: quantidade
    });

    if (error) {
      if (error.message.includes('Produto não encontrado') || error.message.includes('Estoque insuficiente')) {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }

    res.status(200).json({ message: 'Baixa no estoque realizada com sucesso!' });
  } catch (err) {
    console.error('Erro ao dar baixa no estoque:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para excluir um produto (Protegida)
app.delete('/produtos/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { data: produto, error: errorBusca } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single();

    if (errorBusca) {
      if (errorBusca.code === 'PGRST116') {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }
      throw errorBusca;
    }

    const { error: errorExclusao } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (errorExclusao) throw errorExclusao;

    // Inserir o log da exclusão com user_id
    const { error: errorLog } = await supabase
      .from('logs_exclusao')
      .insert({
        produto_id: produto.id,
        produto_nome: produto.nome,
        produto_codigo_barras: produto.codigo_barras,
        produto_quantidade: produto.quantidade,
        usuario_exclusao: 'sistema',
        user_id: userId
      });

    if (errorLog) {
      console.error('Erro ao registrar log de exclusão:', errorLog);
    }

    res.status(200).json({ message: 'Produto excluído com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir produto:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para buscar todos os locais de saída
app.get('/locais-saida', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locais_saida')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error('Erro ao buscar locais de saída:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para adicionar um novo local de saída (Protegida)
app.post('/locais-saida', authenticateUser, async (req, res) => {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome do local é obrigatório.' });
  }

  try {
    const { data, error } = await supabase
      .from('locais_saida')
      .insert([{ nome, descricao }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Erro ao adicionar local de saída:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para registrar uma saída de estoque (Protegida)
app.post('/saidas-estoque', authenticateUser, async (req, res) => {
  const { local_id, usuario_retirada, itens, observacoes } = req.body;
  const userId = req.user.id;

  if (!local_id || !usuario_retirada || !itens || itens.length === 0) {
    return res.status(400).json({ error: 'Dados incompletos para registrar saída.' });
  }

  try {
    // Iniciar a transação
    const { data: saida, error: errorSaida } = await supabase
      .from('saidas_estoque')
      .insert([{ local_id, usuario_retirada, observacoes, user_id: userId }])
      .select()
      .single();

    if (errorSaida) throw errorSaida;

    // Processar cada item da saída
    for (const item of itens) {
      // Buscar produto atual para obter dados e quantidade
      const { data: produto, error: errorBusca } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', item.produto_id)
        .single();

      if (errorBusca) throw errorBusca;

      // Verificar se há estoque suficiente
      if (produto.quantidade < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto ${produto.nome}`);
      }

      // Dar baixa no estoque
      const { error: errorBaixa } = await supabase.rpc('dar_baixa_estoque', {
        p_produto_id: item.produto_id,
        p_quantidade: item.quantidade
      });

      if (errorBaixa) throw errorBaixa;

      // Registrar item da saída
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

    res.status(201).json({ message: 'Saída registrada com sucesso!', saida_id: saida.id });
  } catch (err) {
    console.error('Erro ao registrar saída:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para buscar histórico de saídas
app.get('/saidas-estoque', async (req, res) => {
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
    res.status(200).json(data);
  } catch (err) {
    console.error('Erro ao buscar saídas:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para buscar logs de exclusão
app.get('/logs-exclusao', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('logs_exclusao')
      .select('*')
      .order('data_exclusao', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    console.error('Erro ao buscar logs de exclusão:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para entrada de estoque via Nota Fiscal (Lote)
app.post('/api/entrada-estoque', async (req, res) => {
  const { produtos } = req.body;
  // user_id removed as auth is not required for this route yet

  if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
    return res.status(400).json({ error: 'Lista de produtos inválida.' });
  }

  try {
    const resultados = [];
    const erros = [];

    for (const item of produtos) {
      // Tenta encontrar produto pelo nome (match exato por enquanto)
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
        // Atualiza quantidade
        const novaQuantidade = (produtoExistente.quantidade || 0) + item.quantidade;
        const { error: errorUpdate } = await supabase
          .from('produtos')
          .update({ quantidade: novaQuantidade })
          .eq('id', produtoExistente.id);

        if (errorUpdate) {
          erros.push({ item: item.nome, error: errorUpdate.message });
        } else {
          resultados.push({ item: item.nome, status: 'atualizado', nova_quantidade: novaQuantidade });

          // Log de Entrada para Produto Existente
          await supabase.from('entradas_estoque').insert({
            produto_id: produtoExistente.id,
            quantidade: item.quantidade,
            motivo: 'Importação NFe'
            // user_id removed
          });
        }
      } else {
        // Cria novo produto
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

          // Log de Entrada para Novo Produto
          if (novoProdutoData) {
            await supabase.from('entradas_estoque').insert({
              produto_id: novoProdutoData.id,
              quantidade: item.quantidade,
              motivo: 'Importação NFe'
              // user_id removed
            });
          }
        }
      }
    }

    if (erros.length > 0 && resultados.length === 0) {
      return res.status(500).json({ error: 'Falha ao processar todos os itens.', detalhes: erros });
    }

    res.status(200).json({
      message: 'Processamento concluído.',
      resultados,
      erros_parciais: erros.length > 0 ? erros : undefined
    });

  } catch (err) {
    console.error('Erro ao processar entrada de estoque:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para buscar histórico de entradas
app.get('/entradas-estoque', async (req, res) => {
  try {
    const { data: entradas, error } = await supabase
      .from('entradas_estoque')
      .select(`
        *,
        produto:produtos(nome, codigo_barras)
      `)
      .order('data_entrada', { ascending: false });

    if (error) throw error;

    // Buscar perfis dos usuários para obter nicknames
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

    // Enriquecer os dados com o nome do usuário/nickname
    const entradasEnriquecidas = entradas.map(entrada => {
      const profile = profilesMap.get(entrada.user_id);
      const nomeUsuario = profile ? (profile.nickname || profile.email) : 'Usuário desconhecido';
      return {
        ...entrada,
        usuario_entrada: nomeUsuario // Sobrescreve/define com o nome legível
      };
    });

    res.status(200).json(entradasEnriquecidas);
  } catch (err) {
    console.error('Erro ao buscar entradas:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/debug-entradas', async (req, res) => {
  const { data, error } = await supabase.from('entradas_estoque').select('*');
  res.json({ data, error });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}.`);
  console.log('Conectado ao Supabase.');
});
