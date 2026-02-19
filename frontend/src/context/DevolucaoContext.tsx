import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import { type Devolucao, type ItemDevolucao } from '../types';
import { supabase } from '../lib/supabase';

// Configuração da API
const API_URL = import.meta.env.VITE_API_URL || 'https://gestao-estoque-api.gestao-estoque-saulo.workers.dev';

interface DevolucaoContextData {
    devolucoes: Devolucao[];
    loading: boolean;
    fetchDevolucoes: () => Promise<void>;
    criarDevolucao: (saidaId: number, itens: ItemDevolucao[], observacao?: string) => Promise<{
        success: boolean;
        devolucao_id?: number;
        comprovante_numero?: string;
        error?: string;
    }>;
    validarDevolucao: (saidaId: number) => Promise<any>;
    buscarDevolucao: (devolucaoId: number) => Promise<Devolucao | null>;
}

const DevolucaoContext = createContext<DevolucaoContextData>({} as DevolucaoContextData);

export const DevolucaoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [devolucoes, setDevolucoes] = useState<Devolucao[]>([]);
    const [loading, setLoading] = useState(true);

    // Função auxiliar para obter o token do Supabase
    const getAuthToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || null;
    };

    // Buscar todas as devoluções usando Supabase diretamente
    const fetchDevolucoes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('devolucoes')
                .select(`
                    *,
                    saida:saidas_estoque(
                        id,
                        data_saida,
                        usuario_retirada,
                        local:locais_saida(nome)
                    ),
                    itens:itens_devolucao(
                        *,
                        produto:produtos(unidade)
                    )
                `)
                .order('data_devolucao', { ascending: false });

            if (error) throw error;

            // Enriquecer com informações de usuário (profiles)
            const userIds = [...new Set((data || []).map(d => d.user_id).filter(Boolean))];

            let profilesMap = new Map();
            if (userIds.length > 0) {
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, nickname, email, full_name')
                    .in('id', userIds);

                if (!profilesError && profiles) {
                    profilesMap = new Map(profiles.map(p => [p.id, p]));
                }
            }

            const devolucoesEnriquecidas = (data || []).map(devolucao => {
                const profile = profilesMap.get(devolucao.user_id);
                return {
                    ...devolucao,
                    usuario: {
                        nickname: profile?.nickname,
                        email: profile?.email,
                        nome: profile?.nickname || profile?.full_name || profile?.email || 'Usuário desconhecido'
                    }
                };
            });

            setDevolucoes(devolucoesEnriquecidas);
        } catch (error: any) {
            console.error('Erro ao buscar devoluções via Supabase:', error);
        } finally {
            setLoading(false);
        }
    };

    // Buscar uma devolução específica usando Supabase diretamente
    const buscarDevolucao = async (devolucaoId: number): Promise<Devolucao | null> => {
        try {
            const { data, error } = await supabase
                .from('devolucoes')
                .select(`
                    *,
                    saida:saidas_estoque(
                        *,
                        local:locais_saida(nome)
                    ),
                    itens:itens_devolucao(
                        *,
                        produto:produtos(unidade)
                    )
                `)
                .eq('id', devolucaoId)
                .single();

            if (error) throw error;

            // Buscar informações do usuário
            if (data.user_id) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('nickname, email, full_name')
                    .eq('id', data.user_id)
                    .single();

                if (profile) {
                    data.usuario = {
                        nickname: profile.nickname,
                        email: profile.email,
                        nome: profile.nickname || profile.full_name || profile.email || 'Usuário desconhecido'
                    };
                } else {
                    data.usuario = {
                        nome: 'Usuário desconhecido'
                    };
                }
            }

            return data;
        } catch (error: any) {
            console.error('Erro ao buscar devolução via Supabase:', error);
            toast.error('Não foi possível carregar a devolução.');
            return null;
        }
    };

    // Validar possibilidade de devolução
    // Validar possibilidade de devolução usando Supabase diretamente
    const validarDevolucao = async (saidaId: number) => {
        try {


            const { data: itensSaida, error: errorItens } = await supabase
                .from('itens_saida')
                .select(`
                    *,
                    produto:produtos(unidade)
                `)
                .eq('saida_id', saidaId);

            if (errorItens) throw errorItens;

            if (!itensSaida || itensSaida.length === 0) {
                return {
                    pode_devolver: false,
                    motivo: 'A saída não possui itens.',
                    itens: []
                };
            }

            // 2. Buscar TODAS as devoluções já feitas para os itens desta saída
            const itemSaidaIds = itensSaida.map(i => i.id);
            const { data: todasDevolucoes, error: errorDevs } = await supabase
                .from('itens_devolucao')
                .select('item_saida_id, quantidade_devolvida')
                .in('item_saida_id', itemSaidaIds);

            if (errorDevs) throw errorDevs;

            // 3. Criar mapa de quantidades já devolvidas
            const mapaDevolucoes = (todasDevolucoes || []).reduce((acc: any, dev) => {
                acc[dev.item_saida_id] = (acc[dev.item_saida_id] || 0) + dev.quantidade_devolvida;
                return acc;
            }, {});

            // 4. Mapear itens com disponibilidade
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
                    quantidade_disponivel_devolucao: quantidadeDisponivel,
                    produto: {
                        unidade: item.produto?.unidade
                    }
                };
            });

            const podeDevolver = itensComDisponibilidade.some(item => item.quantidade_disponivel_devolucao > 0);

            return {
                pode_devolver: podeDevolver,
                motivo: podeDevolver ? null : 'Todos os itens desta saída já foram devolvidos.',
                saida_id: saidaId,
                itens: itensComDisponibilidade
            };
        } catch (error: any) {
            console.error('Erro ao validar devolução via Supabase:', error);
            toast.error(error.message || 'Erro ao validar devolução.');
            return null;
        }
    };

    // Criar uma nova devolução
    const criarDevolucao = async (
        saidaId: number,
        itens: ItemDevolucao[],
        observacao?: string
    ): Promise<{ success: boolean; devolucao_id?: number; comprovante_numero?: string; error?: string }> => {
        try {
            const token = await getAuthToken();
            if (!token) {
                toast.error('Você precisa estar autenticado para processar devoluções.');
                return { success: false, error: 'Não autenticado' };
            }

            const response = await fetch(`${API_URL}/devolucoes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    saida_id: saidaId,
                    itens,
                    observacao,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar devolução');
            }

            toast.success('Devolução processada com sucesso!');

            // Atualizar lista de devoluções
            await fetchDevolucoes();

            return {
                success: true,
                devolucao_id: data.devolucao_id,
                comprovante_numero: data.comprovante_numero,
            };
        } catch (error: any) {
            console.error('Erro ao criar devolução:', error);
            toast.error(error.message || 'Erro ao processar devolução.');
            return { success: false, error: error.message };
        }
    };

    // Carregar devoluções ao montar o componente
    useEffect(() => {
        fetchDevolucoes();
    }, []);

    return (
        <DevolucaoContext.Provider
            value={{
                devolucoes,
                loading,
                fetchDevolucoes,
                criarDevolucao,
                validarDevolucao,
                buscarDevolucao,
            }}
        >
            {children}
        </DevolucaoContext.Provider>
    );
};

export const useDevolucao = () => {
    const context = useContext(DevolucaoContext);
    if (!context) {
        throw new Error('useDevolucao must be used within DevolucaoProvider');
    }
    return context;
};
