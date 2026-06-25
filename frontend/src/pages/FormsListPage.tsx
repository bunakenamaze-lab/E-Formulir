import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Copy } from 'lucide-react';
import { useForms, useDeleteForm, usePublishForm } from '@/hooks/useForms';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { copyToClipboard, generatePublicUrl } from '@/lib/utils';
import Pagination from '@/components/shared/Pagination';
import SearchInput from '@/components/shared/SearchInput';
import FormCard from '@/components/shared/FormCard';
import EmptyState from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';
import type { Form } from '@/types';

export default function FormsListPage() {
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

  const forms: Form[] = data?.data || [];
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
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link to="/templates">
                <Copy className="mr-2 h-4 w-4" />
                Template
              </Link>
            </Button>
            <Button className="bg-nu-700 hover:bg-nu-800 text-white" asChild>
              <Link to="/forms/new">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Buat Formulir</span>
                <span className="sm:hidden">Buat</span>
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Cari formulir..."
          className="flex-1"
        />
        <Select
          value={statusFilter || 'ALL'}
          onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : v); setPage(1); }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="PUBLISHED">Aktif</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="CLOSED">Ditutup</SelectItem>
            <SelectItem value="ARCHIVED">Diarsipkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search || statusFilter ? 'Tidak ada hasil ditemukan' : 'Belum ada formulir'}
          description={
            search || statusFilter
              ? 'Coba ubah kata kunci atau filter pencarian'
              : 'Mulai buat formulir pertama Anda sekarang'
          }
          action={
            isAdmin && !search && !statusFilter ? (
              <Button className="bg-nu-700 hover:bg-nu-800 text-white mt-2" asChild>
                <Link to="/forms/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Formulir Baru
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                isAdmin={isAdmin}
                onDelete={(id) => setDeleteId(id)}
                onPublish={(id) => publishForm.mutate(id)}
                onCopyLink={handleCopyLink}
              />
            ))}
          </motion.div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline" size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >Sebelumnya</Button>
              <span className="flex items-center text-sm text-muted-foreground px-3">
                {page} / {meta.totalPages}
              </span>
              <Button
                variant="outline" size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
              >Selanjutnya</Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Formulir?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua respon yang terkait juga akan terhapus.
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
