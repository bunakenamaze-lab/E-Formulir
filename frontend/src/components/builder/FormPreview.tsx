import { useState } from 'react';
import { Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Form, Field } from '@/types';

interface FormPreviewProps {
  form: Form;
  isPreview?: boolean;
}

const FieldPreview = ({ field }: { field: Field }) => {
  const [value, setValue] = useState<any>(null);
  const [rating, setRating] = useState(0);

  const labelEl = (
    <Label className="text-sm font-medium">
      {field.label}
      {field.config.required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
  );

  const helpEl = field.helpText && (
    <p className="text-xs text-muted-foreground">{field.helpText}</p>
  );

  switch (field.type) {
    case 'SECTION_DIVIDER':
      return <Separator className="my-2" />;

    case 'HEADING':
      const sizes: Record<string, string> = {
        h1: 'text-2xl', h2: 'text-xl', h3: 'text-lg',
      };
      return (
        <h3 className={cn('font-bold', sizes[field.config.size || 'h2'])}>
          {field.label}
        </h3>
      );

    case 'DESCRIPTION':
      return (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {field.helpText || field.label}
        </p>
      );

    case 'TEXT':
    case 'EMAIL':
    case 'PHONE':
    case 'NUMBER':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Input
            type={field.type === 'NUMBER' ? 'number' : field.type === 'EMAIL' ? 'email' : 'text'}
            placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}...`}
            readOnly
            className="text-sm"
          />
          {helpEl}
        </div>
      );

    case 'TEXTAREA':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Textarea
            placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}...`}
            rows={field.config.rows || 4}
            readOnly
            className="text-sm"
          />
          {helpEl}
        </div>
      );

    case 'DATE':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Input type="date" readOnly className="text-sm" />
          {helpEl}
        </div>
      );

    case 'TIME':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Input type="time" readOnly className="text-sm" />
          {helpEl}
        </div>
      );

    case 'DROPDOWN':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Pilih salah satu...</option>
            {field.config.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {helpEl}
        </div>
      );

    case 'RADIO':
    case 'MULTIPLE_CHOICE':
      return (
        <div className="space-y-2">
          {labelEl}
          <div className="space-y-2">
            {field.config.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer hover:bg-muted/30 transition-colors text-sm">
                <input type="radio" name={field.id} value={opt} className="accent-nu-700" />
                {opt}
              </label>
            ))}
          </div>
          {helpEl}
        </div>
      );

    case 'CHECKBOX':
      return (
        <div className="space-y-2">
          {labelEl}
          <div className="space-y-2">
            {field.config.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer hover:bg-muted/30 transition-colors text-sm">
                <input type="checkbox" value={opt} className="accent-nu-700" />
                {opt}
              </label>
            ))}
          </div>
          {helpEl}
        </div>
      );

    case 'RATING':
      const maxRating = field.config.max || 5;
      return (
        <div className="space-y-2">
          {labelEl}
          <div className="flex gap-1">
            {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-colors"
              >
                <Star
                  className={cn(
                    'h-7 w-7 transition-colors',
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  )}
                />
              </button>
            ))}
          </div>
          {helpEl}
        </div>
      );

    case 'FILE_UPLOAD':
    case 'IMAGE_UPLOAD':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground">
                  Klik atau seret file ke sini
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {field.type === 'IMAGE_UPLOAD' ? 'PNG, JPG, WEBP' : 'PDF, DOC, XLSX'} maks. {Math.round((field.config.maxSize || 5242880) / 1048576)} MB
                </p>
              </div>
            </label>
          </div>
          {helpEl}
        </div>
      );

    case 'SIGNATURE':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <div className="w-full h-24 border-2 rounded-lg bg-muted/20 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Area Tanda Tangan</p>
          </div>
          {helpEl}
        </div>
      );

    case 'LOCATION':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <div className="w-full h-32 border rounded-lg bg-muted/20 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">🗺️ Peta akan ditampilkan di sini</p>
          </div>
          {helpEl}
        </div>
      );

    default:
      return null;
  }
};

export default function FormPreview({ form, isPreview }: FormPreviewProps) {
  const primaryColor = form.theme?.primaryColor || '#0F7A3D';

  return (
    <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
      {/* Form Header */}
      <div
        className="px-6 py-5"
        style={{ borderBottom: `3px solid ${primaryColor}` }}
      >
        <h1 className="text-xl font-bold">{form.title || 'Judul Formulir'}</h1>
        {form.description && (
          <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
        )}
      </div>

      {/* Fields */}
      <div className="p-6 space-y-5">
        {form.fields && form.fields.length > 0 ? (
          form.fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <FieldPreview key={field.id} field={field} />
            ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Belum ada field yang ditambahkan</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      {form.fields && form.fields.length > 0 && (
        <div className="px-6 pb-6">
          <Button
            className="w-full text-white font-semibold"
            style={{ backgroundColor: primaryColor }}
            disabled={isPreview}
          >
            {isPreview ? 'Kirim (Preview)' : 'Kirim'}
          </Button>
        </div>
      )}
    </div>
  );
}
