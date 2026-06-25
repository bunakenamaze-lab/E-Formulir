import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Search, Filter, Download, Eye, Trash2, MoreVertical,
  Users, CheckCircle2, Clock, TrendingUp,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from '@/hooks/useForms';
import { useExport } from '@/hooks/useExport';
import { formatDateTime, formatDuration, cn } from '@/lib/utils';
import type { FormResponse } from '@/types';

export default function FormResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: form } = useForm(id!);
  const { exportFile } = useExport();

  const { data: responsesData, isLoading } = useQuery({
    queryKey: ['responses', id, page, search],
    queryFn: async () => {
      const { data } = await api.get(`/forms/${id}/responses`, {
        params: { page, limit: 15, search: search || undefined, isCompleted: true },
      });
      return data;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['response-stats', id],
    queryFn: async () => {
      const { data } = await api.get(`/forms/${id}/responses/stats`);
      return data.data;
    },
  });

  const deleteResponse = useMutation({
    mutationFn: async (responseId: string) => {
      await api.delete(`/forms/${id}/responses/${responseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responses', id] });
      queryClient.invalidateQueries({ queryKey: ['response-stats', id] });
      toast({ title: 'Respon dihapus' });
      setDeleteId(null);
    },
  });

  const handleExport = async (format: 'excel' | 'csv') => {
    await exportFile(id!, format, form?.title);
  };

  const responses: FormResponse[] = responsesData?.data || [];
  const meta = responsesData?.meta;
  const stats = statsData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/forms/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">Respon Formulir</h1>
          <p className="text-sm text-muted-foreground truncate">{form?.title}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-3.5 w-3.5" />
              Ekspor
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              📊 Export Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              📄 Export CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Respon', value: stats?.total ?? 0, icon: Users, color: 'bg-blue-500' },
          { label: 'Selesai', value: stats?.completed ?? 0, icon: CheckCircle2, color: 'bg-nu-700' },
          { label: 'Hari Ini', value: stats?.today ?? 0, icon: TrendingUp, color: 'bg-orange-500' },
          { label: 'Tingkat Selesai', value: `${stats?.completionRate ?? 0}%`, icon: Clock, color: 'bg-purple-500' },
        ].map((stat) => (
          <Card key={stat.label} className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', stat.color)}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari berdasarkan nama atau email responden..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9"
        />
      </div>

      {/* Responses Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Waktu Pengisian</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Tanggal</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : responses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada respon</p>
                  </td>
                </tr>
              ) : (
                responses.map((response, index) => (
                  <tr key={response.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {((page - 1) * 15) + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{response.respondentName || 'Anonim'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {response.respondentEmail || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {response.timeSpent ? formatDuration(response.timeSpent) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDateTime(response.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setSelectedResponse(response)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={() => setDeleteId(response.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Sebelumnya
            </Button>
            <span className="flex items-center text-sm text-muted-foreground px-3">
              {page} / {meta.totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>
              Selanjutnya
            </Button>
          </div>
        )}
      </Card>

      {/* Response Detail Dialog */}
      <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Respon</DialogTitle>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/30 p-3 space-y-1 text-sm">
                <p><span className="font-medium">Nama:</span> {selectedResponse.respondentName || 'Anonim'}</p>
                <p><span className="font-medium">Email:</span> {selectedResponse.respondentEmail || '-'}</p>
                <p><span className="font-medium">Tanggal:</span> {formatDateTime(selectedResponse.createdAt)}</p>
                {selectedResponse.timeSpent && (
                  <p><span className="font-medium">Waktu Pengisian:</span> {formatDuration(selectedResponse.timeSpent)}</p>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold">Jawaban:</p>
                {selectedResponse.answers?.map((answer) => (
                  <div key={answer.id} className="rounded-lg border p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {answer.field?.label}
                    </p>
                    <p className="text-sm">
                      {Array.isArray(answer.value)
                        ? answer.value.join(', ')
                        : String(answer.value ?? '-')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Respon?</AlertDialogTitle>
            <AlertDialogDescription>
              Respon ini akan dihapus permanen dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteResponse.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
