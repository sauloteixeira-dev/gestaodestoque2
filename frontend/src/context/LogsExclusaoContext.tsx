import React, { createContext, useState, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

import { type LogExclusao } from '../types';

interface LogsExclusaoContextData {
  logs: LogExclusao[];
  loading: boolean;
  refreshLogs: () => Promise<void>;
}

const LogsExclusaoContext = createContext<LogsExclusaoContextData>({} as LogsExclusaoContextData);

export const LogsExclusaoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogExclusao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logs_exclusao')
        .select('*')
        .order('data_exclusao', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar logs:', error);
      toast.error('Erro ao buscar logs de exclusão.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <LogsExclusaoContext.Provider value={{ logs, loading, refreshLogs: fetchLogs }}>
      {children}
    </LogsExclusaoContext.Provider>
  );
};

export const useLogsExclusao = () => {
  return useContext(LogsExclusaoContext);
};
