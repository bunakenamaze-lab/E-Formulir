import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/use-toast';

// Sama seperti api.ts — /api di production, http://localhost:3000/api di development
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const useExport = () => {
  const { accessToken } = useAuthStore();
  const { toast } = useToast();

  const exportFile = async (formId: string, format: 'excel' | 'csv', formTitle?: string) => {
    try {
      const endpoint = `${API_BASE}/export/${formId}/${format}`;
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || 'Export gagal');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const ext = format === 'excel' ? 'xlsx' : 'csv';
      const filename = `respon-${(formTitle || formId)
        .replace(/[^a-zA-Z0-9]/g, '-')
        .toLowerCase()}-${Date.now()}.${ext}`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: 'Export berhasil', description: `File ${filename} berhasil diunduh` });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Export gagal',
        description: error.message || 'Terjadi kesalahan saat mengekspor data',
      });
    }
  };

  return { exportFile };
};
