import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Save, Eye, Globe, ArrowLeft, Settings2, GripVertical, Plus,
  Trash2, Loader2, ChevronRight, X,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useForm as useFormData, useBulkUpdateFields, usePublishForm, useCreateForm, useUpdateForm } from '@/hooks/useForms';
import api from '@/lib/api';
import type { Field, FieldType, Form } from '@/types';
import FieldTypeList, { FIELD_TYPES } from '@/components/builder/FieldTypeList';
import FieldEditor from '@/components/builder/FieldEditor';
import FormPreview from '@/components/builder/FormPreview';
import { useToast } from '@/components/ui/use-toast';

// Sortable field item
const SortableFieldItem = ({
  field, isSelected, onSelect, onDelete,
}: {
  field: Field; isSelected: boolean; onSelect: () => void; onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fieldTypeMeta = FIELD_TYPES.find((f) => f.type === field.type);
  const Icon = fieldTypeMeta?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        'group flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-all',
        isSelected
          ? 'border-nu-700 bg-nu-700/5 shadow-sm'
          : 'border-border hover:border-nu-700/30 hover:bg-muted/30'
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Icon */}
      {Icon && (
        <div className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
          isSelected ? 'bg-nu-700/15 text-nu-700' : 'bg-muted text-muted-foreground'
        )}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          {field.label || fieldTypeMeta?.label || field.type}
        </p>
        {field.type !== 'SECTION_DIVIDER' && (
          <p className="text-[10px] text-muted-foreground">{fieldTypeMeta?.label}</p>
        )}
      </div>

      {/* Required badge */}
      {field.config.required && (
        <span className="text-red-500 text-xs font-bold shrink-0">*</span>
      )}

      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all shrink-0"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default function FormBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: existingForm, isLoading: isLoadingForm } = useFormData(id || '');

  const [formData, setFormData] = useState<Partial<Form>>({
    title: 'Formulir Baru',
    description: '',
    settings: {
      allowMultiple: true,
      showProgress: false,
      requireAuth: false,
      autoSave: true,
      multiStep: false,
      submitMessage: 'Terima kasih! Respon Anda telah diterima.',
    },
    theme: {
      primaryColor: '#0F7A3D',
      backgroundColor: '#F5F7FA',
      fontFamily: 'Inter',
    },
  });
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<'fields' | 'settings'>('fields');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formId, setFormId] = useState<string | null>(id || null);

  const createForm = useCreateForm();
  const updateFormMutation = useUpdateForm(formId || '');
  const bulkUpdateFields = useBulkUpdateFields(formId || '');
  const publishForm = usePublishForm();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Load existing form
  useEffect(() => {
    if (existingForm) {
      setFormData({
        title: existingForm.title,
        description: existingForm.description,
        settings: existingForm.settings,
        theme: existingForm.theme,
        status: existingForm.status,
      });
      setFields(existingForm.fields || []);
    }
  }, [existingForm]);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  const handleAddField = useCallback((type: FieldType) => {
    const fieldTypeMeta = FIELD_TYPES.find((f) => f.type === type);
    const newField: Field = {
      id: uuidv4(),
      formId: formId || '',
      type,
      label: fieldTypeMeta?.label || type,
      config: {
        required: false,
        options: ['DROPDOWN', 'RADIO', 'CHECKBOX', 'MULTIPLE_CHOICE'].includes(type)
          ? ['Pilihan 1', 'Pilihan 2', 'Pilihan 3']
          : undefined,
        max: type === 'RATING' ? 5 : undefined,
        rows: type === 'TEXTAREA' ? 4 : undefined,
        size: type === 'HEADING' ? 'h2' : undefined,
      },
      order: fields.length,
    };
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
  }, [fields.length, formId]);

  const handleUpdateField = useCallback((updatedField: Field) => {
    setFields((prev) => prev.map((f) => f.id === updatedField.id ? updatedField : f));
  }, []);

  const handleDeleteField = useCallback((fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  }, [selectedFieldId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFields((prev) => {
        const oldIndex = prev.findIndex((f) => f.id === active.id);
        const newIndex = prev.findIndex((f) => f.id === over?.id);
        return arrayMove(prev, oldIndex, newIndex).map((f, i) => ({ ...f, order: i }));
      });
    }
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast({ variant: 'destructive', title: 'Judul formulir wajib diisi' });
      return;
    }

    setIsSaving(true);
    try {
      let savedFormId = formId;

      if (!savedFormId) {
        // Create new form
        const newForm = await createForm.mutateAsync(formData);
        savedFormId = newForm.id;
        setFormId(savedFormId);
      } else {
        // Update form
        await updateFormMutation.mutateAsync(formData);
      }

      // Save fields
      if (savedFormId) {
        const fieldsWithFormId = fields.map((f, i) => ({
          ...f,
          formId: savedFormId!,
          order: i,
        }));

        // Use direct API call for bulk update since formId might be new
        await api.put(`/forms/${savedFormId}/fields/bulk`, {
          fields: fieldsWithFormId,
        });
      }

      toast({ title: 'Berhasil', description: 'Formulir berhasil disimpan' });

      if (!formId && savedFormId) {
        navigate(`/forms/${savedFormId}/edit`, { replace: true });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Gagal menyimpan formulir' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    await handleSave();
    if (formId) {
      await publishForm.mutateAsync(formId);
    }
  };

  if (isEditing && isLoadingForm) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-nu-700 mx-auto" />
          <p className="text-sm text-muted-foreground">Memuat formulir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Builder Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate('/forms')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="h-8 text-sm font-semibold border-none bg-transparent focus-visible:ring-0 px-0 max-w-48"
            placeholder="Judul Formulir..."
          />
          {formData.status && (
            <Badge variant={formData.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-xs shrink-0">
              {formData.status === 'PUBLISHED' ? 'Aktif' : 'Draft'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className="hidden sm:flex"
          >
            <Eye className="mr-2 h-3.5 w-3.5" />
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-2 h-3.5 w-3.5" />
            )}
            Simpan
          </Button>
          {formData.status !== 'PUBLISHED' && (
            <Button
              size="sm"
              className="bg-nu-700 hover:bg-nu-800 text-white"
              onClick={handlePublish}
              disabled={isSaving}
            >
              <Globe className="mr-2 h-3.5 w-3.5" />
              Publikasi
            </Button>
          )}
        </div>
      </div>

      {/* Builder Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Field Types */}
        {!isPreview && (
          <aside className="hidden lg:flex w-56 flex-col border-r bg-background overflow-hidden">
            <div className="px-3 py-3 border-b">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tambah Field
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3">
                <FieldTypeList onAdd={handleAddField} />
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Center - Canvas */}
        <main className="flex-1 overflow-auto bg-muted/20">
          {isPreview ? (
            <div className="p-6 flex justify-center">
              <div className="w-full max-w-2xl">
                <FormPreview
                  form={{ ...formData as Form, fields }}
                  isPreview
                />
              </div>
            </div>
          ) : (
            <div className="p-6 flex justify-center">
              <div className="w-full max-w-2xl space-y-4">
                {/* Form Header Preview */}
                <div
                  className="rounded-xl border bg-background p-6 shadow-sm"
                  style={{ borderTop: `4px solid ${formData.theme?.primaryColor || '#0F7A3D'}` }}
                >
                  <h2 className="text-xl font-bold">
                    {formData.title || 'Judul Formulir'}
                  </h2>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground mt-1">{formData.description}</p>
                  )}
                </div>

                {/* Fields */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {fields.map((field) => (
                        <SortableFieldItem
                          key={field.id}
                          field={field}
                          isSelected={selectedFieldId === field.id}
                          onSelect={() => setSelectedFieldId(
                            selectedFieldId === field.id ? null : field.id
                          )}
                          onDelete={() => handleDeleteField(field.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Add Field Button */}
                {fields.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium mb-1">Mulai membangun formulir</p>
                    <p className="text-xs text-muted-foreground">
                      Pilih tipe field dari panel kiri untuk menambahkan pertanyaan
                    </p>
                  </div>
                ) : (
                  <div className="lg:hidden">
                    <Button variant="outline" className="w-full" onClick={() => handleAddField('TEXT')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Field
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right Panel - Field Editor / Settings */}
        {!isPreview && (
          <aside className="hidden lg:flex w-72 flex-col border-l bg-background overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setRightPanel('fields')}
                className={cn(
                  'flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors',
                  rightPanel === 'fields'
                    ? 'text-nu-700 border-b-2 border-nu-700 bg-nu-700/5'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Field Properties
              </button>
              <button
                onClick={() => setRightPanel('settings')}
                className={cn(
                  'flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors',
                  rightPanel === 'settings'
                    ? 'text-nu-700 border-b-2 border-nu-700 bg-nu-700/5'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Pengaturan
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                <AnimatePresence mode="wait">
                  {rightPanel === 'fields' ? (
                    <motion.div
                      key="field-editor"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      {selectedField ? (
                        <FieldEditor
                          field={selectedField}
                          allFields={fields}
                          onChange={handleUpdateField}
                          onDelete={() => handleDeleteField(selectedField.id)}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Settings2 className="h-8 w-8 text-muted-foreground/30 mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Pilih field untuk mengedit propertinya
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form-settings"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label className="text-xs">Deskripsi Formulir</Label>
                        <Textarea
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Deskripsi formulir..."
                          rows={3}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Pesan Setelah Submit</Label>
                        <Textarea
                          value={formData.settings?.submitMessage || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: { ...formData.settings as any, submitMessage: e.target.value },
                          })}
                          placeholder="Terima kasih! Respon Anda telah diterima."
                          rows={3}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Kategori</Label>
                        <Input
                          value={formData.category || ''}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="Contoh: Keanggotaan, Kegiatan..."
                          className="text-sm"
                        />
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        {[
                          { key: 'allowMultiple', label: 'Boleh Isi Berkali-kali', desc: 'Responden dapat mengisi lebih dari sekali' },
                          { key: 'showProgress', label: 'Tampilkan Progress Bar', desc: 'Tampilkan progress pengisian' },
                          { key: 'autoSave', label: 'Auto Save Draft', desc: 'Simpan otomatis saat mengisi' },
                          { key: 'multiStep', label: 'Multi-step Form', desc: 'Bagi formulir menjadi beberapa halaman' },
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <p className="text-xs font-medium">{setting.label}</p>
                              <p className="text-[10px] text-muted-foreground">{setting.desc}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={(formData.settings as any)?.[setting.key] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings as any,
                                  [setting.key]: e.target.checked,
                                },
                              })}
                              className="h-4 w-4 accent-nu-700"
                            />
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label className="text-xs">Warna Tema</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.theme?.primaryColor || '#0F7A3D'}
                            onChange={(e) => setFormData({
                              ...formData,
                              theme: { ...formData.theme as any, primaryColor: e.target.value },
                            })}
                            className="h-8 w-8 cursor-pointer rounded border"
                          />
                          <Input
                            value={formData.theme?.primaryColor || '#0F7A3D'}
                            onChange={(e) => setFormData({
                              ...formData,
                              theme: { ...formData.theme as any, primaryColor: e.target.value },
                            })}
                            className="text-sm flex-1"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </div>
  );
}
