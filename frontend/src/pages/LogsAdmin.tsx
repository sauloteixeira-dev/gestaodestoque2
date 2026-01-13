import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { toast } from 'react-toastify';

interface LogEntrada {
    id: number;
    data_entrada: string;
    quantidade: number;
    motivo: string;
    produto: {
        nome: string;
        codigo_barras: string;
    };
    user_id: string;
    user_email?: string; // We will fetch this manually or via join if view exists
}

const LogsAdmin: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState<LogEntrada[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMaster, setIsMaster] = useState(false);

    useEffect(() => {
        checkMaster();
    }, [user]);

    const checkMaster = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error || data?.role !== 'master') {
            toast.error('Acesso negado. Apenas usuários Master podem acessar esta página.');
            navigate('/');
            return;
        }

        setIsMaster(true);
        fetchLogs();
    };

    const fetchLogs = async () => {
        try {
            // Fetch logs
            const { data: logsData, error: logsError } = await supabase
                .from('entradas_estoque')
                .select(`
          *,
          produto:produtos(nome, codigo_barras)
        `)
                .order('data_entrada', { ascending: false });

            if (logsError) throw logsError;

            // Extract unique user IDs
            const userIds = [...new Set(logsData?.map(log => log.user_id).filter(Boolean))];

            // Fetch profiles for these users
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, email, nickname')
                .in('id', userIds);

            const profilesMap = new Map(profilesData?.map(p => [p.id, p]));

            // Combine data
            const enrichedLogs = logsData?.map(log => {
                const profile = profilesMap.get(log.user_id);
                return {
                    ...log,
                    user_email: profile?.nickname || profile?.email || 'Usuário desconhecido'
                };
            });

            setLogs(enrichedLogs || []);
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
            toast.error('Erro ao carregar logs.');
        } finally {
            setLoading(false);
        }
    };

    if (!isMaster) return null;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Logs de Atividades</h1>
                <p className="page-subtitle">Registro de operações de entrada de estoque (Restrito Master)</p>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando logs...</div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Usuário</th>
                                    <th>Produto</th>
                                    <th>Qtd</th>
                                    <th>Motivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.data_entrada).toLocaleString()}</td>
                                        <td style={{ fontWeight: 500, color: 'var(--primary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <User size={16} />
                                                {log.user_email}
                                            </div>
                                        </td>
                                        <td>
                                            <div>{log.produto?.nome}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.produto?.codigo_barras}</div>
                                        </td>
                                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>+{log.quantidade}</td>
                                        <td>{log.motivo}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum registro encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogsAdmin;
