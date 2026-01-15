import React, { useState, useEffect } from 'react';
import { type SaidaEstoque } from '../types';
import { useDevolucao } from '../context/DevolucaoContext';
import { useSaida } from '../context/SaidaContext';
import { useProdutos } from '../context/ProdutoContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ProcessarDevolucaoProps {
    saida: SaidaEstoque;
    onClose: () => void;
    onSuccess: (resultado?: any) => void;
}

interface ItemParaDevolucao {
    item_saida_id: number;
    produto_id: number;
    produto_nome: string;
    produto_codigo_barras?: string;
    quantidade_original: number;
    quantidade_ja_devolvida: number;
    quantidade_disponivel: number;
    quantidade_a_devolver: number;
    selecionado: boolean;
    motivo?: string;
}

const ProcessarDevolucao: React.FC<ProcessarDevolucaoProps> = ({ saida, onClose, onSuccess }) => {
    const { validarDevolucao, criarDevolucao } = useDevolucao();
    const { buscarSaidas } = useSaida();
    const { buscarProdutos } = useProdutos();

    const [itensDisponiveis, setItensDisponiveis] = useState<ItemParaDevolucao[]>([]);
    const [observacao, setObservacao] = useState('');
    const [loading, setLoading] = useState(true);
    const [processando, setProcessando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        carregarDadosDevolucao();
    }, [saida.id]);

    const carregarDadosDevolucao = async () => {
        setLoading(true);
        setErro(null);

        try {
            console.log('Validando devolução para saída ID:', saida.id);
            const validacao = await validarDevolucao(saida.id);
            console.log('Resultado da validação:', validacao);

            if (!validacao || !validacao.pode_devolver) {
                setErro(validacao?.motivo || 'Não é possível processar devolução para esta saída.');
                setLoading(false);
                return;
            }

            const itens: ItemParaDevolucao[] = validacao.itens.map((item: any) => ({
                item_saida_id: item.item_saida_id,
                produto_id: item.produto_id,
                produto_nome: item.produto_nome,
                produto_codigo_barras: item.produto_codigo_barras,
                quantidade_original: item.quantidade_original,
                quantidade_ja_devolvida: item.quantidade_ja_devolvida,
                quantidade_disponivel: item.quantidade_disponivel_devolucao,
                quantidade_a_devolver: 0,
                selecionado: false,
                motivo: ''
            }));

            setItensDisponiveis(itens);
        } catch (error: any) {
            console.error('Erro detalhado ao carregar dados da devolução:', error);
            setErro(`Erro ao carregar dados: ${error.message || 'Erro de conexão'}`);
        } finally {
            setLoading(false);
        }
    };

    const toggleItemSelecionado = (index: number) => {
        const novosItens = [...itensDisponiveis];
        novosItens[index].selecionado = !novosItens[index].selecionado;

        // Se desmarcar, zerar quantidade
        if (!novosItens[index].selecionado) {
            novosItens[index].quantidade_a_devolver = 0;
        } else {
            // Se marcar, colocar quantidade disponível por padrão
            novosItens[index].quantidade_a_devolver = novosItens[index].quantidade_disponivel;
        }

        setItensDisponiveis(novosItens);
    };

    const atualizarQuantidade = (index: number, quantidade: number) => {
        const novosItens = [...itensDisponiveis];
        const item = novosItens[index];

        // Validar quantidade
        if (quantidade < 0) quantidade = 0;
        if (quantidade > item.quantidade_disponivel) quantidade = item.quantidade_disponivel;

        novosItens[index].quantidade_a_devolver = quantidade;
        setItensDisponiveis(novosItens);
    };



    const validarFormulario = (): string | null => {
        const itensSelecionados = itensDisponiveis.filter(i => i.selecionado);

        if (itensSelecionados.length === 0) {
            return 'Selecione pelo menos um item para devolver.';
        }

        for (const item of itensSelecionados) {
            if (item.quantidade_a_devolver <= 0) {
                return `A quantidade a devolver de "${item.produto_nome}" deve ser maior que zero.`;
            }
            if (item.quantidade_a_devolver > item.quantidade_disponivel) {
                return `A quantidade a devolver de "${item.produto_nome}" excede a quantidade disponível.`;
            }
        }

        return null;
    };

    const handleSubmit = async () => {
        const erroValidacao = validarFormulario();
        if (erroValidacao) {
            setErro(erroValidacao);
            return;
        }

        setProcessando(true);
        setErro(null);

        try {
            const itensSelecionados = itensDisponiveis.filter(i => i.selecionado);

            const itensParaDevolucao = itensSelecionados.map(item => ({
                item_saida_id: item.item_saida_id,
                produto_id: item.produto_id,
                produto_nome: item.produto_nome,
                quantidade_devolvida: item.quantidade_a_devolver
            }));

            const resultado = await criarDevolucao(saida.id, itensParaDevolucao, observacao);

            if (resultado.success) {
                // Atualizar dados
                await Promise.all([buscarSaidas(), buscarProdutos()]);
                onSuccess(resultado);
                onClose();
            } else {
                setErro(resultado.error || 'Erro ao processar devolução.');
            }
        } catch (error: any) {
            setErro(error.message || 'Erro ao processar devolução.');
        } finally {
            setProcessando(false);
        }
    };

    const formatarData = (dataString: string) => {
        return new Date(dataString).toLocaleString('pt-BR');
    };

    const formatName = (name: string) => {
        if (!name) return name;
        return name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    };

    const totalItensSelecionados = itensDisponiveis.filter(i => i.selecionado).length;
    const totalQuantidadeDevolucao = itensDisponiveis
        .filter(i => i.selecionado)
        .reduce((sum, i) => sum + i.quantidade_a_devolver, 0);

    return (
        <div className="documento-modal-overlay" style={{ zIndex: 1001, background: 'rgba(0, 0, 0, 0.8)' }}>
            <div className="documento-modal" style={{
                maxWidth: '1000px',
                maxHeight: '90vh',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
            }}>
                {/* Header */}
                <div className="documento-header" style={{
                    padding: 'var(--space-4)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)' }}>
                            ↩️ Processar Devolução
                        </h2>
                        <p style={{ margin: 'var(--space-1) 0 0 0', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                            Selecione os itens que não foram entregues
                        </p>
                    </div>
                    <button onClick={onClose} className="btn-fechar" style={{ fontSize: '24px' }}>✕</button>
                </div>

                {/* Content */}
                <div style={{
                    padding: 'var(--space-4)',
                    overflowY: 'auto',
                    maxHeight: 'calc(90vh - 200px)'
                }}>
                    {/* Dados da Saída Original */}
                    <div className="card-base" style={{ marginBottom: 'var(--space-4)', background: 'var(--bg-secondary)' }}>
                        <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
                            📋 Saída Original
                        </h3>
                        <div style={{ display: 'grid', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                            <div><strong>Local:</strong> {saida.local?.nome}</div>
                            <div><strong>Responsável:</strong> {formatName(saida.usuario_retirada)}</div>
                            <div><strong>Data:</strong> {formatarData(saida.data_saida)}</div>
                            {saida.observacoes && <div><strong>Observações:</strong> {saida.observacoes}</div>}
                            {saida.tem_devolucao && (
                                <div style={{
                                    marginTop: 'var(--space-2)',
                                    padding: 'var(--space-2)',
                                    background: 'var(--status-warning-bg)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--status-warning)'
                                }}>
                                    <AlertCircle size={16} style={{ display: 'inline', marginRight: 'var(--space-1)' }} />
                                    <strong>Atenção:</strong> Esta saída já possui {saida.total_itens_devolvidos} itens devolvidos
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Erro */}
                    {erro && (
                        <div style={{
                            padding: 'var(--space-3)',
                            background: 'var(--status-error-bg)',
                            border: '1px solid var(--status-error)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-4)',
                            color: 'var(--status-error)'
                        }}>
                            <AlertCircle size={16} style={{ display: 'inline', marginRight: 'var(--space-2)' }} />
                            {erro}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                            Carregando dados da devolução...
                        </div>
                    )}

                    {/* Itens Disponíveis */}
                    {!loading && !erro && itensDisponiveis.length > 0 && (
                        <>
                            <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
                                📦 Itens da Saída
                            </h3>

                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '50px', textAlign: 'center' }}>Selec.</th>
                                            <th>Produto</th>
                                            <th style={{ textAlign: 'center', width: '100px' }}>Qtd Original</th>
                                            <th style={{ textAlign: 'center', width: '100px' }}>Já Devolvido</th>
                                            <th style={{ textAlign: 'center', width: '100px' }}>Disponível</th>
                                            <th style={{ textAlign: 'center', width: '120px' }}>Qtd a Devolver</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itensDisponiveis.map((item, index) => (
                                            <React.Fragment key={item.item_saida_id}>
                                                <tr style={{
                                                    background: item.selecionado ? 'var(--status-success-bg)' : 'transparent'
                                                }}>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={item.selecionado}
                                                            onChange={() => toggleItemSelecionado(index)}
                                                            disabled={item.quantidade_disponivel === 0}
                                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 'var(--font-medium)' }}>{item.produto_nome}</div>
                                                        {item.produto_codigo_barras && (
                                                            <div className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                                                {item.produto_codigo_barras}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }} className="mono">{item.quantidade_original}</td>
                                                    <td style={{ textAlign: 'center' }} className="mono">
                                                        {item.quantidade_ja_devolvida > 0 ? (
                                                            <span style={{ color: 'var(--status-warning)' }}>{item.quantidade_ja_devolvida}</span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }} className="mono">
                                                        <strong>{item.quantidade_disponivel}</strong>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={item.quantidade_disponivel}
                                                            value={item.quantidade_a_devolver}
                                                            onChange={(e) => atualizarQuantidade(index, parseInt(e.target.value) || 0)}
                                                            disabled={!item.selecionado || item.quantidade_disponivel === 0}
                                                            className="input-field"
                                                            style={{
                                                                width: '80px',
                                                                textAlign: 'center',
                                                                padding: 'var(--space-1)',
                                                                fontSize: '14px'
                                                            }}
                                                        />
                                                    </td>
                                                </tr>

                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Observações */}
                            <div style={{ marginTop: 'var(--space-4)' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 'var(--space-2)',
                                    fontWeight: 'var(--font-medium)'
                                }}>
                                    Observações / Motivo da Devolução
                                </label>
                                <textarea
                                    value={observacao}
                                    onChange={(e) => setObservacao(e.target.value)}
                                    className="input-field"
                                    rows={3}
                                    placeholder="Descreva o motivo da devolução (opcional, mas recomendado)..."
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>

                            {/* Resumo */}
                            {totalItensSelecionados > 0 && (
                                <div className="card-base" style={{
                                    marginTop: 'var(--space-4)',
                                    background: 'var(--status-success-bg)',
                                    border: '1px solid var(--status-success)'
                                }}>
                                    <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-base)', display: 'flex', alignItems: 'center' }}>
                                        <CheckCircle size={18} style={{ marginRight: 'var(--space-2)' }} />
                                        Resumo da Devolução
                                    </h4>
                                    <div style={{ fontSize: 'var(--text-sm)' }}>
                                        <div><strong>Produtos selecionados:</strong> {totalItensSelecionados}</div>
                                        <div><strong>Total de itens a devolver:</strong> {totalQuantidadeDevolucao}</div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer com Ações */}
                <div style={{
                    padding: 'var(--space-4)',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    gap: 'var(--space-3)',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={processando}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn-primary"
                        disabled={processando || loading || totalItensSelecionados === 0}
                    >
                        {processando ? 'Processando...' : `✓ Confirmar Devolução (${totalItensSelecionados} itens)`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProcessarDevolucao;
