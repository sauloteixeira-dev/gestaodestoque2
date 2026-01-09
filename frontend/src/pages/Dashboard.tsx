import React, { useMemo } from 'react';
import { useProdutos } from '../context/ProdutoContext';
import { useSaida } from '../context/SaidaContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, ShoppingCart, ArrowUpRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { saidas } = useSaida();

  // Process data for the chart (Last 30 days)
  const chartData = useMemo(() => {
    const days = 30;
    const dataMap = new Map<string, number>();
    const today = new Date();

    // 1. Initialize last 30 days with 0
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      dataMap.set(dateStr, 0);
    }

    // 2. Aggregate REAL output data
    saidas.forEach(saida => {
      if (!saida.data_saida) return;
      const date = new Date(saida.data_saida);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      // Only count if it's within our range
      if (dataMap.has(dateStr)) {
        const totalItems = saida.itens?.reduce((acc, item) => acc + item.quantidade, 0) || 0;
        dataMap.set(dateStr, (dataMap.get(dateStr) || 0) + totalItems);
      }
    });

    // 3. Convert to array
    return Array.from(dataMap).map(([name, out]) => ({ name, out }));
  }, [saidas]);

  if (loadingProdutos) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Carregando Dashboard...</div>;
  }

  // Calculate Stats
  const totalProducts = produtos.length;
  const criticalItems = produtos.filter(p => p.quantidade < 10).length;
  const outOfStock = produtos.filter(p => p.quantidade === 0).length;

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Visão Geral</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Aqui está o resumo do seu estoque hoje.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Card 1 */}
        <div className="card-base" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total de Produtos</div>
            <div style={{ padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: '#60a5fa' }}>
              <Package size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem', lineHeight: 1 }}>{totalProducts}</div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.5rem' }}>
              <ArrowUpRight size={14} /> +2.5% desde o último mês
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card-base" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Movimentações</div>
            <div style={{ padding: '8px', backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: '8px', color: '#a78bfa' }}>
              <ShoppingCart size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem', lineHeight: 1 }}>{saidas.length}</div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.5rem' }}>
              <ArrowUpRight size={14} /> +1.2% este mês
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card-base" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Itens Críticos</div>
            <div style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#f87171' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem', lineHeight: 1 }}>{criticalItems}</div>
            {criticalItems > 0 ? (
              <span style={{ display: 'inline-block', color: '#f87171', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(239,68,68,0.2)', padding: '2px 8px', borderRadius: '12px', marginTop: '0.5rem' }}>
                Ação Necessária
              </span>
            ) : (
              <span style={{ display: 'inline-block', color: '#4ade80', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem' }}>
                Estoque Saudável
              </span>
            )}
          </div>
        </div>

        {/* Card 4 */}
        <div className="card-base" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sem Estoque</div>
            <div style={{ padding: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: '#fbbf24' }}>
              <Package size={20} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem', lineHeight: 1 }}>{outOfStock}</div>
            {outOfStock > 0 ? (
              <span style={{ display: 'inline-block', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(245, 158, 11,0.2)', padding: '2px 8px', borderRadius: '12px', marginTop: '0.5rem' }}>
                Reposição Urgente
              </span>
            ) : (
              <span style={{ display: 'inline-block', color: '#4ade80', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem' }}>
                Tudo em ordem
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Chart Section */}
        <div className="card-base" style={{ height: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Movimentação de Saídas (Últimos 30 dias)</h3>
            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Atualizado</button>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="out" name="Saída (Qtd)" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Table Preview */}
        <div className="card-base" style={{ height: '400px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Itens Críticos (Top 5)</h3>
            <a href="/estoque-baixo" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>Ver Relatório</a>
          </div>
          <div style={{ overflowY: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', paddingBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Produto</th>
                  <th style={{ textAlign: 'right', paddingBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Nível</th>
                  <th style={{ textAlign: 'right', paddingBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {produtos.filter(p => p.quantidade <= 10).slice(0, 5).map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.75rem 0' }}>
                      <div style={{ fontWeight: 500 }}>{item.nome}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.codigo_barras}</div>
                    </td>
                    <td style={{ textAlign: 'right', color: '#f87171', fontWeight: 600 }}>
                      {item.quantidade} restantes
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Crítico</span>
                    </td>
                  </tr>
                ))}
                {produtos.filter(p => p.quantidade <= 10).length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum item crítico. Bom trabalho!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
