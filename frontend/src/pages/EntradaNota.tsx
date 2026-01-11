import React, { useState } from 'react';
import { useProdutos } from '../context/ProdutoContext';
import { XMLParser } from 'fast-xml-parser';
import { Upload, Check, AlertCircle, FileText, PackagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProdutoNota {
    codigo: string;
    nome: string;
    quantidade: number;
    unidade: string;
}

const EntradaNota: React.FC = () => {
    const [produtos, setProdutos] = useState<ProdutoNota[]>([]);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [chaveAcesso, setChaveAcesso] = useState('');
    const { adicionarProduto } = useProdutos();
    const navigate = useNavigate();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
            const xmlContent = e.target?.result as string;
            parseXML(xmlContent);
        };

        reader.readAsText(file);
    };

    const parseXML = (xml: string) => {
        try {
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: "@_"
            });
            const jsonObj = parser.parse(xml);

            // Tenta encontrar a lista de det (detalhes/itens)
            // Caminho comum: nfeProc -> NFe -> infNFe -> det
            let dets = jsonObj?.nfeProc?.NFe?.infNFe?.det;

            // Se não for nfeProc (pode ser apenas NFe direta)
            if (!dets) {
                dets = jsonObj?.NFe?.infNFe?.det;
            }

            if (!dets) {
                alert('Formato de XML não reconhecido ou sem itens.');
                return;
            }

            // Se for apenas um item, o parser pode retornar objeto em vez de array
            const itens = Array.isArray(dets) ? dets : [dets];

            const produtosExtraidos: ProdutoNota[] = itens.map((item: any) => ({
                codigo: item.prod.cProd,
                nome: item.prod.xProd,
                quantidade: parseFloat(item.prod.qCom),
                unidade: item.prod.uCom
            }));

            setProdutos(produtosExtraidos);
        } catch (error) {
            console.error('Erro ao ler XML:', error);
            alert('Erro ao processar o arquivo XML.');
        }
    };

    const handleConfirmarEntrada = async () => {
        if (produtos.length === 0) return;

        setLoading(true);
        try {
            // Vamos assumir que existe essa função no context ou chamar fetch direto aqui se preferir.
            // Por consistência, tentarei usar o Context se possível, mas como é uma feature nova, talvez seja melhor chamar fetch direto e depois recarregar o context.

            const response = await fetch('http://localhost:3001/api/entrada-estoque', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ produtos })
            });

            if (!response.ok) throw new Error('Falha ao atualizar estoque');

            alert('Entrada de estoque realizada com sucesso!');
            navigate('/');
            // Recarregar página ou contexto seria bom aqui, mas o navigate forçará refresh se o dashboard usar useEffect
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar estoque.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Entrada de Nota Fiscal</h1>
                    <p className="page-subtitle">Importe o XML da NFe para dar entrada no estoque massivamente.</p>
                </div>
            </div>

            {/* Area de Leitura de Código de Barras */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Chave de Acesso da Nota (Código de Barras)
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        value={chaveAcesso}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, ''); // Apenas números
                            setChaveAcesso(val);

                            // Se atingir 44 dígitos (leitura completa)
                            if (val.length === 44) {
                                // Copia para área de transferência para facilitar
                                navigator.clipboard.writeText(val);

                                // Abre o portal da NFe em nova aba
                                // Nota: O portal da fazenda geralmente não aceita a chave via URL por segurança (Captcha),
                                // então abrir a página e ter a chave no Ctrl+V é a melhor UX possível sem API paga.
                                window.open('https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/consultaresumida.xhtml', '_blank');

                                alert('Chave copiada! Cole (Ctrl+V) no site da Fazenda e resolva o Captcha.');
                            }
                        }}
                        maxLength={44}
                        placeholder="Bipe ou digite a chave de 44 dígitos..."
                        className="input-field"
                        autoFocus
                        style={{ flex: 1, fontFamily: 'monospace', letterSpacing: '1px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--success)', opacity: chaveAcesso.length === 44 ? 1 : 0.3 }}>
                        <Check size={24} />
                    </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    * Utilize o leitor de código de barras para preencher este campo rapidamente.
                </p>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ padding: '2rem', border: '2px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                    <input
                        type="file"
                        id="xml-upload"
                        accept=".xml"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="xml-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '64px', height: '64px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Upload size={32} color="var(--primary)" />
                        </div>
                        <div>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Clique para selecionar</span>
                            <span style={{ color: 'var(--text-secondary)' }}> ou arraste o arquivo XML aqui</span>
                        </div>
                        {fileName && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '4px', marginTop: '1rem' }}>
                                <FileText size={16} />
                                <span>{fileName}</span>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            {produtos.length > 0 && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <PackagePlus size={20} />
                            Itens Identificados ({produtos.length})
                        </h2>
                        <button
                            className="btn btn-primary"
                            onClick={handleConfirmarEntrada}
                            disabled={loading}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {loading ? 'Processando...' : (
                                <>
                                    <Check size={18} />
                                    Confirmar Entrada
                                </>
                            )}
                        </button>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Produto</th>
                                    <th>Unidade</th>
                                    <th style={{ textAlign: 'right' }}>Quantidade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtos.map((prod, index) => (
                                    <tr key={index}>
                                        <td style={{ color: 'var(--text-secondary)' }}>{prod.codigo}</td>
                                        <td style={{ fontWeight: 500 }}>{prod.nome}</td>
                                        <td>{prod.unidade}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>
                                            +{prod.quantidade}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntradaNota;
