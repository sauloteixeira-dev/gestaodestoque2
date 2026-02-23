import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

import { type Produto } from '../types';

interface ProdutoContextData {
  produtos: Produto[];
  loading: boolean;
  adicionarProduto: (codigoBarras: string, nome: string, quantidade: number, unidade?: string) => Promise<void>;
  darBaixaEstoque: (produtoId: number, quantidadeBaixa: number) => Promise<void>;
  darEntradaEstoque: (produto: Produto, quantidadeEntrada: number) => Promise<void>;
  excluirProduto: (produtoId: number) => Promise<void>;
  buscarProdutos: () => Promise<void>;
}

const ProdutoContext = createContext<ProdutoContextData>({} as ProdutoContextData);

export const ProdutoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao buscar produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const adicionarProduto = async (codigoBarras: string, nome: string, quantidade: number, unidade?: string) => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert({ codigo_barras: codigoBarras, nome, quantidade, unidade })
        .select()
        .single();

      if (error) throw error;

      // Registrar Entrada
      if (data) {
        let userId = null;
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (!sessionError && session?.user?.id) {
            userId = session.user.id;
          }
        } catch (e) {
          console.warn('Sessão não disponível para log de entrada:', e);
        }

        const { error: errorLog } = await supabase.from('entradas_estoque').insert({
          produto_id: data.id,
          quantidade: quantidade,
          motivo: 'Entrada Inicial',
          data_entrada: new Date().toISOString(),
          user_id: userId
        });

        if (errorLog) console.error('Erro ao inserir log:', errorLog);
      }

      await fetchProdutos();
      toast.success('Produto adicionado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar produto:', error);
      const errorMessage = error.message || 'Erro desconhecido ao adicionar produto.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const darBaixaEstoque = async (produtoId: number, quantidadeBaixa: number) => {
    try {
      // Nota: Baixa de estoque simplificada geralmente não registra log de saída complexo aqui,
      // mas se registrar, deve usar user_id também. 
      // Por enquanto, mantemos o update simples, mas vamos garantir que se houver log futuro, tenha user_id.

      const { error } = await supabase
        .from('produtos')
        .update({ quantidade: quantidadeBaixa })
        .eq('id', produtoId);

      if (error) throw error;

      // Atualizar localmente para melhor UX
      setProdutos(prev => prev.map(p =>
        p.id === produtoId
          ? { ...p, quantidade: Math.max(0, p.quantidade - quantidadeBaixa) }
          : p
      ));

      await fetchProdutos();
      toast.success('Estoque atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao dar baixa no estoque:', error);
      const errorMessage = error.message || 'Erro desconhecido ao dar baixa no estoque.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const darEntradaEstoque = async (produto: Produto, quantidadeEntrada: number) => {
    try {
      // Calcular nova quantidade (soma ao estoque atual)
      const novaQuantidade = produto.quantidade + quantidadeEntrada;

      const { error } = await supabase
        .from('produtos')
        .update({ quantidade: novaQuantidade })
        .eq('id', produto.id);

      if (error) throw error;

      let userId = null;
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!sessionError && session?.user?.id) {
          userId = session.user.id;
        }
      } catch (e) {
        console.warn('Sessão não disponível para log de entrada:', e);
      }

      // Registrar Entrada
      const { error: errorLog } = await supabase.from('entradas_estoque').insert({
        produto_id: produto.id,
        quantidade: quantidadeEntrada,
        motivo: 'Entrada Manual (Atualização)',
        data_entrada: new Date().toISOString(),
        user_id: userId
      });

      if (errorLog) console.error('Erro ao inserir log de entrada (update):', errorLog);

      // Atualizar localmente para melhor UX
      setProdutos(prev => prev.map(p =>
        p.id === produto.id
          ? { ...p, quantidade: novaQuantidade }
          : p
      ));

      await fetchProdutos();
      toast.success('Entrada no estoque realizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao dar entrada no estoque:', error);
      const errorMessage = error.message || 'Erro desconhecido ao dar entrada no estoque.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const excluirProduto = async (produtoId: number) => {
    try {
      // Primeiro, registrar na tabela de logs de exclusão
      const { data: produto } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', produtoId)
        .single();

      if (produto) {
        await supabase
          .from('logs_exclusao')
          .insert({
            produto_id: produto.id,
            produto_codigo_barras: produto.codigo_barras,
            produto_nome: produto.nome,
            produto_quantidade: produto.quantidade,
            motivo: 'Produto excluído do sistema'
          });
      }

      // Agora excluir o produto
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', produtoId);

      if (error) throw error;

      await fetchProdutos();
      toast.success('Produto excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir produto:', error);

      if (error.code === '23502' || error.code === '23503') {
        toast.warning('Não é possível excluir este produto pois ele possui histórico de movimentações (saídas). Exclua as saídas primeiro.');
      } else {
        const errorMessage = error.message || 'Erro desconhecido ao excluir produto.';
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  return (
    <ProdutoContext.Provider value={{ produtos, loading, adicionarProduto, darBaixaEstoque, darEntradaEstoque, excluirProduto, buscarProdutos: fetchProdutos }}>
      {children}
    </ProdutoContext.Provider>
  );
};

export const useProdutos = () => {
  return useContext(ProdutoContext);
};
