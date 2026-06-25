import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Field, FieldConfig } from '@/types';

interface FieldEditorProps {
  field: Field;
  allFields: Field[];
  onChange: (field: Field) => void;
  onDelete: () => void;
}

const CHOICE_FIELD_TYPES = ['DROPDOWN', 'RADIO', 'CHECKBOX', 'MULTIPLE_CHOICE'];
const TEXT_FIELD_TYPES = ['TEXT', 'TEXTAREA', 'EMAIL', 'PHONE', 'NUMBER'];
const LAYOUT_TYPES = ['SECTION_DIVIDER', 'HEADING', 'DESCRIPTION'];

export default function FieldEditor({ field, allFields, onChange, onDelete }: FieldEditorProps) {
  const [optionsInput, setOptionsInput] = useState(
    (field.config.options || []).join('\n')
  );

  const updateField = (updates: Partial<Field>) => {
    onChange({ ...field, ...updates });
  };

  const updateConfig = (configUpdates: Partial<FieldConfig>) => {
    onChange({ ...field, config: { ...field.config, ...configUpdates } });
  };

  const handleOptionsChange = (value: string) => {
    setOptionsInput(value);
    const options = value.split('\n').filter((o) => o.trim());
    updateConfig({ options });
  };

  const isLayout = LAYOUT_TYPES.includes(field.type);
  const isChoice = CHOICE_FIELD_TYPES.includes(field.type);
  const isText = TEXT_FIELD_TYPES.includes(field.type);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic">
        <TabsList className="w-full">
          <TabsTrigger value="basic" className="flex-1 text-xs">Dasar</TabsTrigger>
          {!isLayout && <TabsTrigger value="validation" className="flex-1 text-xs">Validasi</TabsTrigger>}
          {!isLayout && <TabsTrigger value="conditional" className="flex-1 text-xs">Kondisi</TabsTrigger>}
        </TabsList>

        {/* Basic Tab */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          {/* Label */}
          {field.type !== 'SECTION_DIVIDER' && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                {isLayout ? 'Teks' : 'Label'} <span className="text-red-500">*</span>
              </Label>
              <Input
                value={field.label}
                onChange={(e) => updateField({ label: e.target.value })}
                placeholder={isLayout ? 'Masukkan teks...' : 'Masukkan label field...'}
                className="text-sm"
              />
            </div>
          )}

          {/* Heading size */}
          {field.type === 'HEADING' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Ukuran Judul</Label>
              <Select
                value={field.config.size || 'h2'}
                onValueChange={(v) => updateConfig({ size: v })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1 - Judul Besar</SelectItem>
                  <SelectItem value="h2">H2 - Judul Sedang</SelectItem>
                  <SelectItem value="h3">H3 - Judul Kecil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description content */}
          {field.type === 'DESCRIPTION' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Isi Deskripsi</Label>
              <Textarea
                value={field.helpText || ''}
                onChange={(e) => updateField({ helpText: e.target.value })}
                placeholder="Masukkan teks deskripsi..."
                rows={3}
                className="text-sm"
              />
            </div>
          )}

          {/* Placeholder */}
          {isText && (
            <div className="space-y-1.5">
              <Label className="text-xs">Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => updateField({ placeholder: e.target.value })}
                placeholder="Teks placeholder..."
                className="text-sm"
              />
            </div>
          )}

          {/* Help Text */}
          {!isLayout && (
            <div className="space-y-1.5">
              <Label className="text-xs">Teks Bantuan</Label>
              <Input
                value={field.helpText || ''}
                onChange={(e) => updateField({ helpText: e.target.value })}
                placeholder="Petunjuk pengisian..."
                className="text-sm"
              />
            </div>
          )}

          {/* Options for choice fields */}
          {isChoice && (
            <div className="space-y-1.5">
              <Label className="text-xs">Pilihan (satu per baris)</Label>
              <Textarea
                value={optionsInput}
                onChange={(e) => handleOptionsChange(e.target.value)}
                placeholder={`Pilihan 1\nPilihan 2\nPilihan 3`}
                rows={5}
                className="text-sm font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                {field.config.options?.length || 0} pilihan tersedia
              </p>
            </div>
          )}

          {/* Rating max */}
          {field.type === 'RATING' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Nilai Maksimum</Label>
              <Select
                value={String(field.config.max || 5)}
                onValueChange={(v) => updateConfig({ max: parseInt(v) })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Bintang</SelectItem>
                  <SelectItem value="5">5 Bintang</SelectItem>
                  <SelectItem value="10">10 Poin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Textarea rows */}
          {field.type === 'TEXTAREA' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Jumlah Baris</Label>
              <Input
                type="number"
                value={field.config.rows || 4}
                min={2}
                max={20}
                onChange={(e) => updateConfig({ rows: parseInt(e.target.value) })}
                className="text-sm"
              />
            </div>
          )}

          {/* Required toggle */}
          {!isLayout && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-xs font-medium">Wajib Diisi</p>
                <p className="text-[10px] text-muted-foreground">Responden harus mengisi field ini</p>
              </div>
              <Switch
                checked={field.config.required || false}
                onCheckedChange={(checked) => updateConfig({ required: checked })}
              />
            </div>
          )}
        </TabsContent>

        {/* Validation Tab */}
        {!isLayout && (
          <TabsContent value="validation" className="space-y-4 mt-4">
            {isText && field.type !== 'NUMBER' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Minimal Karakter</Label>
                  <Input
                    type="number"
                    value={field.config.minLength || ''}
                    min={0}
                    onChange={(e) => updateConfig({ minLength: parseInt(e.target.value) || undefined })}
                    placeholder="Tidak ada batas minimum"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Maksimal Karakter</Label>
                  <Input
                    type="number"
                    value={field.config.maxLength || ''}
                    min={1}
                    onChange={(e) => updateConfig({ maxLength: parseInt(e.target.value) || undefined })}
                    placeholder="Tidak ada batas maksimum"
                    className="text-sm"
                  />
                </div>
              </>
            )}

            {field.type === 'NUMBER' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nilai Minimum</Label>
                  <Input
                    type="number"
                    value={field.config.min ?? ''}
                    onChange={(e) => updateConfig({ min: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Tidak ada batas minimum"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nilai Maksimum</Label>
                  <Input
                    type="number"
                    value={field.config.max ?? ''}
                    onChange={(e) => updateConfig({ max: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Tidak ada batas maksimum"
                    className="text-sm"
                  />
                </div>
              </>
            )}

            {(field.type === 'FILE_UPLOAD' || field.type === 'IMAGE_UPLOAD') && (
              <div className="space-y-1.5">
                <Label className="text-xs">Ukuran Maksimal File</Label>
                <Select
                  value={String(field.config.maxSize || 5242880)}
                  onValueChange={(v) => updateConfig({ maxSize: parseInt(v) })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1048576">1 MB</SelectItem>
                    <SelectItem value="2097152">2 MB</SelectItem>
                    <SelectItem value="5242880">5 MB</SelectItem>
                    <SelectItem value="10485760">10 MB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Nilai Default</Label>
              <Input
                value={field.config.defaultValue || ''}
                onChange={(e) => updateConfig({ defaultValue: e.target.value })}
                placeholder="Nilai awal field"
                className="text-sm"
              />
            </div>
          </TabsContent>
        )}

        {/* Conditional Tab */}
        {!isLayout && (
          <TabsContent value="conditional" className="space-y-4 mt-4">
            <p className="text-xs text-muted-foreground">
              Tampilkan field ini hanya jika kondisi berikut terpenuhi:
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Berdasarkan Field</Label>
                <Select
                  value={field.conditional?.showIf?.fieldId || ''}
                  onValueChange={(v) => {
                    if (!v) {
                      onChange({ ...field, conditional: undefined });
                    } else {
                      onChange({
                        ...field,
                        conditional: {
                          showIf: {
                            fieldId: v,
                            operator: field.conditional?.showIf?.operator || 'equals',
                            value: field.conditional?.showIf?.value || '',
                          },
                        },
                      });
                    }
                  }}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Pilih field..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tidak ada kondisi</SelectItem>
                    {allFields
                      .filter((f) => f.id !== field.id && !LAYOUT_TYPES.includes(f.type))
                      .map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {field.conditional?.showIf?.fieldId && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Operator</Label>
                    <Select
                      value={field.conditional.showIf.operator}
                      onValueChange={(v: any) => onChange({
                        ...field,
                        conditional: {
                          showIf: { ...field.conditional!.showIf!, operator: v },
                        },
                      })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Sama dengan</SelectItem>
                        <SelectItem value="not_equals">Tidak sama dengan</SelectItem>
                        <SelectItem value="contains">Mengandung</SelectItem>
                        <SelectItem value="not_contains">Tidak mengandung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Nilai</Label>
                    <Input
                      value={field.conditional.showIf.value || ''}
                      onChange={(e) => onChange({
                        ...field,
                        conditional: {
                          showIf: { ...field.conditional!.showIf!, value: e.target.value },
                        },
                      })}
                      placeholder="Masukkan nilai kondisi..."
                      className="text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      <Separator />

      {/* Delete button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="w-full"
      >
        <Trash2 className="mr-2 h-3.5 w-3.5" />
        Hapus Field
      </Button>
    </div>
  );
}
