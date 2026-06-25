import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FileText, Users, TrendingUp, Clock, Plus, ArrowRight, Eye,
  CheckCircle2, XCircle, Edit3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { formatRelativeTime, getStatusBadge, cn } from '@/lib/utils';
import type { DashboardStats } from '@/types';

const StatCard = ({
  title, value, icon: Icon, description, color, loading,
}: {
  title: string; value: number | string; icon: any; description?: string;
  color: string; loading?: boolean;
}) => (
  <Card className="card-hover">
    <CardContent className="p-6">
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data.data as DashboardStats;
    },
    refetchInterval: 60000,
  });

  const stats = data?.stats;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">
            Selamat datang, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Berikut ringkasan aktivitas sistem formulir digital PCNU Kota Bandung
          </p>
        </div>
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
          <Button asChild className="bg-nu-700 hover:bg-nu-800 text-white hidden sm:flex">
            <Link to="/forms/new">
              <Plus className="mr-2 h-4 w-4" />
              Buat Formulir
            </Link>
          </Button>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Formulir"
            value={stats?.totalForms ?? 0}
            icon={FileText}
            description="Semua formulir"
            color="bg-blue-500"
            loading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Formulir Aktif"
            value={stats?.activeForms ?? 0}
            icon={CheckCircle2}
            description="Sedang dipublikasi"
            color="bg-nu-700"
            loading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Respon"
            value={stats?.totalResponses ?? 0}
            icon={Users}
            description="Semua waktu"
            color="bg-purple-500"
            loading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Respon Hari Ini"
            value={stats?.todayResponses ?? 0}
            icon={TrendingUp}
            description="Sejak tengah malam"
            color="bg-orange-500"
            loading={isLoading}
          />
        </motion.div>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Response trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Tren Respon 7 Hari Terakhir</CardTitle>
            <CardDescription>Jumlah respon yang diterima setiap hari</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data?.responsesByDay || []}>
                  <defs>
                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F7A3D" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0F7A3D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [`${value} respon`, 'Jumlah']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#0F7A3D"
                    strokeWidth={2}
                    fill="url(#colorGreen)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Forms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Formulir Terpopuler</CardTitle>
            <CardDescription>Berdasarkan jumlah respon</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data?.topForms && data.topForms.length > 0 ? (
              <div className="space-y-3">
                {data.topForms.slice(0, 5).map((form, index) => (
                  <Link
                    key={form.id}
                    to={`/forms/${form.id}/responses`}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-nu-700/10 text-xs font-bold text-nu-700">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{form.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {form._count?.responses || 0} respon
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Belum ada data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Forms */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Formulir Terbaru</CardTitle>
              <CardDescription>Dibuat baru-baru ini</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/forms">
                Lihat semua
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data?.recentForms && data.recentForms.length > 0 ? (
              <div className="space-y-2">
                {data.recentForms.map((form) => {
                  const statusBadge = getStatusBadge(form.status);
                  return (
                    <div
                      key={form.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-nu-700/10">
                          <FileText className="h-4 w-4 text-nu-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{form.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {form._count?.responses || 0} respon
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusBadge.className)}>
                          {statusBadge.label}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <Link to={`/forms/${form.id}/edit`}>
                            <Edit3 className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Belum ada formulir</p>
                <Button variant="outline" size="sm" asChild className="mt-3">
                  <Link to="/forms/new">
                    <Plus className="mr-1.5 h-3 w-3" />
                    Buat Formulir
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Responses */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Respon Terbaru</CardTitle>
              <CardDescription>Pengisian formulir terkini</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data?.recentResponses && data.recentResponses.length > 0 ? (
              <div className="space-y-2">
                {data.recentResponses.map((response) => (
                  <Link
                    key={response.id}
                    to={`/forms/${response.form?.id}/responses`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {response.respondentName || 'Anonim'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {response.form?.title}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(response.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Belum ada respon</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
