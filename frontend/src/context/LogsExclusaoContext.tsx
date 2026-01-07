import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:3001';

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
      const response = await axios.get<LogExclusao[]>(`${API_URL}/logs-exclusao`);
      setLogs(response.data);
    } catch (error) {
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
