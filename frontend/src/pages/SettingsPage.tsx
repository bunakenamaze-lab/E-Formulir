import { useEffect, useState } from 'react';
import { Save, Loader2, Settings2, Building2, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { useSettings, useUpdateSetting } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const { theme, setTheme } = useTheme();

  const [orgForm, setOrgForm] = useState({
    name: '',
    shortName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
  });

  useEffect(() => {
    if (settings?.organization) {
      setOrgForm({
        name: settings.organization.name || '',
        shortName: settings.organization.shortName || '',
        email: settings.organization.email || '',
        phone: settings.organization.phone || '',
        address: settings.organization.address || '',
        website: settings.organization.website || '',
      });
    }
  }, [settings]);

  const handleSaveOrg = () => {
    updateSetting.mutate({ key: 'organization', value: orgForm });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-10 bg-muted animate-pulse rounded" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Sistem</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Konfigurasi informasi dan preferensi sistem
        </p>
      </div>

      {/* Informasi Organisasi */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-nu-700" />
            Informasi Organisasi
          </CardTitle>
          <CardDescription>
            Data organisasi yang ditampilkan di seluruh aplikasi dan formulir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nama Lengkap Organisasi</Label>
              <Input
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                placeholder="Pengurus Cabang Nahdlatul Ulama Kota Bandung"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nama Singkat</Label>
              <Input
                value={orgForm.shortName}
                onChange={(e) => setOrgForm({ ...orgForm, shortName: e.target.value })}
                placeholder="PCNU Kota Bandung"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />Email
              </Label>
              <Input
                type="email"
                value={orgForm.email}
                onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                placeholder="info@pcnubandung.or.id"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />Telepon
              </Label>
              <Input
                value={orgForm.phone}
                onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                placeholder="(022) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />Website
            </Label>
            <Input
              value={orgForm.website}
              onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
              placeholder="https://pcnubandung.or.id"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />Alamat Kantor
            </Label>
            <Textarea
              value={orgForm.address}
              onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
              placeholder="Jl. Contoh No. 1, Kota Bandung, Jawa Barat 40111"
              rows={3}
            />
          </div>

          <Button
            onClick={handleSaveOrg}
            className="bg-nu-700 hover:bg-nu-800 text-white"
            disabled={updateSetting.isPending}
          >
            {updateSetting.isPending
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
              : <><Save className="mr-2 h-4 w-4" />Simpan Perubahan</>
            }
          </Button>
        </CardContent>
      </Card>

      {/* Tampilan */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-nu-700" />
            Tampilan
          </CardTitle>
          <CardDescription>Preferensi tampilan aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm">Tema Aplikasi</Label>
            <div className="flex gap-2">
              {[
                { value: 'light', label: '☀️ Terang' },
                { value: 'dark',  label: '🌙 Gelap'  },
                { value: 'system',label: '💻 Sistem' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value as any)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    theme === opt.value
                      ? 'border-nu-700 bg-nu-700/10 text-nu-700'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Versi */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Sistem Formulir Digital PCNU Kota Bandung</span>
            <span className="font-mono text-xs">v1.0.0</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
