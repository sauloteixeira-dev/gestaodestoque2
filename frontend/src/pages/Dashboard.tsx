import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProdutos } from '../context/ProdutoContext';
import { useSaida } from '../context/SaidaContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, ShoppingCart, ArrowUpRight, PlusCircle, MinusCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { saidas } = useSaida();
  const [entradas, setEntradas] = React.useState<any[]>([]);
  const navigate = useNavigate();

  // Fetch Entradas
  React.useEffect(() => {
    fetch('http://localhost:3001/entradas-estoque')
      .then(res => res.json())
      .then(data => setEntradas(data))
      .catch(err => console.error('Erro ao buscar entradas:', err));
  }, []);

  // Process data for the chart (Last 30 days)
  const chartData = useMemo(() => {
    const days = 30;
    const dataMap = new Map<string, { entrada: number, saida: number }>();
    const today = new Date();

    // 1. Initialize last 30 days with 0
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      dataMap.set(dateStr, { entrada: 0, saida: 0 });
    }

    // 2. Aggregate REAL output data
    saidas.forEach(saida => {
      if (!saida.data_saida) return;
      const date = new Date(saida.data_saida);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      if (dataMap.has(dateStr)) {
        const current = dataMap.get(dateStr)!;
        const totalItems = saida.itens?.reduce((acc: number, item: any) => acc + item.quantidade, 0) || 0;
        dataMap.set(dateStr, { ...current, saida: current.saida + totalItems });
      }
    });

    // 3. Aggregate REAL input data
    entradas.forEach(entrada => {
      if (!entrada.data_entrada) return;
      const date = new Date(entrada.data_entrada);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      if (dataMap.has(dateStr)) {
        const current = dataMap.get(dateStr)!;
        dataMap.set(dateStr, { ...current, entrada: current.entrada + entrada.quantidade });
      }
    });

    // 4. Convert to array
    return Array.from(dataMap).map(([name, values]) => ({ name, ...values }));
  }, [saidas, entradas]);

  if (loadingProdutos) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Carregando Dashboard...</div>;
  }

  // Calculate Stats
  const totalProducts = produtos.filter(p => p.quantidade > 0).length; // Apenas produtos em estoque
  const criticalItems = produtos.filter(p => p.quantidade > 0 && p.quantidade < 10).length; // Itens críticos (1-9 unidades)
  const outOfStock = produtos.filter(p => p.quantidade === 0).length;

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Visão Geral</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Aqui está o resumo do seu aplicativo hoje.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* ... Cards ... (Keep existing cards logic if unchanged, but for brevity I'm keeping replacing the whole component logic block I selected) */}
        {/* Card 1 */}
        <div
          onClick={() => navigate('/estoque-baixo?filtro=estoque')}
          className="card-base"
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qtd. de Produtos</div>
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
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Movimentações (Saída)</div>
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
        <div
          onClick={() => navigate('/estoque-baixo?filtro=critico')}
          className="card-base"
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
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
        <div
          onClick={() => navigate('/estoque-baixo?filtro=baixo')}
          className="card-base"
          style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
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

      {/* Quick Actions Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Card: Cadastrar Produto */}
        <div
          onClick={() => navigate('/cadastrar')}
          className="card-base"
          style={{
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '50%',
            marginBottom: '1rem'
          }}>
            <PlusCircle size={48} color="#60a5fa" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Cadastrar Produto</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Adicione novos produtos ao estoque</p>
        </div>

        {/* Card: Saída de Estoque */}
        <div
          onClick={() => navigate('/saida')}
          className="card-base"
          style={{
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '50%',
            marginBottom: '1rem'
          }}>
            <MinusCircle size={48} color="#a78bfa" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Saída de Estoque</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Registre retiradas de produtos</p>
        </div>
      </div>

      {/* Chart Section - Full Width */}
      <div className="card-base" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Movimentação de Estoque (30 dias)</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: '#10b981' }}></div>
              <span>Entradas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: '#8b5cf6' }}></div>
              <span>Saídas</span>
            </div>
          </div>
        </div>
        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="entrada" name="Entrada (Qtd)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
              <Area type="monotone" dataKey="saida" name="Saída (Qtd)" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
