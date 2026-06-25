import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import type { FormResponse, ApiResponse } from '@/types';

export const useResponses = (formId: string, params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['responses', formId, params],
    queryFn: async () => {
      const { data } = await api.get(`/forms/${formId}/responses`, { params });
      return data;
    },
    enabled: !!formId,
  });
};

export const useResponseStats = (formId: string) => {
  return useQuery({
    queryKey: ['response-stats', formId],
    queryFn: async () => {
      const { data } = await api.get(`/forms/${formId}/responses/stats`);
      return data.data as {
        total: number;
        completed: number;
        drafts: number;
        today: number;
        completionRate: number;
      };
    },
    enabled: !!formId,
  });
};

export const useDeleteResponse = (formId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (responseId: string) => {
      await api.delete(`/forms/${formId}/responses/${responseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responses', formId] });
      queryClient.invalidateQueries({ queryKey: ['response-stats', formId] });
      toast({ title: 'Respon dihapus' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal menghapus respon',
      });
    },
  });
};
