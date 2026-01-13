import React, { useState, useEffect } from 'react';
import { useSaida } from '../context/SaidaContext';

type MovimentacaoTipo = 'ENTRADA' | 'SAIDA';

interface Movimentacao {
  id: string;
  tipo: MovimentacaoTipo;
  data: string;
  produto_nome: string;
  produto_codigo?: string;
  quantidade: number;
  local?: string;
  usuario?: string;
}

import { API_URL } from '../services/api';

const Relatorios: React.FC = () => {
  const { saidas } = useSaida();
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | MovimentacaoTipo>('TODOS');

  useEffect(() => {
    const fetchEntradas = async () => {
      try {
        const response = await fetch(`${API_URL}/entradas-estoque`);
        if (!response.ok) throw new Error('Backend indisponível');
        const entradas = await response.json();

        const movimentacoesEntrada: Movimentacao[] = entradas.map((entrada: any) => ({
          id: `entrada-${entrada.id}`,
          tipo: 'ENTRADA' as MovimentacaoTipo,
          data: entrada.data_entrada,
          produto_nome: entrada.produto?.nome || 'Produto não informado',
          produto_codigo: entrada.produto?.codigo_barras || undefined,
          quantidade: entrada.quantidade,
          usuario: entrada.usuario_entrada || undefined
        }));

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

        const todasMovimentacoes = [...movimentacoesEntrada, ...movimentacoesSaida]
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

        setMovimentacoes(todasMovimentacoes);
      } catch (error) {
        // Backend indisponível - mostrar apenas saídas
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

        setMovimentacoes(movimentacoesSaida.sort((a, b) =>
          new Date(b.data).getTime() - new Date(a.data).getTime()
        ));
      }
    };

    fetchEntradas();
  }, [saidas]);

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
                      ) : (
                        <div className="badge badge-warning">SAÍDA</div>
                      )}
                    </td>
                    <td>{mov.produto_nome}</td>
                    <td className="mono hide-mobile">{mov.produto_codigo || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="mono" style={{
                        fontWeight: 'var(--font-semibold)',
                        color: mov.tipo === 'ENTRADA' ? 'var(--status-success)' : 'var(--status-warning)'
                      }}>
                        {mov.tipo === 'ENTRADA' ? '+' : '-'}{mov.quantidade}
                      </span>
                    </td>
                    <td className="hide-mobile" style={{ color: 'var(--text-secondary)' }}>
                      {mov.usuario || mov.local || '-'}
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
    </div>
  );
};

export default Relatorios;
