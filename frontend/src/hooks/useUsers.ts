import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import type { User, ApiResponse } from '@/types';

export const useUsers = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await api.get('/users', { params });
      return data;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: {
      name: string;
      email: string;
      password: string;
      role: string;
    }) => {
      const { data } = await api.post('/users', userData);
      return data.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Berhasil', description: 'Pengguna berhasil dibuat' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal membuat pengguna',
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> & { password?: string } }) => {
      const { data: res } = await api.put(`/users/${id}`, data);
      return res.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Berhasil', description: 'Pengguna berhasil diperbarui' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal memperbarui pengguna',
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Berhasil', description: 'Pengguna berhasil dihapus' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal menghapus pengguna',
      });
    },
  });
};
