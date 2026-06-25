import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Save, Loader2, User, Mail, Shield, Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, getInitials, getRoleBadge, cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Password konfirmasi tidak cocok',
  path: ['confirmPassword'],
});

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register: reg1, handleSubmit: hs1, formState: { errors: e1 } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  });

  const { register: reg2, handleSubmit: hs2, reset: r2, formState: { errors: e2 } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfile = useMutation({
    mutationFn: async (data: { name: string }) => {
      const { data: res } = await api.put('/auth/profile', data);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Profil berhasil diperbarui' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: error.response?.data?.message || 'Gagal memperbarui profil' });
    },
  });

  const changePassword = useMutation({
    mutationFn: async (data: any) => {
      await api.put('/auth/profile', data);
    },
    onSuccess: () => {
      r2();
      toast({ title: 'Password berhasil diubah' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: error.response?.data?.message || 'Gagal mengubah password' });
    },
  });

  if (!user) return null;

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Kelola informasi akun Anda</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-nu-700 text-2xl font-bold text-white">
              {getInitials(user.name)}
            </div>
            <div>
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className={cn(
                'inline-flex items-center mt-1 rounded-full px-2 py-0.5 text-xs font-medium',
                roleBadge.variant === 'destructive'
                  ? 'bg-red-100 text-red-700'
                  : roleBadge.variant === 'default'
                  ? 'bg-nu-100 text-nu-800'
                  : 'bg-gray-100 text-gray-700'
              )}>
                {roleBadge.label}
              </span>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Bergabung: {formatDateTime(user.createdAt)}</span>
            </div>
            {user.lastLogin && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Login terakhir: {formatDateTime(user.lastLogin)}</span>
              </div>
            )}
          </div>

          <Separator className="my-5" />

          <form onSubmit={hs1((data) => updateProfile.mutate(data))} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <Input {...reg1('name')} placeholder="Masukkan nama lengkap" />
              {e1.name && <p className="text-xs text-red-500">{e1.name.message}</p>}
            </div>
            <Button
              type="submit"
              className="bg-nu-700 hover:bg-nu-800 text-white"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Simpan Perubahan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ubah Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={hs2((data) => changePassword.mutate(data))} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Password Saat Ini</Label>
              <Input {...reg2('currentPassword')} type="password" placeholder="Masukkan password saat ini" />
              {e2.currentPassword && <p className="text-xs text-red-500">{e2.currentPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Password Baru</Label>
              <Input {...reg2('newPassword')} type="password" placeholder="Minimal 8 karakter" />
              {e2.newPassword && <p className="text-xs text-red-500">{e2.newPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Konfirmasi Password Baru</Label>
              <Input {...reg2('confirmPassword')} type="password" placeholder="Ulangi password baru" />
              {e2.confirmPassword && <p className="text-xs text-red-500">{e2.confirmPassword.message}</p>}
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ubah Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
