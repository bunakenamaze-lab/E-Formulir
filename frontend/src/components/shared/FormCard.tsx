import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, MoreVertical, Edit3, Trash2, Share2, BarChart3,
  Globe, Copy, Eye,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatRelativeTime, getStatusBadge } from '@/lib/utils';
import type { Form } from '@/types';

interface FormCardProps {
  form: Form;
  onDelete?: (id: string) => void;
  onPublish?: (id: string) => void;
  onCopyLink?: (form: Form) => void;
  isAdmin?: boolean;
}

export default function FormCard({
  form,
  onDelete,
  onPublish,
  onCopyLink,
  isAdmin = false,
}: FormCardProps) {
  const statusBadge = getStatusBadge(form.status);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <Card className="card-hover group h-full">
        <CardContent className="p-5 flex flex-col h-full">
          {/* Header */}
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
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild>
                    <Link to={`/forms/${form.id}/edit`}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit Formulir
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/forms/${form.id}/responses`}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Lihat Respon
                    </Link>
                  </DropdownMenuItem>
                  {form.status !== 'PUBLISHED' && onPublish && (
                    <DropdownMenuItem onClick={() => onPublish(form.id)}>
                      <Globe className="mr-2 h-4 w-4" />
                      Publikasi
                    </DropdownMenuItem>
                  )}
                  {form.status === 'PUBLISHED' && onCopyLink && (
                    <DropdownMenuItem onClick={() => onCopyLink(form)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Salin Link
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(form.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Title */}
          <Link to={`/forms/${form.id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 hover:text-nu-700 transition-colors line-clamp-2 leading-snug">
              {form.title}
            </h3>
          </Link>

          {/* Description */}
          {form.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {form.description}
            </p>
          )}

          {/* Category */}
          {form.category && (
            <span className="inline-block text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground mb-2 self-start">
              {form.category}
            </span>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t">
            <span className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              statusBadge.className
            )}>
              {statusBadge.label}
            </span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {form.viewCount ?? 0}
              </span>
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
  );
}
