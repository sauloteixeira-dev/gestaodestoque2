import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useProdutos } from './ProdutoContext';
import { toast } from 'react-toastify';

import { type LocalSaida, type SaidaEstoque, type ItemSaida } from '../types';

interface SaidaContextData {
  locais: LocalSaida[];
  saidas: SaidaEstoque[];
  loading: boolean;
  adicionarLocal: (nome: string, descricao?: string) => Promise<void>;
  removerLocal: (id: number) => Promise<void>;
  registrarSaida: (local_id: number, usuario_retirada: string, itens: ItemSaida[], observacoes?: string) => Promise<void>;
  buscarSaidas: () => Promise<void>;
}

const SaidaContext = createContext<SaidaContextData>({} as SaidaContextData);

export const SaidaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locais, setLocais] = useState<LocalSaida[]>([]);
  const [saidas, setSaidas] = useState<SaidaEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const { buscarProdutos } = useProdutos();

  const fetchLocais = async () => {
    try {

      const { data, error } = await supabase
        .from('locais_saida')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('[SaidaContext] Erro na query locais_saida:', error);
        console.error('[SaidaContext] Código do erro:', error.code);
        console.error('[SaidaContext] Mensagem:', error.message);
        console.error('[SaidaContext] Detalhes:', error.details);
        throw error;
      }


      setLocais(data || []);
    } catch (error: any) {
      console.error('[SaidaContext] Erro ao buscar locais:', error);
      // Não exibir toast se a tabela não existir - provável configuração inicial
      if (error.code === '42P01') {
        console.warn('[SaidaContext] Tabela locais_saida não existe. Execute o script fix_database.sql no Supabase.');
      } else if (error.code === 'PGRST301') {
        console.warn('[SaidaContext] Erro de permissão RLS. Verifique as políticas no Supabase.');
        toast.error('Erro de permissão ao acessar locais de saída.');
      } else {
        toast.error('Não foi possível carregar os locais de saída.');
      }
    }
  };

  const fetchSaidas = async () => {
    try {

      const { data, error } = await supabase
        .from('saidas_estoque')
        .select(`
          *,
          local:locais_saida(nome),
          itens:itens_saida(
            *,
            produto:produtos(nome, codigo_barras)
          ),
          devolucoes:devolucoes(
            *,
            itens:itens_devolucao(*)
          )
        `)
        .order('data_saida', { ascending: false });

      if (error) {
        console.error('[SaidaContext] Erro na query saidas_estoque:', error);
        console.error('[SaidaContext] Código do erro:', error.code);
        console.error('[SaidaContext] Mensagem:', error.message);
        throw error;
      }



      // Processar dados para o formato esperado
      const processedData = (data || []).map((saida: any) => ({
        ...saida,
        itens: saida.itens?.map((item: any) => ({
          produto_nome: item.produto?.nome || 'Produto não encontrado',
          produto_codigo_barras: item.produto?.codigo_barras || 'N/A',
          quantidade: item.quantidade,
          produto_quantidade_antes: item.produto_quantidade_antes || 0
        })) || []
      }));

      setSaidas(processedData);
    } catch (error: any) {
      console.error('[SaidaContext] Erro ao buscar saídas:', error);
      if (error.code !== '42P01') {
        toast.error('Erro ao buscar histórico de saídas.');
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLocais(), fetchSaidas()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const adicionarLocal = async (nome: string, descricao?: string) => {
    try {
      const { error } = await supabase
        .from('locais_saida')
        .insert({ nome, descricao });

      if (error) throw error;

      await fetchLocais();
      toast.success('Local adicionado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar local:', error);
      const errorMessage = error.message || 'Erro desconhecido ao adicionar local.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const removerLocal = async (id: number) => {
    try {
      const { error } = await supabase
        .from('locais_saida')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchLocais();
      toast.success('Local removido com sucesso!');
    } catch (error: any) {
      console.error('Erro ao remover local:', error);

      if (error.code === '23503') {
        toast.warning('Não é possível remover este local pois existem saídas registradas para ele.');
      } else {
        const errorMessage = error.message || 'Erro ao remover local.';
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const registrarSaida = async (local_id: number, usuario_retirada: string, itens: ItemSaida[], observacoes?: string) => {
    try {
      // Primeiro, criar a saída principal
      const { data: saidaData, error: saidaError } = await supabase
        .from('saidas_estoque')
        .insert({ local_id, usuario_retirada, observacoes })
        .select()
        .single();

      if (saidaError) throw saidaError;

      // Buscar dados dos produtos para preencher campos obrigatórios
      const produtoIds = itens.map(item => item.produto_id);
      const { data: produtos, error: produtosError } = await supabase
        .from('produtos')
        .select('id, nome, codigo_barras, quantidade')
        .in('id', produtoIds);

      if (produtosError) throw produtosError;

      // Criar mapa de produtos por ID
      const produtosMap = new Map(produtos?.map((p: any) => [p.id, p]) || []);

      // Montar itens para inserir com dados do produto
      const itensParaInserir = itens.map(item => {
        const produto: any = produtosMap.get(item.produto_id);
        return {
          saida_id: saidaData.id,
          produto_id: item.produto_id,
          produto_nome: produto?.nome || 'Produto não encontrado',
          produto_codigo_barras: produto?.codigo_barras || 'N/A',
          quantidade: item.quantidade,
          produto_quantidade_antes: produto?.quantidade || 0
        };
      });

      // Dar baixa no estoque para cada item
      for (const item of itens) {
        const { error: baixaError } = await supabase.rpc('dar_baixa_estoque', {
          p_produto_id: item.produto_id,
          p_quantidade: item.quantidade
        });

        if (baixaError) {
          console.error(`Erro ao dar baixa no produto ${item.produto_id}:`, baixaError);
          throw new Error(`Erro ao dar baixa no estoque: ${baixaError.message}`);
        }
      }

      const { error: itensError } = await supabase
        .from('itens_saida')
        .insert(itensParaInserir);

      if (itensError) throw itensError;

      await Promise.all([fetchLocais(), fetchSaidas(), buscarProdutos()]);
      toast.success('Saída registrada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao registrar saída:', error);
      const errorMessage = error.message || 'Erro desconhecido ao registrar saída.';
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <SaidaContext.Provider value={{ locais, saidas, loading, adicionarLocal, removerLocal, registrarSaida, buscarSaidas: fetchSaidas }}>
      {children}
    </SaidaContext.Provider>
  );
};

export const useSaida = () => {
  return useContext(SaidaContext);
};
