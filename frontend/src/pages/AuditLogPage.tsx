import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import DataTable, { Column } from '@/components/shared/DataTable';
import Pagination from '@/components/shared/Pagination';
import { formatDateTime, cn } from '@/lib/utils';
import type { AuditLog, PaginationMeta } from '@/types';

const ACTION_META: Record<string, { label: string; color: string }> = {
  LOGIN:           { label: 'Login',             color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  LOGOUT:          { label: 'Logout',            color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  CREATE_FORM:     { label: 'Buat Formulir',     color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  UPDATE_FORM:     { label: 'Edit Formulir',     color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  DELETE_FORM:     { label: 'Hapus Formulir',    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  PUBLISH_FORM:    { label: 'Publikasi',         color: 'bg-nu-100 text-nu-800 dark:bg-nu-900/30 dark:text-nu-400' },
  CREATE_RESPONSE: { label: 'Respon Baru',       color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  UPDATE_RESPONSE: { label: 'Edit Respon',       color: 'bg-yellow-100 text-yellow-700' },
  DELETE_RESPONSE: { label: 'Hapus Respon',      color: 'bg-red-100 text-red-700' },
  CREATE_USER:     { label: 'Buat Pengguna',     color: 'bg-green-100 text-green-700' },
  UPDATE_USER:     { label: 'Edit Pengguna',     color: 'bg-yellow-100 text-yellow-700' },
  DELETE_USER:     { label: 'Hapus Pengguna',    color: 'bg-red-100 text-red-700' },
  EXPORT_DATA:     { label: 'Ekspor Data',       color: 'bg-blue-100 text-blue-700' },
};

export default function AuditLogPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: async () => {
      const { data } = await api.get('/audit', { params: { page, limit: 20 } });
      return data as { data: AuditLog[]; meta: PaginationMeta };
    },
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'user',
      header: 'Pengguna',
      render: (log) => (
        <div>
          <p className="text-sm font-medium">{log.user?.name || '–'}</p>
          <p className="text-xs text-muted-foreground">{log.user?.email}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      render: (log) => {
        const meta = ACTION_META[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-700' };
        return (
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', meta.color)}>
            {meta.label}
          </span>
        );
      },
    },
    {
      key: 'detail',
      header: 'Detail',
      render: (log) => (
        <p className="text-xs text-muted-foreground max-w-xs truncate">
          {log.entity}
          {(log.details as any)?.formTitle ? ` — ${(log.details as any).formTitle}` : ''}
          {(log.details as any)?.email ? ` — ${(log.details as any).email}` : ''}
        </p>
      ),
    },
    {
      key: 'ip',
      header: 'IP Address',
      render: (log) => (
        <span className="text-xs font-mono text-muted-foreground">{log.ipAddress || '–'}</span>
      ),
    },
    {
      key: 'time',
      header: 'Waktu',
      render: (log) => (
        <span className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Riwayat semua aktivitas pengguna dalam sistem
        </p>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          rowKey={(log) => log.id}
          emptyIcon={<ScrollText className="h-8 w-8 text-muted-foreground/30" />}
          emptyTitle="Belum ada log aktivitas"
        />
        {data?.meta && (
          <Pagination meta={data.meta} page={page} onPageChange={setPage} />
        )}
      </Card>
    </div>
  );
}
