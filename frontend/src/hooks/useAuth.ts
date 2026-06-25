import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/use-toast';

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', credentials);
      return data.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
      toast({
        title: 'Login Berhasil',
        description: `Selamat datang, ${data.user.name}!`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: error.response?.data?.message || 'Terjadi kesalahan',
      });
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
      navigate('/login');
    },
    onError: () => {
      logout();
      navigate('/login');
    },
  });
};

export const useProfile = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/auth/profile');
      return data.data;
    },
    enabled: isAuthenticated,
  });
};

export const useCurrentUser = () => {
  return useAuthStore((state) => state.user);
};
