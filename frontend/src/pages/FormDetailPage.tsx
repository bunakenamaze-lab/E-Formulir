import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Edit3, BarChart3, Share2, QrCode, Globe, Lock, ArrowLeft,
  Copy, Download, Clock, Users, Eye, TrendingUp, ExternalLink,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useForm, usePublishForm, useFormQRCode } from '@/hooks/useForms';
import { formatDateTime, formatRelativeTime, getStatusBadge, copyToClipboard, generatePublicUrl, cn } from '@/lib/utils';

export default function FormDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);

  const { data: form, isLoading } = useForm(id!);
  const publishForm = usePublishForm();
  const { data: qrData } = useFormQRCode(id!);

  const handleCopyLink = async () => {
    if (form) {
      await copyToClipboard(generatePublicUrl(form.slug));
      toast({ title: 'Link disalin!', description: 'Link formulir berhasil disalin' });
    }
  };

  const downloadQR = () => {
    if (!qrData?.qrCode) return;
    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `qr-${form?.slug || 'form'}.png`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (!form) return null;

  const statusBadge = getStatusBadge(form.status);
  const publicUrl = generatePublicUrl(form.slug);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/forms')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold truncate">{form.title}</h1>
            <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', statusBadge.className)}>
              {statusBadge.label}
            </span>
          </div>
          {form.description && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">{form.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/forms/${id}/edit`}>
              <Edit3 className="mr-2 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
          {form.status !== 'PUBLISHED' && (
            <Button
              size="sm"
              className="bg-nu-700 hover:bg-nu-800 text-white"
              onClick={() => publishForm.mutate(id!)}
            >
              <Globe className="mr-2 h-3.5 w-3.5" />
              Publikasi
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Respon', value: form._count?.responses || 0, icon: Users, color: 'bg-blue-500' },
          { label: 'Total Field', value: form._count?.fields || 0, icon: BarChart3, color: 'bg-purple-500' },
          { label: 'Total Dilihat', value: form.viewCount, icon: Eye, color: 'bg-orange-500' },
          {
            label: 'Dibuat',
            value: formatRelativeTime(form.createdAt),
            icon: Clock,
            color: 'bg-nu-700',
          },
        ].map((stat) => (
          <Card key={stat.label} className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shrink-0', stat.color)}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Share */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 className="h-4 w-4 text-nu-700" />
              Bagikan Formulir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.status === 'PUBLISHED' ? (
              <>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                  <p className="text-xs text-muted-foreground flex-1 truncate">{publicUrl}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCopyLink}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyLink}>
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    Salin Link
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowQR(true)}>
                    <QrCode className="mr-2 h-3.5 w-3.5" />
                    QR Code
                  </Button>
                  <Button variant="outline" size="icon" className="shrink-0" asChild>
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Lock className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Publikasi formulir untuk mendapatkan link dan QR Code
                </p>
                <Button
                  size="sm"
                  className="bg-nu-700 hover:bg-nu-800 text-white"
                  onClick={() => publishForm.mutate(id!)}
                >
                  <Globe className="mr-2 h-3.5 w-3.5" />
                  Publikasi Sekarang
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tindakan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to={`/forms/${id}/responses`}>
                <BarChart3 className="mr-2 h-4 w-4 text-purple-500" />
                Lihat Semua Respon
                <Badge variant="secondary" className="ml-auto">{form._count?.responses || 0}</Badge>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to={`/forms/${id}/edit`}>
                <Edit3 className="mr-2 h-4 w-4 text-blue-500" />
                Edit Formulir
              </Link>
            </Button>
            <Separator />
            <div className="text-xs text-muted-foreground space-y-1 pt-1">
              <p>Dibuat: {formatDateTime(form.createdAt)}</p>
              {form.publishedAt && <p>Dipublikasi: {formatDateTime(form.publishedAt)}</p>}
              {form.updatedAt && <p>Diperbarui: {formatDateTime(form.updatedAt)}</p>}
              <p>Dibuat oleh: {form.createdBy?.name}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code Formulir</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrData && (
              <div className="rounded-xl border p-4 bg-white">
                <QRCodeSVG
                  value={publicUrl}
                  size={200}
                  fgColor="#0F7A3D"
                  level="H"
                />
              </div>
            )}
            <p className="text-xs text-center text-muted-foreground px-4">
              Scan QR Code ini untuk mengakses formulir
            </p>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
                <Copy className="mr-2 h-3.5 w-3.5" />
                Salin Link
              </Button>
              <Button className="flex-1 bg-nu-700 hover:bg-nu-800 text-white" onClick={downloadQR}>
                <Download className="mr-2 h-3.5 w-3.5" />
                Unduh QR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
