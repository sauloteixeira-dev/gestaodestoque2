import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface LogExclusao {
  id: number;
  produto_id: number;
  produto_nome: string;
  produto_codigo_barras: string;
  produto_quantidade: number;
  data_exclusao: string;
  usuario_exclusao: string;
}

interface LogsExclusaoContextData {
  logs: LogExclusao[];
  loading: boolean;
  refreshLogs: () => Promise<void>;
}

const LogsExclusaoContext = createContext<LogsExclusaoContextData>({} as LogsExclusaoContextData);

export const LogsExclusaoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogExclusao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logs_exclusao')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar logs:', error);
      toast.error('Erro ao buscar logs de exclusão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <LogsExclusaoContext.Provider value={{ logs, loading, refreshLogs: fetchLogs }}>
      {children}
    </LogsExclusaoContext.Provider>
  );
};

export const useLogsExclusao = () => {
  return useContext(LogsExclusaoContext);
};
