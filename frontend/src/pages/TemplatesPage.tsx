import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookTemplate, Plus, Loader2, FileText } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useTemplates } from '@/hooks/useForms';
import type { Form } from '@/types';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<Form | null>(null);
  const [formTitle, setFormTitle] = useState('');

  const { data: templates, isLoading } = useTemplates();

  const useTemplateMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data } = await api.post(`/forms/templates/${id}/use`, { title });
      return data.data;
    },
    onSuccess: (newForm) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({ title: 'Formulir berhasil dibuat dari template' });
      navigate(`/forms/${newForm.id}/edit`);
    },
  });

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      useTemplateMutation.mutate({
        id: selectedTemplate.id,
        title: formTitle || selectedTemplate.title,
      });
    }
  };

  const CATEGORY_ICONS: Record<string, string> = {
    Keanggotaan: '👤',
    Kegiatan: '📅',
    Pendataan: '🏛️',
    Survei: '📊',
    Administrasi: '📋',
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Template Formulir</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gunakan template yang sudah disiapkan untuk memulai lebih cepat
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : !templates || templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16">
          <BookTemplate className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Belum ada template tersedia</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {templates.map((template) => (
            <motion.div
              key={template.id}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            >
              <Card className="card-hover h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nu-700/10 text-2xl">
                      {CATEGORY_ICONS[template.category || ''] || '📝'}
                    </div>
                    {template.category && (
                      <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-sm mt-2">{template.title}</CardTitle>
                  {template.description && (
                    <CardDescription className="text-xs line-clamp-2">{template.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {template._count?.fields || 0} field
                    </p>
                    <Button
                      size="sm"
                      className="bg-nu-700 hover:bg-nu-800 text-white text-xs"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setFormTitle(template.title);
                      }}
                    >
                      <Plus className="mr-1.5 h-3 w-3" />
                      Gunakan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Use Template Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gunakan Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Template: <span className="font-medium text-foreground">{selectedTemplate?.title}</span>
            </p>
            <div className="space-y-1.5">
              <Label>Nama Formulir Baru</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Masukkan nama formulir..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Batal</Button>
            <Button
              className="bg-nu-700 hover:bg-nu-800 text-white"
              onClick={handleUseTemplate}
              disabled={!formTitle || useTemplateMutation.isPending}
            >
              {useTemplateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Formulir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
