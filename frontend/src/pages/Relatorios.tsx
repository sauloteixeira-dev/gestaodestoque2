import React, { useState, useEffect } from 'react';
import { useSaida } from '../context/SaidaContext';
import { useDevolucao } from '../context/DevolucaoContext';
import { supabase } from '../lib/supabase';
import RelatorioConsumo from '../components/RelatorioConsumo';

type MovimentacaoTipo = 'ENTRADA' | 'SAIDA' | 'DEVOLUCAO';

interface Movimentacao {
  id: string;
  tipo: MovimentacaoTipo;
  data: string;
  produto_nome: string;
  produto_codigo?: string;
  quantidade: number;
  local?: string;
  usuario?: string;
  observacao?: string;
}


const Relatorios: React.FC = () => {
  const { saidas } = useSaida();
  const { devolucoes, fetchDevolucoes } = useDevolucao();
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | MovimentacaoTipo>('TODOS');

  useEffect(() => {
    fetchDevolucoes();
  }, []);

  useEffect(() => {
    const fetchEntradas = async () => {
      try {
        const { data: entradas, error } = await supabase
          .from('entradas_estoque')
          .select(`
            *,
            produto:produtos(nome, codigo_barras, unidade)
          `)
          .order('data_entrada', { ascending: false });

        if (error) throw error;

        // Buscar perfis de usuários para as entradas E devoluções
        const entradaUserIds = (entradas || []).map((e: any) => e.user_id).filter(Boolean);
        const devolucaoUserIds = devolucoes.map((d: any) => d.user_id).filter(Boolean);
        const allUserIds = Array.from(new Set([...entradaUserIds, ...devolucaoUserIds]));

        let profilesMap = new Map();

        if (allUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nickname, email')
            .in('id', allUserIds);

          if (profiles) {
            profilesMap = new Map(profiles.map(p => [p.id, p]));
          }
        }

        const movimentacoesEntrada: Movimentacao[] = (entradas || []).map((entrada: any) => {
          const profile = profilesMap.get(entrada.user_id);
          const nomeUsuario = profile ? (profile.nickname || profile.email) : 'Usuário desconhecido';

          return {
            id: `entrada-${entrada.id}`,
            tipo: 'ENTRADA' as MovimentacaoTipo,
            data: entrada.data_entrada,
            produto_nome: entrada.produto ? (entrada.produto.unidade ? `${entrada.produto.nome} ${entrada.produto.unidade}` : entrada.produto.nome) : 'Produto não informado',
            produto_codigo: entrada.produto?.codigo_barras || undefined,
            quantidade: entrada.quantidade,
            usuario: nomeUsuario
          };
        });

        const movimentacoesSaida: Movimentacao[] = saidas.flatMap(saida =>
          (saida.itens || []).map(item => ({
            id: `saida-${saida.id}-${item.produto_codigo_barras}`,
            tipo: 'SAIDA' as MovimentacaoTipo,
            data: saida.data_saida,
            produto_nome: item.produto?.unidade ? `${item.produto_nome} ${item.produto.unidade}` : (item.produto_nome || 'Produto não informado'),
            produto_codigo: item.produto_codigo_barras || undefined,
            quantidade: item.quantidade,
            local: saida.local?.nome || undefined,
            usuario: saida.usuario_retirada || undefined
          }))
        );

        const movimentacoesDevolucao: Movimentacao[] = devolucoes.flatMap(devolucao =>
          (devolucao.itens || []).map(item => {
            const profile = profilesMap.get(devolucao.user_id);
            const nomeUsuario = profile ? (profile.nickname || profile.email) : (devolucao.usuario?.nome || 'Usuário desconhecido');

            return {
              id: `devolucao-${devolucao.id}-${item.item_saida_id}`,
              tipo: 'DEVOLUCAO' as MovimentacaoTipo,
              data: devolucao.data_devolucao,
              produto_nome: item.produto?.unidade ? `${item.produto_nome} ${item.produto.unidade}` : (item.produto_nome || 'Produto não informado'),
              produto_codigo: item.produto_codigo_barras || undefined,
              quantidade: item.quantidade_devolvida,
              local: devolucao.saida?.local?.nome || undefined,
              usuario: nomeUsuario,
              observacao: item.motivo || devolucao.observacao || undefined
            };
          })
        );

        const todasMovimentacoes = [...movimentacoesEntrada, ...movimentacoesSaida, ...movimentacoesDevolucao]
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

        setMovimentacoes(todasMovimentacoes);
      } catch (error) {
        // Backend indisponível - mostrar apenas saídas e devoluções
        const movimentacoesSaida: Movimentacao[] = saidas.flatMap(saida =>
          (saida.itens || []).map(item => ({
            id: `saida-${saida.id}-${item.produto_codigo_barras}`,
            tipo: 'SAIDA' as MovimentacaoTipo,
            data: saida.data_saida,
            produto_nome: item.produto_nome || 'Produto não informado',
            produto_codigo: item.produto_codigo_barras || undefined,
            quantidade: item.quantidade,
            local: saida.local?.nome || undefined,
            usuario: saida.usuario_retirada || undefined
          }))
        );

        const movimentacoesDevolucao: Movimentacao[] = devolucoes.flatMap(devolucao =>
          (devolucao.itens || []).map(item => ({
            id: `devolucao-${devolucao.id}-${item.item_saida_id}`,
            tipo: 'DEVOLUCAO' as MovimentacaoTipo,
            data: devolucao.data_devolucao,
            produto_nome: item.produto_nome || 'Produto não informado',
            produto_codigo: item.produto_codigo_barras || undefined,
            quantidade: item.quantidade_devolvida,
            local: devolucao.saida?.local?.nome || undefined,
            usuario: devolucao.usuario?.nome || undefined,
            observacao: item.motivo || devolucao.observacao || undefined
          }))
        );

        const todas = [...movimentacoesSaida, ...movimentacoesDevolucao]
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

        setMovimentacoes(todas);
      }
    };

    fetchEntradas();
  }, [saidas, devolucoes]); // Added devolucoes and fetchDevolucoes to dependencies to fix potential infinite loop

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  const movimentacoesFiltradas = movimentacoes.filter(mov =>
    filtroTipo === 'TODOS' || mov.tipo === filtroTipo
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Relatórios</h1>
        <p className="page-subtitle">Histórico completo de movimentações de estoque</p>
      </div>

      <RelatorioConsumo />

      {/* Filtros */}
      <div className="tabs-container">
        <button
          onClick={() => setFiltroTipo('TODOS')}
          className={`tab-button ${filtroTipo === 'TODOS' ? 'tab-active' : ''}`}
        >
          Todos ({movimentacoes.length})
        </button>
        <button
          onClick={() => setFiltroTipo('ENTRADA')}
          className={`tab-button ${filtroTipo === 'ENTRADA' ? 'tab-active' : ''}`}
        >
          Entradas ({movimentacoes.filter(m => m.tipo === 'ENTRADA').length})
        </button>
        <button
          onClick={() => setFiltroTipo('SAIDA')}
          className={`tab-button ${filtroTipo === 'SAIDA' ? 'tab-active' : ''}`}
        >
          Saídas ({movimentacoes.filter(m => m.tipo === 'SAIDA').length})
        </button>
        <button
          onClick={() => setFiltroTipo('DEVOLUCAO')}
          className={`tab-button ${filtroTipo === 'DEVOLUCAO' ? 'tab-active' : ''}`}
        >
          Devoluções ({movimentacoes.filter(m => m.tipo === 'DEVOLUCAO').length})
        </button>
      </div>

      <div className="card-base">
        {movimentacoesFiltradas.length > 0 ? (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th style={{ textAlign: 'center' }}>Tipo</th>
                  <th>Produto</th>
                  <th className="hide-mobile">Código</th>
                  <th style={{ textAlign: 'center' }}>Quantidade</th>
                  <th className="hide-mobile">Responsável/Local</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoesFiltradas.map(mov => (
                  <tr key={mov.id}>
                    <td className="mono">{formatarData(mov.data)}</td>
                    <td style={{ textAlign: 'center' }}>
                      {mov.tipo === 'ENTRADA' ? (
                        <div className="badge badge-success">ENTRADA</div>
                      ) : mov.tipo === 'SAIDA' ? (
                        <div className="badge badge-warning">SAÍDA</div>
                      ) : (
                        <div className="badge badge-info" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}>DEVOLUÇÃO</div>
                      )}
                    </td>
                    <td>{mov.produto_nome}</td>
                    <td className="mono hide-mobile">{mov.produto_codigo || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="mono" style={{
                        fontWeight: 'var(--font-semibold)',
                        color: mov.tipo === 'ENTRADA' || mov.tipo === 'DEVOLUCAO' ? 'var(--status-success)' : 'var(--status-warning)'
                      }}>
                        {mov.tipo === 'ENTRADA' || mov.tipo === 'DEVOLUCAO' ? '+' : '-'}{mov.quantidade}
                      </span>
                    </td>
                    <td className="hide-mobile" style={{ color: 'var(--text-secondary)' }}>
                      <div className="text-primary" style={{ fontWeight: 'var(--font-medium)' }}>
                        {mov.local || '-'}
                      </div>
                      {mov.usuario && <div className="text-muted" style={{ fontSize: '12px' }}>Usuário: {mov.usuario}</div>}
                      {mov.observacao && (
                        <div style={{
                          marginTop: '4px',
                          padding: '4px 8px',
                          background: 'var(--muted)',
                          borderRadius: '6px',
                          fontSize: '11px',
                          border: '1px solid var(--border)',
                          fontStyle: 'italic',
                          color: 'var(--text-secondary)',
                          display: 'inline-block',
                          maxWidth: '100%'
                        }}>
                          💬 {mov.observacao}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-8)',
            color: 'var(--text-muted)'
          }}>
            Nenhuma movimentação registrada ainda.
          </div>
        )}
      </div>
    </div >
  );
};

export default Relatorios;
