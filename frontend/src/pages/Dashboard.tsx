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

<<<<<<< HEAD
  React.useEffect(() => {
    fetch('http://localhost:3001/entradas-estoque')
      .then(res => {
        if (!res.ok) throw new Error('Backend indisponível');
        return res.json();
      })
      .then(data => setEntradas(data))
      .catch(() => {
        // Backend indisponível - gráfico mostrará apenas saídas
        setEntradas([]);
      });
  }, []);

=======
  // Fetch Entradas
  React.useEffect(() => {
    fetch('http://localhost:3001/entradas-estoque')
      .then(res => res.json())
      .then(data => setEntradas(data))
      .catch(err => console.error('Erro ao buscar entradas:', err));
  }, []);

  // Process data for the chart (Last 30 days)
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
  const chartData = useMemo(() => {
    const days = 30;
    const dataMap = new Map<string, { entrada: number, saida: number }>();
    const today = new Date();

<<<<<<< HEAD
=======
    // 1. Initialize last 30 days with 0
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      dataMap.set(dateStr, { entrada: 0, saida: 0 });
    }

<<<<<<< HEAD
=======
    // 2. Aggregate REAL output data
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
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

<<<<<<< HEAD
=======
    // 3. Aggregate REAL input data
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
    entradas.forEach(entrada => {
      if (!entrada.data_entrada) return;
      const date = new Date(entrada.data_entrada);
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      if (dataMap.has(dateStr)) {
        const current = dataMap.get(dateStr)!;
        dataMap.set(dateStr, { ...current, entrada: current.entrada + entrada.quantidade });
      }
    });

<<<<<<< HEAD
=======
    // 4. Convert to array
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
    return Array.from(dataMap).map(([name, values]) => ({ name, ...values }));
  }, [saidas, entradas]);

  if (loadingProdutos) {
<<<<<<< HEAD
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'var(--text-muted)'
      }}>
        Carregando Dashboard...
      </div>
    );
  }

  const totalProducts = produtos.filter(p => p.quantidade > 0).length;
  const criticalItems = produtos.filter(p => p.quantidade > 0 && p.quantidade < 10).length;
  const outOfStock = produtos.filter(p => p.quantidade === 0).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Visão Geral</h1>
        <p className="page-subtitle">Acompanhe métricas e movimentações do estoque em tempo real</p>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)'
      }}>
=======
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
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
        <div
          onClick={() => navigate('/cadastrar')}
          className="card-base"
          style={{
<<<<<<< HEAD
            minHeight: '160px',
=======
            height: '200px',
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
<<<<<<< HEAD
            gap: 'var(--space-3)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <div className="icon-container" style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)'
          }}>
            <PlusCircle size={32} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--space-1)',
              color: 'var(--text-primary)'
            }}>
              Cadastrar Produto
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)'
            }}>
              Adicione novos produtos ao estoque
            </p>
          </div>
        </div>

=======
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
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
        <div
          onClick={() => navigate('/saida')}
          className="card-base"
          style={{
<<<<<<< HEAD
            minHeight: '160px',
=======
            height: '200px',
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
<<<<<<< HEAD
            gap: 'var(--space-3)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <div className="icon-container" style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            color: '#a78bfa'
          }}>
            <MinusCircle size={32} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--space-1)',
              color: 'var(--text-primary)'
            }}>
              Saída de Estoque
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)'
            }}>
              Registre retiradas de produtos
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-auto" style={{ marginBottom: 'var(--space-8)' }}>
        {/* Card 1: Total Products */}
        <div
          onClick={() => navigate('/estoque')}
          className="card-base"
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <div style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-2)'
              }}>
                Produtos em Estoque
              </div>
              <div className="mono" style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-bold)',
                lineHeight: 1,
                color: 'var(--text-primary)'
              }}>
                {totalProducts}
              </div>
            </div>
            <div className="icon-container">
              <Package size={20} />
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontSize: 'var(--text-xs)',
            color: 'var(--status-success)',
            fontWeight: 'var(--font-semibold)'
          }}>
            <ArrowUpRight size={14} />
            <span>+2.5% desde o último mês</span>
          </div>
        </div>

        {/* Card 2: Withdrawals */}
        <div className="card-base" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <div style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-2)'
              }}>
                Movimentações (Saída)
              </div>
              <div className="mono" style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-bold)',
                lineHeight: 1,
                color: 'var(--text-primary)'
              }}>
                {saidas.length}
              </div>
            </div>
            <div className="icon-container" style={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#a78bfa'
            }}>
              <ShoppingCart size={20} />
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontSize: 'var(--text-xs)',
            color: 'var(--status-success)',
            fontWeight: 'var(--font-semibold)'
          }}>
            <ArrowUpRight size={14} />
            <span>+1.2% este mês</span>
          </div>
        </div>

        {/* Card 3: Critical Items */}
        <div
          onClick={() => navigate('/estoque')}
          className="card-base"
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <div style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-2)'
              }}>
                Itens Críticos
              </div>
              <div className="mono" style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-bold)',
                lineHeight: 1,
                color: 'var(--text-primary)'
              }}>
                {criticalItems}
              </div>
            </div>
            <div className="icon-container-error">
              <AlertTriangle size={20} />
            </div>
          </div>
          {criticalItems > 0 ? (
            <div className="badge badge-error">
              Ação Necessária
            </div>
          ) : (
            <div className="badge badge-success">
              Estoque Saudável
            </div>
          )}
        </div>

        {/* Card 4: Out of Stock */}
        <div
          onClick={() => navigate('/estoque')}
          className="card-base"
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <div style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-2)'
              }}>
                Sem Estoque
              </div>
              <div className="mono" style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-bold)',
                lineHeight: 1,
                color: 'var(--text-primary)'
              }}>
                {outOfStock}
              </div>
            </div>
            <div className="icon-container-warning">
              <Package size={20} />
            </div>
          </div>
          {outOfStock > 0 ? (
            <div className="badge badge-warning">
              Reposição Urgente
            </div>
          ) : (
            <div className="badge badge-success">
              Tudo em ordem
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="card-base" style={{
        height: '340px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-4)',
          flexWrap: 'wrap',
          gap: 'var(--space-3)'
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--text-primary)'
          }}>
            Movimentação de Estoque (30 dias)
          </h3>
          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-xs)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: 'var(--radius-sm)',
                background: '#10b981'
              }}></div>
              <span className="text-secondary">Entradas</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-xs)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: 'var(--radius-sm)',
                background: '#8b5cf6'
              }}></div>
              <span className="text-secondary">Saídas</span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
=======
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
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
<<<<<<< HEAD
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="var(--text-faint)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
              />
              <YAxis
                stroke="var(--text-faint)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border-subtle)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                  padding: 'var(--space-2) var(--space-3)'
                }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Area
                type="monotone"
                dataKey="entrada"
                name="Entrada (Qtd)"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIn)"
              />
              <Area
                type="monotone"
                dataKey="saida"
                name="Saída (Qtd)"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOut)"
              />
=======
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
>>>>>>> 50a17daf1625e8ecbeb04f2620eefa2e0a6894b5
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
