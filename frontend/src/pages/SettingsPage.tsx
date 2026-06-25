import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, Settings2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get('/settings');
      return data.data;
    },
  });

  const [orgSettings, setOrgSettings] = useState({
    name: '',
    shortName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
  });

  useEffect(() => {
    if (settings?.organization) {
      setOrgSettings(settings.organization);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await api.put('/settings/organization', { value: orgSettings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({ title: 'Pengaturan berhasil disimpan' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Gagal menyimpan pengaturan' });
    },
  });

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Sistem</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Konfigurasi informasi organisasi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-nu-700" />
            Informasi Organisasi
          </CardTitle>
          <CardDescription>Data ini ditampilkan di seluruh aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Lengkap Organisasi</Label>
            <Input
              value={orgSettings.name}
              onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
              placeholder="Pengurus Cabang Nahdlatul Ulama Kota Bandung"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Nama Singkat</Label>
            <Input
              value={orgSettings.shortName}
              onChange={(e) => setOrgSettings({ ...orgSettings, shortName: e.target.value })}
              placeholder="PCNU Kota Bandung"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={orgSettings.email}
                onChange={(e) => setOrgSettings({ ...orgSettings, email: e.target.value })}
                placeholder="info@pcnubandung.or.id"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Telepon</Label>
              <Input
                value={orgSettings.phone}
                onChange={(e) => setOrgSettings({ ...orgSettings, phone: e.target.value })}
                placeholder="(022) 000-0000"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input
              value={orgSettings.website}
              onChange={(e) => setOrgSettings({ ...orgSettings, website: e.target.value })}
              placeholder="https://pcnubandung.or.id"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Alamat Kantor</Label>
            <Textarea
              value={orgSettings.address}
              onChange={(e) => setOrgSettings({ ...orgSettings, address: e.target.value })}
              placeholder="Jl. Contoh No. 1, Kota Bandung"
              rows={3}
            />
          </div>

          <Button
            className="bg-nu-700 hover:bg-nu-800 text-white"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Simpan Pengaturan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
