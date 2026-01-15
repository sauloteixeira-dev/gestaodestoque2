import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProdutos } from '../context/ProdutoContext';
import { useSaida } from '../context/SaidaContext';
import {
  AreaChart, Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Package, AlertTriangle, ShoppingCart, ArrowUpRight, PlusCircle, MinusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { saidas } = useSaida();
  const [entradas, setEntradas] = React.useState<any[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchEntradas = async () => {
      try {
        const { data, error } = await supabase
          .from('entradas_estoque')
          .select('*')
          .order('data_entrada', { ascending: false });

        if (error) throw error;
        setEntradas(data || []);
      } catch (err) {
        console.error('Erro ao buscar entradas para dashboard:', err);
        setEntradas([]);
      }
    };

    fetchEntradas();
  }, []);

  const chartData = useMemo(() => {
    const days = 30;
    const dataMap = new Map<string, { entrada: number, saida: number }>();
    const today = new Date();

    const formatDate = (dateInput: Date | string) => {
      const d = new Date(dateInput);
      // Converte para data no fuso de SP
      const spDate = new Date(d.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

      const day = spDate.getDate().toString().padStart(2, '0');
      const month = (spDate.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    };

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = formatDate(d);
      dataMap.set(dateStr, { entrada: 0, saida: 0 });
    }

    saidas.forEach(saida => {
      if (!saida.data_saida) return;
      const dateStr = formatDate(saida.data_saida);

      if (dataMap.has(dateStr)) {
        const current = dataMap.get(dateStr)!;
        const totalItems = saida.itens?.reduce((acc: number, item: any) => acc + item.quantidade, 0) || 0;
        dataMap.set(dateStr, { ...current, saida: current.saida + totalItems });
      }
    });

    entradas.forEach(entrada => {
      if (!entrada.data_entrada) return;
      const dateStr = formatDate(entrada.data_entrada);

      if (dataMap.has(dateStr)) {
        const current = dataMap.get(dateStr)!;
        dataMap.set(dateStr, { ...current, entrada: current.entrada + entrada.quantidade });
      }
    });

    const finalData = Array.from(dataMap).map(([name, values]) => ({ name, ...values }));

    return finalData;

  }, [saidas, entradas]);

  if (loadingProdutos) {
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
    <div style={{ minWidth: '0' }}>
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
        <div
          onClick={() => navigate('/cadastrar')}
          className="card-base"
          style={{
            minHeight: '160px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
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

        <div
          onClick={() => navigate('/saida')}
          className="card-base"
          style={{
            minHeight: '160px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
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
        height: 'auto',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '20px'
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
        <div style={{ width: '100%' }}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />

              <Area
                type="monotone"
                dataKey="entrada"
                name="Entradas"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEntradas)"
              />

              <Area
                type="monotone"
                dataKey="saida"
                name="Saídas"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSaidas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
