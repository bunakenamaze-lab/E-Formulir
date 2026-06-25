import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginationMeta } from '@/types';

interface PaginationProps {
  meta: PaginationMeta;
  page: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, page, onPageChange }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
    if (meta.totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= meta.totalPages - 2) return meta.totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <p className="text-xs text-muted-foreground">
        Menampilkan {((page - 1) * meta.limit) + 1}–{Math.min(page * meta.limit, meta.total)} dari {meta.total} data
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? 'default' : 'ghost'}
            size="icon"
            className={`h-7 w-7 text-xs ${p === page ? 'bg-nu-700 hover:bg-nu-800 text-white' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={page >= meta.totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
