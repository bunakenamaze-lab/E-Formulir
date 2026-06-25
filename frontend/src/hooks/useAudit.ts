import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { AuditLog } from '@/types';

export const useAuditLogs = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const { data } = await api.get('/audit', { params });
      return data as { data: AuditLog[]; meta: any };
    },
  });
};
