import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Search, Filter, FileText, MoreVertical, Eye, Edit3,
  Trash2, Share2, Copy, BarChart3, Globe, Lock, Archive,
} from 'lucide-react';
import { useForms, useDeleteForm, usePublishForm } from '@/hooks/useForms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { cn, formatRelativeTime, getStatusBadge, copyToClipboard, generatePublicUrl } from '@/lib/utils';
import type { Form } from '@/types';

export default function FormsListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useForms({
    page,
    limit: 12,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const deleteForm = useDeleteForm();
  const publishForm = usePublishForm();

  const forms = data?.data || [];
  const meta = data?.meta;

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const handleCopyLink = async (form: Form) => {
    await copyToClipboard(generatePublicUrl(form.slug));
    toast({ title: 'Link disalin!', description: 'Link formulir berhasil disalin ke clipboard' });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteForm.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const badge = getStatusBadge(status);
    return (
      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badge.className)}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Formulir</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kelola semua formulir digital Anda
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/templates">
                <Copy className="mr-2 h-4 w-4" />
                Template
              </Link>
            </Button>
            <Button className="bg-nu-700 hover:bg-nu-800 text-white" asChild>
              <Link to="/forms/new">
                <Plus className="mr-2 h-4 w-4" />
                Buat Formulir
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari formulir..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="PUBLISHED">Aktif</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="CLOSED">Ditutup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Forms Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <FileText className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {search || statusFilter ? 'Tidak ada hasil' : 'Belum ada formulir'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || statusFilter
              ? 'Coba ubah filter pencarian Anda'
              : 'Mulai buat formulir pertama Anda'}
          </p>
          {isAdmin && !search && !statusFilter && (
            <Button className="bg-nu-700 hover:bg-nu-800 text-white" asChild>
              <Link to="/forms/new">
                <Plus className="mr-2 h-4 w-4" />
                Buat Formulir Baru
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {forms.map((form: Form) => (
            <motion.div
              key={form.id}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            >
              <Card className="card-hover group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nu-700/10 shrink-0">
                      <FileText className="h-4 w-4 text-nu-700" />
                    </div>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => navigate(`/forms/${form.id}/edit`)}>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit Formulir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/forms/${form.id}/responses`)}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Lihat Respon
                          </DropdownMenuItem>
                          {form.status !== 'PUBLISHED' && (
                            <DropdownMenuItem onClick={() => publishForm.mutate(form.id)}>
                              <Globe className="mr-2 h-4 w-4" />
                              Publikasi
                            </DropdownMenuItem>
                          )}
                          {form.status === 'PUBLISHED' && (
                            <DropdownMenuItem onClick={() => handleCopyLink(form)}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Salin Link
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(form.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <Link to={`/forms/${form.id}`}>
                    <h3 className="font-semibold text-sm mb-1 hover:text-nu-700 transition-colors line-clamp-2">
                      {form.title}
                    </h3>
                  </Link>

                  {form.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {form.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <StatusBadge status={form.status} />
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        {form._count?.responses ?? 0}
                      </span>
                      <span>{formatRelativeTime(form.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Sebelumnya
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">
            {page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Formulir?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua data respon yang terkait
              juga akan ikut terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
