import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, formatStr: string = 'dd MMMM yyyy'): string {
  try {
    return format(parseISO(dateString), formatStr, { locale: id });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'dd MMM yyyy, HH:mm', { locale: id });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: id });
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} detik`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit`;
  return `${Math.floor(seconds / 3600)} jam ${Math.floor((seconds % 3600) / 60)} menit`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function getRoleBadge(role: string): { label: string; variant: string } {
  const roles: Record<string, { label: string; variant: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', variant: 'destructive' },
    ADMIN: { label: 'Admin', variant: 'default' },
    OPERATOR: { label: 'Operator', variant: 'secondary' },
  };
  return roles[role] || { label: role, variant: 'outline' };
}

export function getStatusBadge(status: string): { label: string; className: string } {
  const statuses: Record<string, { label: string; className: string }> = {
    DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    PUBLISHED: { label: 'Aktif', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    CLOSED: { label: 'Ditutup', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    ARCHIVED: { label: 'Diarsipkan', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  };
  return statuses[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  return Promise.resolve();
}

export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePublicUrl(slug: string): string {
  return `${window.location.origin}/f/${slug}`;
}
