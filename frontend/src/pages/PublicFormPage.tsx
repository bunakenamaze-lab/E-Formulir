import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Upload, Loader2, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';
import { usePublicForm, useSubmitResponse } from '@/hooks/useForms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Field } from '@/types';

interface AnswerMap {
  [fieldId: string]: any;
}

// Evaluate conditional logic
const shouldShowField = (field: Field, answers: AnswerMap): boolean => {
  if (!field.conditional?.showIf) return true;
  const { fieldId, operator, value } = field.conditional.showIf;
  const answerValue = answers[fieldId];

  if (answerValue === undefined || answerValue === null) return false;

  switch (operator) {
    case 'equals': return String(answerValue) === String(value);
    case 'not_equals': return String(answerValue) !== String(value);
    case 'contains': return String(answerValue).includes(String(value));
    case 'not_contains': return !String(answerValue).includes(String(value));
    default: return true;
  }
};

const FormField = ({
  field, value, onChange,
}: {
  field: Field; value: any; onChange: (val: any) => void;
}) => {
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
      return <Separator />;
    case 'HEADING':
      const sizes: Record<string, string> = { h1: 'text-2xl', h2: 'text-xl', h3: 'text-lg' };
      return <h3 className={cn('font-bold', sizes[field.config.size || 'h2'])}>{field.label}</h3>;
    case 'DESCRIPTION':
      return <p className="text-sm text-muted-foreground">{field.helpText || field.label}</p>;

    case 'TEXT':
    case 'EMAIL':
    case 'PHONE':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Input
            type={field.type === 'EMAIL' ? 'email' : 'text'}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm"
          />
          {helpEl}
        </div>
      );

    case 'NUMBER':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Input
            type="number"
            placeholder={field.placeholder}
            value={value || ''}
            min={field.config.min}
            max={field.config.max}
            onChange={(e) => onChange(e.target.value)}
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
            placeholder={field.placeholder}
            value={value || ''}
            rows={field.config.rows || 4}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm"
          />
          {helpEl}
        </div>
      );

    case 'DATE':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} className="text-sm" />
          {helpEl}
        </div>
      );

    case 'TIME':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <Input type="time" value={value || ''} onChange={(e) => onChange(e.target.value)} className="text-sm" />
          {helpEl}
        </div>
      );

    case 'DROPDOWN':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-nu-700 focus:outline-none"
          >
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
              <label
                key={opt}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all',
                  value === opt
                    ? 'border-nu-700 bg-nu-700/5'
                    : 'hover:border-nu-700/30 hover:bg-muted/30'
                )}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  className="accent-nu-700"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
          {helpEl}
        </div>
      );

    case 'CHECKBOX':
      const checkedValues: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {labelEl}
          <div className="space-y-2">
            {field.config.options?.map((opt) => (
              <label
                key={opt}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all',
                  checkedValues.includes(opt)
                    ? 'border-nu-700 bg-nu-700/5'
                    : 'hover:border-nu-700/30 hover:bg-muted/30'
                )}
              >
                <input
                  type="checkbox"
                  value={opt}
                  checked={checkedValues.includes(opt)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...checkedValues, opt]);
                    } else {
                      onChange(checkedValues.filter((v) => v !== opt));
                    }
                  }}
                  className="accent-nu-700"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
          {helpEl}
        </div>
      );

    case 'RATING':
      const maxRating = field.config.max || 5;
      const currentRating = value || 0;
      return (
        <div className="space-y-2">
          {labelEl}
          <div className="flex gap-1">
            {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
              <button key={star} type="button" onClick={() => onChange(star)}>
                <Star
                  className={cn(
                    'h-8 w-8 transition-all hover:scale-110',
                    star <= currentRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                  )}
                />
              </button>
            ))}
          </div>
          {currentRating > 0 && (
            <p className="text-xs text-muted-foreground">{currentRating} dari {maxRating} bintang</p>
          )}
          {helpEl}
        </div>
      );

    case 'FILE_UPLOAD':
    case 'IMAGE_UPLOAD':
      return (
        <div className="space-y-1.5">
          {labelEl}
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
            <Upload className="h-5 w-5 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Klik untuk upload</p>
            <p className="text-[10px] text-muted-foreground">
              Maks. {Math.round((field.config.maxSize || 5242880) / 1048576)} MB
            </p>
            <input type="file" className="hidden" accept={field.config.accept} />
          </label>
          {helpEl}
        </div>
      );

    default:
      return null;
  }
};

export default function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: form, isLoading, error } = usePublicForm(slug!);
  const submitResponse = useSubmitResponse(slug!);

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(Date.now());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const settings = form?.settings as any;
  const isMultiStep = settings?.multiStep;
  const showProgress = settings?.showProgress;

  const visibleFields = form?.fields?.filter((f) =>
    shouldShowField(f, answers)
  ) || [];

  // Split into steps for multi-step forms
  const steps = isMultiStep
    ? visibleFields.reduce<Field[][]>((acc, field) => {
        if (field.type === 'SECTION_DIVIDER' && acc.length > 0) {
          acc.push([]);
        } else {
          if (acc.length === 0) acc.push([]);
          acc[acc.length - 1].push(field);
        }
        return acc;
      }, [])
    : [visibleFields];

  const currentFields = steps[currentStep] || [];
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswer = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => { const e = { ...prev }; delete e[fieldId]; return e; });
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    const fieldsToValidate = isMultiStep ? currentFields : visibleFields;

    for (const field of fieldsToValidate) {
      if (field.config.required) {
        const val = answers[field.id];
        if (!val && val !== 0) {
          newErrors[field.id] = `${field.label} wajib diisi`;
        }
        if (Array.isArray(val) && val.length === 0) {
          newErrors[field.id] = `${field.label} wajib dipilih minimal satu`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const answersPayload = visibleFields
      .filter((f) => !['SECTION_DIVIDER', 'HEADING', 'DESCRIPTION'].includes(f.type))
      .map((f) => ({ fieldId: f.id, value: answers[f.id] ?? null }));

    try {
      await submitResponse.mutateAsync({
        answers: answersPayload,
        timeSpent,
      });
      navigate(`/f/${slug}/success`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mengirim formulir');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-nu-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat formulir...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Formulir Tidak Ditemukan</h2>
          <p className="text-gray-500">Formulir yang Anda cari tidak tersedia atau sudah ditutup.</p>
        </div>
      </div>
    );
  }

  const primaryColor = form.theme?.primaryColor || '#0F7A3D';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: primaryColor }} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Branding */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-white font-bold text-lg mb-2"
            style={{ backgroundColor: primaryColor }}
          >
            NU
          </div>
          <p className="text-xs text-gray-500">PCNU Kota Bandung</p>
        </div>

        {/* Progress bar */}
        {(showProgress || isMultiStep) && totalSteps > 1 && (
          <div className="mb-6 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Langkah {currentStep + 1} dari {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border shadow-sm overflow-hidden"
          >
            {/* Form header */}
            <div className="px-6 py-5" style={{ borderBottom: `3px solid ${primaryColor}` }}>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{form.title}</h1>
              {form.description && (
                <p className="text-sm text-gray-500 mt-1">{form.description}</p>
              )}
            </div>

            {/* Form fields */}
            <div className="px-6 py-6 space-y-5">
              {currentFields.map((field) => (
                <div key={field.id}>
                  <FormField
                    field={field}
                    value={answers[field.id]}
                    onChange={(val) => handleAnswer(field.id, val)}
                  />
                  {errors[field.id] && (
                    <p className="mt-1 text-xs text-red-500">{errors[field.id]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="px-6 pb-6 flex justify-between gap-3">
              {isMultiStep && currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => { setCurrentStep((p) => p - 1); window.scrollTo(0, 0); }}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Sebelumnya
                </Button>
              )}

              {isMultiStep && currentStep < totalSteps - 1 ? (
                <Button
                  onClick={handleNext}
                  className="flex-1 text-white font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  Selanjutnya
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitResponse.isPending}
                  className="flex-1 text-white font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {submitResponse.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengirim...</>
                  ) : (
                    'Kirim Formulir'
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by Sistem Formulir Digital PCNU Kota Bandung
        </p>
      </div>
    </div>
  );
}
