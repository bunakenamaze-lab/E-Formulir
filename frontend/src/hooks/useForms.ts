import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import type { Form, Field, ApiResponse } from '@/types';

export const useForms = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['forms', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Form[]>>('/forms', { params });
      return data;
    },
  });
};

export const useForm = (id: string) => {
  return useQuery({
    queryKey: ['form', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Form>>(`/forms/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const usePublicForm = (slug: string) => {
  return useQuery({
    queryKey: ['public-form', slug],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Form>>(`/forms/public/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
};

export const useCreateForm = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: Partial<Form>) => {
      const { data } = await api.post<ApiResponse<Form>>('/forms', formData);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({ title: 'Berhasil', description: 'Formulir berhasil dibuat' });
      return data;
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal membuat formulir',
      });
    },
  });
};

export const useUpdateForm = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: Partial<Form>) => {
      const { data } = await api.put<ApiResponse<Form>>(`/forms/${id}`, formData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', id] });
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({ title: 'Berhasil', description: 'Formulir berhasil diperbarui' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal memperbarui formulir',
      });
    },
  });
};

export const useDeleteForm = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/forms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({ title: 'Berhasil', description: 'Formulir berhasil dihapus' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal menghapus formulir',
      });
    },
  });
};

export const usePublishForm = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/forms/${id}/publish`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['form', id] });
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({ title: 'Berhasil', description: 'Formulir berhasil dipublikasi' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal mempublikasi formulir',
      });
    },
  });
};

export const useBulkUpdateFields = (formId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (fields: Field[]) => {
      const { data } = await api.put(`/forms/${formId}/fields/bulk`, { fields });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Gagal menyimpan',
        description: error.response?.data?.message || 'Gagal menyimpan field',
      });
    },
  });
};

export const useFormQRCode = (id: string) => {
  return useQuery({
    queryKey: ['form-qrcode', id],
    queryFn: async () => {
      const { data } = await api.get(`/forms/${id}/qrcode`);
      return data.data as { qrCode: string; publicUrl: string; slug: string };
    },
    enabled: !!id,
  });
};

export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Form[]>>('/forms/templates');
      return data.data;
    },
  });
};

export const useSubmitResponse = (slug: string) => {
  return useMutation({
    mutationFn: async (payload: {
      answers: { fieldId: string; value: any }[];
      respondentName?: string;
      respondentEmail?: string;
      isDraft?: boolean;
      timeSpent?: number;
    }) => {
      const { data } = await api.post(`/forms/public/${slug}/responses`, payload);
      return data.data;
    },
  });
};
