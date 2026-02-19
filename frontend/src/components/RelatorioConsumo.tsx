import React, { useMemo, useState, useCallback } from 'react';
import { useSaida } from '../context/SaidaContext';
import { useDevolucao } from '../context/DevolucaoContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { ChevronDown, ChevronUp, Package, ArrowDownRight, MapPin, Calendar, Printer, X, Check } from 'lucide-react';

const PURPLE_BORDER = 'rgba(139, 92, 246, 0.25)';

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const RelatorioConsumo: React.FC = () => {
    const { saidas, loading: loadingSaidas } = useSaida();
    const { devolucoes, loading: loadingDevolucoes } = useDevolucao();
    const { colors } = useTheme();
    const [expandedLocais, setExpandedLocais] = useState<string[]>([]);
    const [loadingEntradas, setLoadingEntradas] = useState(true);
    const [entradasRaw, setEntradasRaw] = useState<any[]>([]);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [locaisSelecionadosImpressao, setLocaisSelecionadosImpressao] = useState<string[]>([]);
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [reportData, setReportData] = useState<{
        locais: typeof consumoPorLocal;
        totalGeral: number;
        periodoLabel: string;
    } | null>(null);

    // Mês/Ano de início e fim (customizado)
    const agora = new Date();
    const [mesInicio, setMesInicio] = useState(0); // Janeiro
    const [anoInicio, setAnoInicio] = useState(agora.getFullYear());
    const [mesFim, setMesFim] = useState(agora.getMonth());
    const [anoFim, setAnoFim] = useState(agora.getFullYear());
    const [usarFiltroMes, setUsarFiltroMes] = useState(false);

    // Buscar entradas
    React.useEffect(() => {
        const fetchEntradas = async () => {
            try {
                const { data, error } = await supabase
                    .from('entradas_estoque')
                    .select('quantidade, data_entrada');
                if (error) throw error;
                setEntradasRaw(data || []);
            } catch (error) {
                console.error('Erro ao buscar entradas:', error);
            } finally {
                setLoadingEntradas(false);
            }
        };
        fetchEntradas();
    }, []);

    // Data mais antiga
    const dataMaisAntiga = useMemo(() => {
        const todasDatas: Date[] = [];
        (entradasRaw || []).forEach(e => { if (e.data_entrada) todasDatas.push(new Date(e.data_entrada)); });
        (saidas || []).forEach(s => { if (s.data_saida) todasDatas.push(new Date(s.data_saida)); });
        (devolucoes || []).forEach(d => { if (d.data_devolucao) todasDatas.push(new Date(d.data_devolucao)); });
        if (todasDatas.length === 0) return new Date();
        return new Date(Math.min(...todasDatas.map(d => d.getTime())));
    }, [entradasRaw, saidas, devolucoes]);

    // Anos disponíveis
    const anosDisponiveis = useMemo(() => {
        const anoMin = dataMaisAntiga.getFullYear();
        const anoMax = agora.getFullYear();
        const anos: number[] = [];
        for (let y = anoMin; y <= anoMax; y++) anos.push(y);
        return anos;
    }, [dataMaisAntiga]);

    // Data de corte
    const dataCorte = useMemo((): { inicio: Date | null; fim: Date | null } => {
        if (usarFiltroMes) {
            const inicio = new Date(anoInicio, mesInicio, 1);
            const fim = new Date(anoFim, mesFim + 1, 0, 23, 59, 59); // Último dia do mês
            return { inicio, fim };
        }
        return { inicio: null, fim: null };
    }, [usarFiltroMes, mesInicio, anoInicio, mesFim, anoFim]);

    const dentroDoFiltro = useCallback((dataStr: string) => {
        if (!dataStr) return false;
        const data = new Date(dataStr);
        if (dataCorte.inicio && data < dataCorte.inicio) return false;
        if (dataCorte.fim && data > dataCorte.fim) return false;
        return true;
    }, [dataCorte]);

    // Entradas filtradas
    const totalEntradasFiltrado = useMemo(() => {
        return (entradasRaw || [])
            .filter(e => dataCorte.inicio === null || dentroDoFiltro(e.data_entrada))
            .reduce((acc: number, curr: any) => acc + (curr.quantidade || 0), 0);
    }, [entradasRaw, dataCorte, dentroDoFiltro]);

    // Consumo por local
    const consumoPorLocal = useMemo(() => {
        if (!saidas || !devolucoes) return [];
        try {
            const dados = new Map<string, {
                totalLiquido: number;
                itens: Map<number | string, {
                    nome: string;
                    quantidadeSaida: number;
                    quantidadeDevolvida: number;
                    unidade?: string;
                    saldo: number;
                    motivos: string[]
                }>
            }>();

            const saidasFiltradas = saidas.filter(s => s && (dataCorte.inicio === null || dentroDoFiltro(s.data_saida)));

            saidasFiltradas.forEach(saida => {
                const localNome = saida.local?.nome || 'Local Desconhecido';
                if (!dados.has(localNome)) dados.set(localNome, { totalLiquido: 0, itens: new Map() });
                const localDados = dados.get(localNome)!;
                (saida.itens || []).forEach((item: any) => {
                    if (!item) return;
                    const produtoKey = item.produto_id || item.produto_nome || 'desconhecido';
                    const nomeProduto = item.produto_nome || `Produto #${item.produto_id}`;
                    if (!localDados.itens.has(produtoKey)) {
                        localDados.itens.set(produtoKey, { nome: nomeProduto, quantidadeSaida: 0, quantidadeDevolvida: 0, unidade: item.produto?.unidade, saldo: 0, motivos: [] });
                    }
                    const itemDados = localDados.itens.get(produtoKey)!;
                    itemDados.quantidadeSaida += (item.quantidade || 0);
                    itemDados.saldo = itemDados.quantidadeSaida - itemDados.quantidadeDevolvida;
                });
            });

            const devolucoesFiltradas = devolucoes.filter(d => d && (dataCorte.inicio === null || dentroDoFiltro(d.data_devolucao)));

            devolucoesFiltradas.forEach(devolucao => {
                const localNome = devolucao.saida?.local?.nome || 'Local Desconhecido (Devolução)';
                if (!dados.has(localNome)) dados.set(localNome, { totalLiquido: 0, itens: new Map() });
                const localDados = dados.get(localNome)!;
                (devolucao.itens || []).forEach((item: any) => {
                    if (!item) return;
                    const produtoKey = item.produto_id || item.produto_nome || 'desconhecido';
                    const nomeProduto = item.produto_nome || `Produto #${item.produto_id}`;
                    if (!localDados.itens.has(produtoKey)) {
                        localDados.itens.set(produtoKey, { nome: nomeProduto, quantidadeSaida: 0, quantidadeDevolvida: 0, unidade: item.produto?.unidade, saldo: 0, motivos: [] });
                    }
                    const itemDados = localDados.itens.get(produtoKey)!;
                    itemDados.quantidadeDevolvida += (item.quantidade_devolvida || 0);
                    itemDados.saldo = itemDados.quantidadeSaida - itemDados.quantidadeDevolvida;
                    // Coletar motivo da devolução (do item ou da observação geral)
                    const motivoTexto = item.motivo || devolucao.observacao;
                    if (motivoTexto && !itemDados.motivos.includes(motivoTexto)) {
                        itemDados.motivos.push(motivoTexto);
                    }
                });
            });

            return Array.from(dados.entries()).map(([local, info]) => {
                const totalLiquido = Array.from(info.itens.values()).reduce((acc, item) => acc + item.saldo, 0);
                const itensArray = Array.from(info.itens.values()).sort((a, b) => a.nome.localeCompare(b.nome));
                return { local, totalLiquido, itens: itensArray };
            }).sort((a, b) => b.totalLiquido - a.totalLiquido);
        } catch (error) {
            console.error("Erro ao calcular relatórios:", error);
            return [];
        }
    }, [saidas, devolucoes, dataCorte, dentroDoFiltro]);

    const toggleLocal = (local: string) => {
        setExpandedLocais(prev =>
            prev.includes(local) ? prev.filter(l => l !== local) : [...prev, local]
        );
    };

    const aplicarFiltroMes = () => {
        setUsarFiltroMes(true);
    };

    const limparFiltroMes = () => {
        setUsarFiltroMes(false);
    };

    // Print
    const abrirModalImpressao = () => {
        setLocaisSelecionadosImpressao(consumoPorLocal.map(c => c.local));
        setShowPrintModal(true);
    };

    const toggleLocalImpressao = (local: string) => {
        setLocaisSelecionadosImpressao(prev =>
            prev.includes(local) ? prev.filter(l => l !== local) : [...prev, local]
        );
    };

    const selecionarTodosImpressao = () => {
        setLocaisSelecionadosImpressao(consumoPorLocal.map(c => c.local));
    };

    const desmarcarTodosImpressao = () => {
        setLocaisSelecionadosImpressao([]);
    };

    const imprimirRelatorio = () => {
        const locaisParaImprimir = consumoPorLocal.filter(c => locaisSelecionadosImpressao.includes(c.local));
        const totalGeralImpressao = locaisParaImprimir.reduce((acc, c) => acc + c.totalLiquido, 0);

        // Período label
        let periodoLabel = '';
        if (usarFiltroMes) {
            periodoLabel = `${MESES[mesInicio]}/${anoInicio} a ${MESES[mesFim]}/${anoFim}`;
        } else {
            periodoLabel = 'Total (todos os dados)';
        }

        setReportData({
            locais: locaisParaImprimir,
            totalGeral: totalGeralImpressao,
            periodoLabel
        });
        setShowPrintModal(false);
        setShowReportPreview(true);
    };

    const fecharReportPreview = () => {
        setShowReportPreview(false);
        setReportData(null);
    };

    const printFromModal = () => {
        if (!reportData) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const ITEMS_FIRST_PAGE = 18;
        const ITEMS_PER_PAGE = 28;
        const emitidoEm = new Date().toLocaleString('pt-BR');

        // Build header HTML helper
        const headerHtml = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:2px solid #000;padding-bottom:20px;">
                <div style="width:100px;text-align:center;">
                    <img src="/images/brasao.png" alt="Brasão" style="width:100%;max-width:80px;" />
                </div>
                <div style="flex:1;text-align:center;color:#000;">
                    <h2 style="margin:0 0 5px 0;font-size:16px;text-transform:uppercase;font-weight:bold;color:#000;">Prefeitura Municipal de Alfenas</h2>
                    <h3 style="margin:0;font-size:12px;text-transform:uppercase;font-weight:normal;color:#000;">Secretaria de Ação Social</h3>
                </div>
                <div style="width:100px;text-align:center;">
                    <img src="/images/cras-logo.png" alt="CRAS" style="width:100%;max-width:100px;" />
                </div>
            </div>
            <div style="text-align:center;margin-bottom:20px;">
                <h2 style="font-size:18px;font-weight:bold;text-decoration:underline;color:#000;">Relatório de Consumo por Local</h2>
            </div>`;

        // Table header helper
        const tableHeaderHtml = `
            <thead>
                <tr style="background:#f0f0f0;">
                    <th style="text-align:left;padding:8px;color:#000;border:1px solid #000;font-size:12px;">Item</th>
                    <th style="text-align:center;padding:8px;color:#000;border:1px solid #000;font-size:12px;min-width:80px;">Enviado</th>
                    <th style="text-align:center;padding:8px;color:#000;border:1px solid #000;font-size:12px;min-width:80px;">Devolvido</th>
                    <th style="text-align:center;padding:8px;color:#000;border:1px solid #000;font-size:12px;min-width:100px;">Consumo Real</th>
                </tr>
            </thead>`;

        // Row helper
        const itemRowHtml = (item: any) => `
            <tr>
                <td style="padding:8px;color:#000;border:1px solid #000;font-size:13px;">
                    ${item.nome}${item.unidade ? ` <small style="color:#555;">(${item.unidade})</small>` : ''}${item.motivos && item.motivos.length > 0 ? ` <em style="color:#b45309;font-size:11px;"> — Devolução: ${item.motivos.join('; ')}</em>` : ''}
                </td>
                <td style="padding:8px;text-align:center;color:#000;border:1px solid #000;font-size:13px;">${item.quantidadeSaida}</td>
                <td style="padding:8px;text-align:center;color:#000;border:1px solid #000;font-size:13px;">${item.quantidadeDevolvida > 0 ? `-${item.quantidadeDevolvida}` : '-'}</td>
                <td style="padding:8px;text-align:center;color:#000;border:1px solid #000;font-size:13px;font-weight:bold;">${item.saldo}</td>
            </tr>`;

        // Calculate total pages
        let totalPages = 0;
        const localPageCounts: number[] = [];
        reportData.locais.forEach(c => {
            const itemCount = c.itens.length;
            if (itemCount <= ITEMS_FIRST_PAGE) {
                localPageCounts.push(1);
                totalPages += 1;
            } else {
                const remaining = itemCount - ITEMS_FIRST_PAGE;
                const extraPages = Math.ceil(remaining / ITEMS_PER_PAGE);
                localPageCounts.push(1 + extraPages);
                totalPages += 1 + extraPages;
            }
        });

        let currentPage = 0;
        const allPagesHtml: string[] = [];

        reportData.locais.forEach((c) => {
            // Split items into chunks
            const chunks: any[][] = [];
            const firstChunk = c.itens.slice(0, ITEMS_FIRST_PAGE);
            chunks.push(firstChunk);
            let offset = ITEMS_FIRST_PAGE;
            while (offset < c.itens.length) {
                chunks.push(c.itens.slice(offset, offset + ITEMS_PER_PAGE));
                offset += ITEMS_PER_PAGE;
            }

            chunks.forEach((chunk, chunkIdx) => {
                currentPage++;
                const isFirstChunk = chunkIdx === 0;
                const isLastPage = currentPage === totalPages;

                const footerHtml = `
                    <div style="margin-top:auto;padding-top:20px;text-align:center;">
                        <div style="font-size:12px;color:#000;">
                            <p>Emitido em: ${emitidoEm} — Página ${currentPage}/${totalPages}</p>
                        </div>
                        <div style="margin-top:4px;font-size:10px;color:#999;">
                            StockOS — Relatório gerado automaticamente
                        </div>
                    </div>`;

                let pageContent = '';

                if (isFirstChunk) {
                    // First page: header + info + summary card + table
                    pageContent = `
                        ${headerHtml}
                        <div style="margin-bottom:16px;font-size:14px;">
                            <div style="margin-bottom:8px;"><strong>Período:</strong> ${reportData!.periodoLabel}</div>
                            <div style="margin-bottom:8px;"><strong>Local:</strong> ${c.local}</div>
                        </div>
                        <div style="display:flex;gap:16px;margin-bottom:20px;">
                            <div style="flex:1;padding:12px 16px;border:1px solid #000;border-radius:4px;text-align:center;">
                                <div style="font-size:11px;color:#666;text-transform:uppercase;margin-bottom:4px;">Total Consumo - ${c.local}</div>
                                <div style="font-size:24px;font-weight:bold;color:#000;">${c.totalLiquido}</div>
                            </div>
                        </div>
                        <div style="flex:1;">
                            <h3 style="font-size:13px;margin-bottom:8px;color:#000;">Relação de Itens — ${c.local}${chunks.length > 1 ? ` (Parte ${chunkIdx + 1}/${chunks.length})` : ''}</h3>
                            <table style="width:100%;border-collapse:collapse;">
                                ${tableHeaderHtml}
                                <tbody>${chunk.map(itemRowHtml).join('')}</tbody>
                            </table>
                        </div>
                        ${footerHtml}`;
                } else {
                    // Continuation page: header + local info + table continuation
                    pageContent = `
                        ${headerHtml}
                        <div style="margin-bottom:12px;font-size:14px;">
                            <div style="margin-bottom:6px;"><strong>Local:</strong> ${c.local} <span style="color:#666;font-size:12px;">(continuação — Parte ${chunkIdx + 1}/${chunks.length})</span></div>
                        </div>
                        <div style="flex:1;">
                            <table style="width:100%;border-collapse:collapse;">
                                ${tableHeaderHtml}
                                <tbody>${chunk.map(itemRowHtml).join('')}</tbody>
                            </table>
                        </div>
                        ${footerHtml}`;
                }

                allPagesHtml.push(`
                    <div class="print-page" style="
                        background: white;
                        padding: 40px;
                        min-height: 29.7cm;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        ${!isLastPage ? 'page-break-after: always;' : ''}
                    ">${pageContent}</div>`);
            });
        });

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Relatório de Consumo por Local</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #000; background: #fff; }
        @media print {
            @page { margin: 0; size: A4 portrait; }
            .print-page {
                page-break-inside: avoid;
                box-shadow: none !important;
            }
        }
    </style>
</head>
<body>${allPagesHtml.join('')}</body>
</html>`;

        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 500);
    };


    if (loadingSaidas || loadingDevolucoes) {
        return (
            <div className="card-base" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Carregando dados dos relatórios...</p>
            </div>
        );
    }

    const totalConsumoGeral = consumoPorLocal.reduce((acc, curr) => acc + curr.totalLiquido, 0);

    return (
        <div style={{ display: 'grid', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>

            {/* Filtros por Mês */}
            <div className="card-base" style={{ padding: 'var(--space-5)' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)' }}>
                        <Calendar size={16} />
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>Período:</span>
                    </div>

                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'var(--font-medium)' }}>De:</span>
                    <select
                        className="input-field"
                        value={mesInicio}
                        onChange={e => setMesInicio(Number(e.target.value))}
                        style={{ width: '140px', height: '36px', fontSize: 'var(--text-sm)' }}
                    >
                        {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select
                        className="input-field"
                        value={anoInicio}
                        onChange={e => setAnoInicio(Number(e.target.value))}
                        style={{ width: '90px', height: '36px', fontSize: 'var(--text-sm)' }}
                    >
                        {anosDisponiveis.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'var(--font-medium)' }}>Até:</span>
                    <select
                        className="input-field"
                        value={mesFim}
                        onChange={e => setMesFim(Number(e.target.value))}
                        style={{ width: '140px', height: '36px', fontSize: 'var(--text-sm)' }}
                    >
                        {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select
                        className="input-field"
                        value={anoFim}
                        onChange={e => setAnoFim(Number(e.target.value))}
                        style={{ width: '90px', height: '36px', fontSize: 'var(--text-sm)' }}
                    >
                        {anosDisponiveis.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    <button
                        className="btn-primary"
                        onClick={aplicarFiltroMes}
                        style={{
                            height: '36px',
                            fontSize: 'var(--text-sm)',
                            padding: '0 var(--space-4)',
                            background: usarFiltroMes ? colors.primary : undefined
                        }}
                    >
                        Filtrar
                    </button>
                    {usarFiltroMes && (
                        <button
                            className="btn-primary"
                            onClick={limparFiltroMes}
                            style={{
                                height: '36px',
                                fontSize: 'var(--text-sm)',
                                padding: '0 var(--space-4)'
                            }}
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            {/* Cards de Resumo */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-4)'
            }}>
                <div className="card-base" style={{
                    background: 'var(--status-success-bg)',
                    borderLeft: '4px solid var(--status-success)',
                    textAlign: 'center',
                    padding: 'var(--space-6) var(--space-4)'
                }}>
                    <div style={{
                        background: 'var(--status-success)',
                        width: 48, height: 48,
                        borderRadius: '50%',
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 'var(--space-3)'
                    }}>
                        <Package size={24} />
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: '6px' }}>
                        Total de Entradas
                    </p>
                    <h3 style={{ margin: 0, fontSize: '2.2em', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                        {loadingEntradas ? '...' : totalEntradasFiltrado}
                    </h3>
                </div>

                <div className="card-base" style={{
                    background: colors.primaryBg,
                    borderLeft: `4px solid ${colors.primary}`,
                    textAlign: 'center',
                    padding: 'var(--space-6) var(--space-4)'
                }}>
                    <div style={{
                        background: colors.primary,
                        width: 48, height: 48,
                        borderRadius: '50%',
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 'var(--space-3)'
                    }}>
                        <ArrowDownRight size={24} />
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: '6px' }}>
                        Total Saídas (Líquido)
                    </p>
                    <h3 style={{ margin: 0, fontSize: '2.2em', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                        {totalConsumoGeral}
                    </h3>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '6px', display: 'inline-block' }}>
                        (Descontando devoluções)
                    </span>
                </div>
            </div>

            {/* Detalhamento por Local */}
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-5)',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)'
                }}>
                    <h2 style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--font-bold)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        color: 'var(--text-primary)',
                        margin: 0
                    }}>
                        <MapPin size={22} style={{ color: colors.primary }} />
                        Consumo por Local (Líquido)
                    </h2>

                    {consumoPorLocal.length > 0 && (
                        <button
                            className="btn-primary"
                            onClick={abrirModalImpressao}
                            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        >
                            <Printer size={16} />
                            Imprimir Relatório
                        </button>
                    )}
                </div>

                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    {consumoPorLocal.map(({ local, totalLiquido, itens }) => (
                        <div key={local} className="card-base" style={{ padding: 0, overflow: 'hidden' }}>
                            <div
                                onClick={() => toggleLocal(local)}
                                style={{
                                    padding: 'var(--space-4) var(--space-5)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'var(--bg-secondary)',
                                    borderBottom: expandedLocais.includes(local) ? '1px solid var(--border)' : 'none',
                                    transition: 'background-color 0.15s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    {expandedLocais.includes(local)
                                        ? <ChevronUp size={18} style={{ color: colors.primary }} />
                                        : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
                                    }
                                    <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                                        {local}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                                        {itens.length} tipos de itens
                                    </span>
                                    <span style={{
                                        fontSize: 'var(--text-sm)',
                                        padding: '4px 14px',
                                        borderRadius: 'var(--radius-sm)',
                                        background: colors.primaryBg,
                                        color: colors.primary,
                                        border: `1px solid ${PURPLE_BORDER}`,
                                        fontWeight: 'var(--font-semibold)'
                                    }}>
                                        Total: {totalLiquido}
                                    </span>
                                </div>
                            </div>

                            {expandedLocais.includes(local) && (
                                <div style={{ padding: 'var(--space-5)' }}>
                                    <div className="table-responsive">
                                        <table style={{ background: 'transparent' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ paddingLeft: 'var(--space-4)' }}>Item</th>
                                                    <th style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Enviado</th>
                                                    <th style={{ textAlign: 'center', color: 'var(--status-success)' }}>Devolvido</th>
                                                    <th style={{ textAlign: 'center', fontWeight: 'bold' }}>Consumo Real</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itens.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 'var(--font-medium)' }}>
                                                            {item.nome}
                                                            {item.unidade && (
                                                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: '6px' }}>
                                                                    ({item.unidade})
                                                                </span>
                                                            )}
                                                            {item.motivos && item.motivos.length > 0 && (
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    fontSize: 'var(--text-xs)',
                                                                    color: '#f59e0b',
                                                                    marginLeft: '8px',
                                                                    fontStyle: 'italic',
                                                                    fontWeight: 'normal'
                                                                }}>
                                                                    — Devolução: {item.motivos.join('; ')}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ textAlign: 'center', color: 'var(--text-muted)', width: '110px', padding: 'var(--space-3) var(--space-4)' }}>
                                                            {item.quantidadeSaida}
                                                        </td>
                                                        <td style={{ textAlign: 'center', color: 'var(--status-success)', width: '110px', padding: 'var(--space-3) var(--space-4)' }}>
                                                            {item.quantidadeDevolvida > 0 ? `-${item.quantidadeDevolvida}` : '-'}
                                                        </td>
                                                        <td style={{ textAlign: 'center', fontWeight: 'var(--font-bold)', width: '130px', padding: 'var(--space-3) var(--space-4)', color: colors.primary }}>
                                                            {item.saldo}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {consumoPorLocal.length === 0 && (
                        <div style={{
                            padding: 'var(--space-6)',
                            textAlign: 'center',
                            border: '1px dashed var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            color: 'var(--text-muted)'
                        }}>
                            Nenhum consumo registrado neste período.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Impressão */}
            {showPrintModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-4)'
                }}
                    onClick={() => setShowPrintModal(false)}
                >
                    <div
                        className="card-elevated"
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            padding: 0
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--space-5)',
                            borderBottom: '1px solid var(--border)'
                        }}>
                            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Printer size={20} style={{ color: colors.primary }} />
                                Imprimir Relatório
                            </h3>
                            <button className="btn-primary" onClick={() => setShowPrintModal(false)} style={{ padding: '6px', minWidth: 'auto', lineHeight: 1 }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: 'var(--space-5)' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                                Selecione os locais que deseja incluir no relatório:
                            </p>

                            {/* Ações rápidas */}
                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                                <button className="btn-secondary" onClick={selecionarTodosImpressao} style={{ fontSize: 'var(--text-xs)', padding: '4px 10px', height: 'auto' }}>
                                    Selecionar Todos
                                </button>
                                <button className="btn-secondary" onClick={desmarcarTodosImpressao} style={{ fontSize: 'var(--text-xs)', padding: '4px 10px', height: 'auto' }}>
                                    Desmarcar Todos
                                </button>
                            </div>

                            {/* Lista de locais */}
                            <div style={{ display: 'grid', gap: 'var(--space-2)', maxHeight: '300px', overflowY: 'auto' }}>
                                {consumoPorLocal.map(c => (
                                    <label
                                        key={c.local}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-3)',
                                            padding: 'var(--space-3)',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            background: locaisSelecionadosImpressao.includes(c.local) ? colors.primaryBg : 'transparent',
                                            border: `1px solid ${locaisSelecionadosImpressao.includes(c.local) ? PURPLE_BORDER : 'var(--border)'}`,
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <div style={{
                                            width: 20, height: 20,
                                            borderRadius: '4px',
                                            border: `2px solid ${locaisSelecionadosImpressao.includes(c.local) ? colors.primary : 'var(--border-strong)'}`,
                                            background: locaisSelecionadosImpressao.includes(c.local) ? colors.primary : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            transition: 'all 0.15s ease'
                                        }}>
                                            {locaisSelecionadosImpressao.includes(c.local) && <Check size={14} color="#fff" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={locaisSelecionadosImpressao.includes(c.local)}
                                            onChange={() => toggleLocalImpressao(c.local)}
                                            style={{ display: 'none' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <span style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>{c.local}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginLeft: 'var(--space-2)' }}>
                                                ({c.itens.length} itens — Total: {c.totalLiquido})
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-4) var(--space-5)',
                            borderTop: '1px solid var(--border)'
                        }}>
                            <button className="btn-primary" onClick={() => setShowPrintModal(false)}>
                                Cancelar
                            </button>

                            <button
                                className="btn-primary"
                                onClick={imprimirRelatorio}
                                disabled={locaisSelecionadosImpressao.length === 0}
                                style={{
                                    background: locaisSelecionadosImpressao.length === 0 ? undefined : colors.primary,
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)'
                                }}
                            >
                                <Printer size={16} />
                                Imprimir ({locaisSelecionadosImpressao.length} {locaisSelecionadosImpressao.length === 1 ? 'local' : 'locais'})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Pré-visualização do Relatório */}
            {showReportPreview && reportData && (
                <div className="documento-modal-overlay">
                    <div className="documento-modal">

                        <div className="documento-header no-print" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--space-4)',
                            borderBottom: '1px solid var(--border)'
                        }}>
                            <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Printer size={20} style={{ color: colors.primary }} /> Relatório de Consumo por Local
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <button onClick={printFromModal} className="btn-primary" style={{ padding: '6px 16px', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: colors.primary }}>
                                    <Printer size={14} /> Imprimir
                                </button>
                                <button onClick={fecharReportPreview} className="btn-primary" style={{ padding: '6px 12px', minWidth: 'auto' }}>✕</button>
                            </div>
                        </div>

                        <div className="documento-content" id="relatorio-para-impressao" style={{ background: '#eee', padding: '20px' }}>
                            {reportData.locais.map((c, localIndex) => (
                                <div
                                    key={c.local}
                                    className="print-page"
                                    style={{
                                        background: 'white',
                                        padding: '40px',
                                        marginBottom: localIndex < reportData.locais.length - 1 ? '20px' : '0',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                        minHeight: '29.7cm',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        pageBreakAfter: localIndex < reportData.locais.length - 1 ? 'always' : 'auto'
                                    }}
                                >
                                    {/* Cabeçalho Institucional */}
                                    <div className="print-header" style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '20px',
                                        borderBottom: '2px solid #000',
                                        paddingBottom: '20px'
                                    }}>
                                        <div style={{ width: '100px', textAlign: 'center' }}>
                                            <img src="/images/brasao.png" alt="Brasão Alfenas" style={{ width: '100%', maxWidth: '80px' }} />
                                        </div>
                                        <div style={{ flex: 1, textAlign: 'center', color: '#000' }}>
                                            <h2 style={{ margin: '0 0 5px 0', fontSize: '16px', textTransform: 'uppercase', fontWeight: 'bold', color: '#000' }}>Prefeitura Municipal de Alfenas</h2>
                                            <h3 style={{ margin: '0', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'normal', color: '#000' }}>Secretaria de Ação Social</h3>
                                        </div>
                                        <div style={{ width: '100px', textAlign: 'center' }}>
                                            <img src="/images/cras-logo.png" alt="Logo CRAS" style={{ width: '100%', maxWidth: '100px' }} />
                                        </div>
                                    </div>

                                    {/* Título do Relatório */}
                                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', color: '#000' }}>Relatório de Consumo por Local</h2>
                                    </div>

                                    {/* Info do Período */}
                                    <div style={{ marginBottom: '20px', fontSize: '14px' }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{ color: '#000' }}><strong>Período:</strong> {reportData.periodoLabel}</span>
                                        </div>
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{ color: '#000' }}><strong>Local:</strong> {c.local}</span>
                                        </div>
                                    </div>

                                    {/* Card de Resumo */}
                                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                        <div style={{ flex: 1, padding: '12px 16px', border: '1px solid #000', borderRadius: '4px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', marginBottom: '4px' }}>Total Consumo - {c.local}</div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>{c.totalLiquido}</div>
                                        </div>
                                    </div>

                                    {/* Tabela de Itens */}
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#000' }}>Relação de Itens — {c.local} (Página {localIndex + 1}/{reportData.locais.length})</h3>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                                            <thead>
                                                <tr style={{ background: '#f0f0f0' }}>
                                                    <th style={{ textAlign: 'left', padding: '8px', color: '#000', border: '1px solid #000', fontSize: '12px' }}>Item</th>
                                                    <th style={{ textAlign: 'center', padding: '8px', color: '#000', border: '1px solid #000', fontSize: '12px', minWidth: '80px' }}>Enviado</th>
                                                    <th style={{ textAlign: 'center', padding: '8px', color: '#000', border: '1px solid #000', fontSize: '12px', minWidth: '80px' }}>Devolvido</th>
                                                    <th style={{ textAlign: 'center', padding: '8px', color: '#000', border: '1px solid #000', fontSize: '12px', minWidth: '100px' }}>Consumo Real</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {c.itens.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ padding: '8px', color: '#000', border: '1px solid #000', fontSize: '13px' }}>
                                                            {item.nome}
                                                            {item.unidade ? <small style={{ color: '#555' }}> ({item.unidade})</small> : null}
                                                            {item.motivos && item.motivos.length > 0 && (
                                                                <em style={{ color: '#b45309', fontSize: '11px' }}> — Devolução: {item.motivos.join('; ')}</em>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '8px', textAlign: 'center', color: '#000', border: '1px solid #000', fontSize: '13px' }}>{item.quantidadeSaida}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center', color: '#000', border: '1px solid #000', fontSize: '13px' }}>{item.quantidadeDevolvida > 0 ? `-${item.quantidadeDevolvida}` : '-'}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center', color: '#000', border: '1px solid #000', fontSize: '13px', fontWeight: 'bold' }}>{item.saldo}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Rodapé */}
                                    <div style={{ marginTop: 'auto', paddingTop: '40px', textAlign: 'center' }}>
                                        <div style={{ marginTop: '20px', fontSize: '12px', color: '#000' }}>
                                            <p>Emitido em: {new Date().toLocaleString('pt-BR')} — Página {localIndex + 1}/{reportData.locais.length}</p>
                                        </div>
                                        <div style={{ marginTop: '8px', fontSize: '10px', color: '#999' }}>
                                            StockOS — Relatório gerado automaticamente
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="documento-actions no-print" style={{
                            display: 'flex',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-4)',
                            justifyContent: 'center'
                        }}>
                            <button onClick={printFromModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: colors.primary }}>
                                <Printer size={16} /> Imprimir Relatório
                            </button>
                            <button onClick={fecharReportPreview} className="btn-primary">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print CSS for Relatório */}
            <style>{`
                .documento-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                    padding: 20px;
                }

                .documento-modal {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    padding: 0;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    width: 95%;
                    max-width: 1000px;
                    max-height: 95vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
                    position: relative;
                }

                @media print {
                    @page {
                        margin: 0;
                        size: A4 portrait;
                    }

                    body * {
                        visibility: hidden;
                    }

                    #relatorio-para-impressao,
                    #relatorio-para-impressao * {
                        visibility: visible;
                    }

                    #relatorio-para-impressao {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 0 !important;
                        background: none !important;
                    }

                    .print-page {
                        page-break-inside: avoid;
                        box-shadow: none !important;
                        margin: 0 !important;
                        border-radius: 0 !important;
                    }

                    .no-print {
                        display: none !important;
                    }

                    .documento-modal-overlay {
                        position: absolute;
                        background: none;
                        padding: 0;
                    }

                    .documento-modal {
                        box-shadow: none;
                        border: none;
                        max-height: none;
                        overflow: visible;
                        width: 100%;
                        max-width: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default RelatorioConsumo;
