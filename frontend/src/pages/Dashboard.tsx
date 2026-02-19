import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProdutos } from '../context/ProdutoContext';
import { useSaida } from '../context/SaidaContext';
import { useDevolucao } from '../context/DevolucaoContext';
import {
  AreaChart, Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Package, AlertTriangle, ShoppingCart, ArrowUpRight, ArrowDownRight, PlusCircle, MinusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { saidas } = useSaida();
  const { devolucoes } = useDevolucao();
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
    const dataMap = new Map<string, { entrada: number, saida: number, devolucao: number }>();
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
      dataMap.set(dateStr, { entrada: 0, saida: 0, devolucao: 0 });
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

    devolucoes.forEach(devolucao => {
      if (!devolucao.data_devolucao) return;
      const dateStr = formatDate(devolucao.data_devolucao);

      if (dataMap.has(dateStr)) {
        const current = dataMap.get(dateStr)!;
        const totalItems = devolucao.itens?.reduce((acc: number, item: any) => acc + item.quantidade_devolvida, 0) || 0;
        dataMap.set(dateStr, { ...current, devolucao: current.devolucao + totalItems });
      }
    });

    const finalData = Array.from(dataMap).map(([name, values]) => ({ name, ...values }));

    return finalData;

  }, [saidas, entradas, devolucoes]);

  const totalProducts = produtos.filter(p => p.quantidade > 0).length;
  const criticalItems = produtos.filter(p => p.quantidade > 0 && p.quantidade < 10).length;
  const outOfStock = produtos.filter(p => p.quantidade === 0).length;

  // Calcular variação real mês atual vs mês anterior
  const statsVariacao = useMemo(() => {
    const agora = new Date();
    const mesAtualInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const mesAnteriorInicio = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const mesAnteriorFim = new Date(agora.getFullYear(), agora.getMonth(), 0, 23, 59, 59);

    const entradasMesAtual = entradas
      .filter(e => e.data_entrada && new Date(e.data_entrada) >= mesAtualInicio)
      .reduce((acc, e) => acc + (e.quantidade || 0), 0);
    const entradasMesAnterior = entradas
      .filter(e => e.data_entrada && new Date(e.data_entrada) >= mesAnteriorInicio && new Date(e.data_entrada) <= mesAnteriorFim)
      .reduce((acc, e) => acc + (e.quantidade || 0), 0);

    let variacaoEntradas = 0;
    if (entradasMesAnterior > 0) {
      variacaoEntradas = ((entradasMesAtual - entradasMesAnterior) / entradasMesAnterior) * 100;
    } else if (entradasMesAtual > 0) {
      variacaoEntradas = 100;
    }

    const saidasMesAtual = saidas
      .filter(s => s.data_saida && new Date(s.data_saida) >= mesAtualInicio)
      .length;
    const saidasMesAnterior = saidas
      .filter(s => s.data_saida && new Date(s.data_saida) >= mesAnteriorInicio && new Date(s.data_saida) <= mesAnteriorFim)
      .length;

    let variacaoSaidas = 0;
    if (saidasMesAnterior > 0) {
      variacaoSaidas = ((saidasMesAtual - saidasMesAnterior) / saidasMesAnterior) * 100;
    } else if (saidasMesAtual > 0) {
      variacaoSaidas = 100;
    }

    return {
      entradas: { valor: variacaoEntradas, mesAtual: entradasMesAtual, mesAnterior: entradasMesAnterior },
      saidas: { valor: variacaoSaidas, mesAtual: saidasMesAtual, mesAnterior: saidasMesAnterior }
    };
  }, [entradas, saidas]);

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
            <div style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#60a5fa'
            }}>
              <Package size={20} />
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontSize: 'var(--text-xs)',
            color: statsVariacao.entradas.valor > 0 ? 'var(--status-success)' : statsVariacao.entradas.valor < 0 ? '#ef4444' : 'var(--text-muted)',
            fontWeight: 'var(--font-semibold)'
          }}>
            {statsVariacao.entradas.valor >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>
              {statsVariacao.entradas.valor === 0
                ? 'Sem variação este mês'
                : `${statsVariacao.entradas.valor > 0 ? '+' : ''}${statsVariacao.entradas.valor.toFixed(1)}% vs mês anterior`}
            </span>
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
            <div style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
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
            color: statsVariacao.saidas.valor > 0 ? 'var(--status-success)' : statsVariacao.saidas.valor < 0 ? '#ef4444' : 'var(--text-muted)',
            fontWeight: 'var(--font-semibold)'
          }}>
            {statsVariacao.saidas.valor >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>
              {statsVariacao.saidas.valor === 0
                ? 'Sem variação este mês'
                : `${statsVariacao.saidas.valor > 0 ? '+' : ''}${statsVariacao.saidas.valor.toFixed(1)}% vs mês anterior`}
            </span>
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
            <div style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171'
            }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          {criticalItems > 0 ? (
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: '#f87171' }}>
              Ação Necessária
            </span>
          ) : (
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--status-success)' }}>
              Estoque Saudável
            </span>
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
            <div style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#fbbf24'
            }}>
              <Package size={20} />
            </div>
          </div>
          {outOfStock > 0 ? (
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: '#fbbf24' }}>
              Reposição Urgente
            </span>
          ) : (
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--status-success)' }}>
              Tudo em ordem
            </span>
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
                background: '#f59e0b'
              }}></div>
              <span className="text-secondary">Devoluções</span>
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
                <linearGradient id="colorDevolucoes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
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

              <Area
                type="monotone"
                dataKey="devolucao"
                name="Devoluções"
                stroke="#F59E0B"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDevolucoes)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
