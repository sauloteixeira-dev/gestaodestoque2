import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface LocalSaida {
  id: number;
  nome: string;
  descricao?: string;
  data_criacao: string;
}

interface ItemSaida {
  produto_id: number;
  quantidade: number;
}

interface SaidaEstoque {
  id: number;
  local_id: number;
  usuario_retirada: string;
  data_saida: string;
  observacoes?: string;
  local?: { nome: string };
  itens?: {
    produto_nome: string;
    produto_codigo_barras: string;
    quantidade: number;
    produto_quantidade_antes: number;
  }[];
}

interface SaidaContextData {
  locais: LocalSaida[];
  saidas: SaidaEstoque[];
  loading: boolean;
  adicionarLocal: (nome: string, descricao?: string) => Promise<void>;
  registrarSaida: (local_id: number, usuario_retirada: string, itens: ItemSaida[], observacoes?: string) => Promise<void>;
  buscarSaidas: () => Promise<void>;
}

const SaidaContext = createContext<SaidaContextData>({} as SaidaContextData);

export const SaidaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locais, setLocais] = useState<LocalSaida[]>([]);
  const [saidas, setSaidas] = useState<SaidaEstoque[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocais = async () => {
    try {
      const { data, error } = await supabase
        .from('locais_saida')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLocais(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar locais:', error);
      toast.error('Erro ao buscar locais de saída.');
    }
  };

  const fetchSaidas = async () => {
    try {
      const { data, error } = await supabase
        .from('saidas_estoque')
        .select(`
          *,
          local:locais_saida(nome),
          itens:saidas_estoque_itens(
            *,
            produto:produtos(nome, codigo_barras)
          )
        `)
        .order('data_saida', { ascending: false });
      
      if (error) throw error;
      
      // Processar dados para o formato esperado
      const processedData = (data || []).map(saida => ({
        ...saida,
        itens: saida.itens?.map((item: any) => ({
          produto_nome: item.produto?.nome || 'Produto não encontrado',
          produto_codigo_barras: item.produto?.codigo_barras || 'N/A',
          quantidade: item.quantidade,
          produto_quantidade_antes: item.quantidade_antes || 0
        })) || []
      }));
      
      setSaidas(processedData);
    } catch (error: any) {
      console.error('Erro ao buscar saídas:', error);
      toast.error('Erro ao buscar histórico de saídas.');
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

  const registrarSaida = async (local_id: number, usuario_retirada: string, itens: ItemSaida[], observacoes?: string) => {
    try {
      // Primeiro, criar a saída principal
      const { data: saidaData, error: saidaError } = await supabase
        .from('saidas_estoque')
        .insert({ local_id, usuario_retirada, observacoes })
        .select()
        .single();
      
      if (saidaError) throw saidaError;
      
      // Depois, adicionar os itens
      const itensParaInserir = itens.map(item => ({
        saida_id: saidaData.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        quantidade_antes: 0 // Será atualizado depois
      }));
      
      const { error: itensError } = await supabase
        .from('saidas_estoque_itens')
        .insert(itensParaInserir);
      
      if (itensError) throw itensError;
      
      await Promise.all([fetchLocais(), fetchSaidas()]);
      toast.success('Saída registrada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao registrar saída:', error);
      const errorMessage = error.message || 'Erro desconhecido ao registrar saída.';
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <SaidaContext.Provider value={{ locais, saidas, loading, adicionarLocal, registrarSaida, buscarSaidas: fetchSaidas }}>
      {children}
    </SaidaContext.Provider>
  );
};

export const useSaida = () => {
  return useContext(SaidaContext);
};
