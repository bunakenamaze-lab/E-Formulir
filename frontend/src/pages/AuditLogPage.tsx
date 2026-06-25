import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ScrollText } from 'lucide-react';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime, getRoleBadge, cn } from '@/lib/utils';
import type { AuditLog } from '@/types';

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  LOGIN: { label: 'Login', color: 'bg-blue-100 text-blue-700' },
  LOGOUT: { label: 'Logout', color: 'bg-gray-100 text-gray-700' },
  CREATE_FORM: { label: 'Buat Formulir', color: 'bg-green-100 text-green-700' },
  UPDATE_FORM: { label: 'Edit Formulir', color: 'bg-yellow-100 text-yellow-700' },
  DELETE_FORM: { label: 'Hapus Formulir', color: 'bg-red-100 text-red-700' },
  PUBLISH_FORM: { label: 'Publikasi Formulir', color: 'bg-nu-100 text-nu-700' },
  CREATE_RESPONSE: { label: 'Respon Baru', color: 'bg-purple-100 text-purple-700' },
  DELETE_RESPONSE: { label: 'Hapus Respon', color: 'bg-red-100 text-red-700' },
  CREATE_USER: { label: 'Buat Pengguna', color: 'bg-green-100 text-green-700' },
  UPDATE_USER: { label: 'Edit Pengguna', color: 'bg-yellow-100 text-yellow-700' },
  DELETE_USER: { label: 'Hapus Pengguna', color: 'bg-red-100 text-red-700' },
  EXPORT_DATA: { label: 'Ekspor Data', color: 'bg-blue-100 text-blue-700' },
};

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search],
    queryFn: async () => {
      const { data } = await api.get('/audit', { params: { page, limit: 20 } });
      return data;
    },
  });

  const logs: AuditLog[] = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Riwayat semua aktivitas sistem</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Pengguna</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Aksi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Detail</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">IP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <ScrollText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Belum ada log aktivitas</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actionMeta = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-700' };
                  return (
                    <tr key={log.id} className="border-b hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{log.user?.name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{log.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', actionMeta.color)}>
                          {actionMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-40">
                        <p className="truncate">
                          {log.entity} {log.entityId ? `#${log.entityId.slice(0, 8)}...` : ''}
                          {log.details && typeof log.details === 'object' && (log.details as any).formTitle
                            ? `: ${(log.details as any).formTitle}`
                            : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                        {log.ipAddress || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <button
              className="text-xs px-3 py-1.5 rounded border disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Sebelumnya
            </button>
            <span className="flex items-center text-xs text-muted-foreground px-3">
              {page} / {meta.totalPages}
            </span>
            <button
              className="text-xs px-3 py-1.5 rounded border disabled:opacity-50"
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Selanjutnya
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
