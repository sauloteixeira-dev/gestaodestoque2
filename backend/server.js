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

// Rota para adicionar um produto ou atualizar a quantidade
app.post('/produtos', async (req, res) => {
  const { codigo_barras, nome, quantidade } = req.body;

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

    res.status(201).json({ message: 'Operação de estoque realizada com sucesso!' });
  } catch (err) {
    console.error('Erro ao processar produto:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para dar baixa no estoque
app.post('/produtos/saida', async (req, res) => {
  const { produto_id, quantidade } = req.body;

  if (produto_id == null || quantidade == null || quantidade <= 0) {
    return res.status(400).json({ error: 'ID do produto e quantidade são obrigatórios e a quantidade deve ser positiva.' });
  }

  try {
    // Usando uma função RPC para encapsular a lógica da transação no Supabase
    const { error } = await supabase.rpc('dar_baixa_estoque', {
      p_produto_id: produto_id,
      p_quantidade: quantidade
    });

    if (error) {
        // Erros customizados da função podem ser tratados aqui
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

// Rota para excluir um produto
app.delete('/produtos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Primeiro, buscar os dados do produto antes de excluí-lo para o log
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

    // Excluir o produto
    const { error: errorExclusao } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (errorExclusao) throw errorExclusao;

    // Inserir o log da exclusão
    const { error: errorLog } = await supabase
      .from('logs_exclusao')
      .insert({
        produto_id: produto.id,
        produto_nome: produto.nome,
        produto_codigo_barras: produto.codigo_barras,
        produto_quantidade: produto.quantidade,
        usuario_exclusao: 'sistema' // Pode ser alterado para auth.uid() se tiver autenticação
      });

    if (errorLog) {
      console.error('Erro ao registrar log de exclusão:', errorLog);
      // Não falha a exclusão, mas registra o erro no console
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

// Rota para adicionar um novo local de saída
app.post('/locais-saida', async (req, res) => {
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

// Rota para registrar uma saída de estoque
app.post('/saidas-estoque', async (req, res) => {
  const { local_id, usuario_retirada, itens, observacoes } = req.body;

  if (!local_id || !usuario_retirada || !itens || itens.length === 0) {
    return res.status(400).json({ error: 'Dados incompletos para registrar saída.' });
  }

  try {
    // Iniciar a transação
    const { data: saida, error: errorSaida } = await supabase
      .from('saidas_estoque')
      .insert([{ local_id, usuario_retirada, observacoes }])
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

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}.`);
  console.log('Conectado ao Supabase.');
});

