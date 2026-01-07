import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:3001';

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
      const response = await axios.get<LocalSaida[]>(`${API_URL}/locais-saida`);
      setLocais(response.data);
    } catch (error) {
      toast.error('Erro ao buscar locais de saída.');
    }
  };

  const fetchSaidas = async () => {
    try {
      const response = await axios.get<SaidaEstoque[]>(`${API_URL}/saidas-estoque`);
      setSaidas(response.data);
    } catch (error) {
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
      await axios.post(`${API_URL}/locais-saida`, { nome, descricao });
      await fetchLocais();
      toast.success('Local adicionado com sucesso!');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Erro desconhecido ao adicionar local.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const registrarSaida = async (local_id: number, usuario_retirada: string, itens: ItemSaida[], observacoes?: string) => {
    try {
      await axios.post(`${API_URL}/saidas-estoque`, { local_id, usuario_retirada, itens, observacoes });
      await Promise.all([fetchLocais(), fetchSaidas()]);
      toast.success('Saída registrada com sucesso!');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Erro desconhecido ao registrar saída.';
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
