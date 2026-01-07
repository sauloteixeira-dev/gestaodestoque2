import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:3001';

interface Produto {
  id: number;
  codigo_barras: string;
  nome: string;
  quantidade: number;
}

interface ProdutoContextData {
  produtos: Produto[];
  loading: boolean;
  adicionarProduto: (codigoBarras: string, nome: string, quantidade: number) => Promise<void>;
  darBaixaEstoque: (produtoId: number, quantidadeBaixa: number) => Promise<void>;
  darEntradaEstoque: (produto: Produto, quantidadeEntrada: number) => Promise<void>;
  excluirProduto: (produtoId: number) => Promise<void>;
}

const ProdutoContext = createContext<ProdutoContextData>({} as ProdutoContextData);

export const ProdutoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Produto[]>(`${API_URL}/produtos`);
      setProdutos(response.data);
    } catch (error) {
      toast.error('Erro ao buscar produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const adicionarProduto = async (codigoBarras: string, nome: string, quantidade: number) => {
    try {
      await axios.post(`${API_URL}/produtos`, { codigo_barras: codigoBarras, nome, quantidade });
      await fetchProdutos(); // Re-fetch para garantir consistência total
      toast.success('Produto adicionado com sucesso!');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Erro desconhecido ao adicionar produto.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const darBaixaEstoque = async (produtoId: number, quantidadeBaixa: number) => {
    try {
      await axios.post(`${API_URL}/produtos/saida`, { produto_id: produtoId, quantidade: quantidadeBaixa });
      await fetchProdutos(); // Força a atualização buscando os dados mais recentes
      toast.success('Estoque atualizado com sucesso!');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Erro desconhecido ao dar baixa no estoque.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const darEntradaEstoque = async (produto: Produto, quantidadeEntrada: number) => {
    try {
      await axios.post(`${API_URL}/produtos`, { 
        codigo_barras: produto.codigo_barras, 
        nome: produto.nome, 
        quantidade: quantidadeEntrada 
      });
      await fetchProdutos(); // Força a atualização buscando os dados mais recentes
      toast.success('Estoque atualizado com sucesso!');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Erro desconhecido ao dar entrada no estoque.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const excluirProduto = async (produtoId: number) => {
    try {
      await axios.delete(`${API_URL}/produtos/${produtoId}`);
      await fetchProdutos();
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Erro desconhecido ao excluir produto.';
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <ProdutoContext.Provider value={{ produtos, loading, adicionarProduto, darBaixaEstoque, darEntradaEstoque, excluirProduto }}>
      {children}
    </ProdutoContext.Provider>
  );
};

export const useProdutos = () => {
  return useContext(ProdutoContext);
};
