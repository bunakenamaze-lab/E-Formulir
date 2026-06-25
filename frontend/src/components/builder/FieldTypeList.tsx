import { Type, AlignLeft, Hash, Mail, Phone, Calendar, Clock,
  ChevronDown, Circle, CheckSquare, List, Upload, Image, PenLine,
  MapPin, Star, Grid3x3, Minus, Heading, FileText } from 'lucide-react';
import type { FieldType } from '@/types';

export interface FieldTypeOption {
  type: FieldType;
  label: string;
  icon: React.ElementType;
  description: string;
  category: string;
}

export const FIELD_TYPES: FieldTypeOption[] = [
  // Basic
  { type: 'TEXT', label: 'Text Pendek', icon: Type, description: 'Input teks satu baris', category: 'Dasar' },
  { type: 'TEXTAREA', label: 'Text Panjang', icon: AlignLeft, description: 'Input teks multi baris', category: 'Dasar' },
  { type: 'NUMBER', label: 'Angka', icon: Hash, description: 'Input angka / numerik', category: 'Dasar' },
  { type: 'EMAIL', label: 'Email', icon: Mail, description: 'Input alamat email', category: 'Dasar' },
  { type: 'PHONE', label: 'Nomor HP', icon: Phone, description: 'Input nomor telepon', category: 'Dasar' },

  // Date & Time
  { type: 'DATE', label: 'Tanggal', icon: Calendar, description: 'Pilih tanggal', category: 'Waktu' },
  { type: 'TIME', label: 'Waktu', icon: Clock, description: 'Pilih waktu', category: 'Waktu' },

  // Choice
  { type: 'DROPDOWN', label: 'Dropdown', icon: ChevronDown, description: 'Pilih dari daftar', category: 'Pilihan' },
  { type: 'RADIO', label: 'Pilihan Tunggal', icon: Circle, description: 'Pilih satu opsi', category: 'Pilihan' },
  { type: 'CHECKBOX', label: 'Centang Banyak', icon: CheckSquare, description: 'Pilih beberapa opsi', category: 'Pilihan' },
  { type: 'MULTIPLE_CHOICE', label: 'Pilihan Ganda', icon: List, description: 'Pilihan ganda bergambar', category: 'Pilihan' },

  // Media
  { type: 'FILE_UPLOAD', label: 'Upload File', icon: Upload, description: 'Upload dokumen', category: 'Media' },
  { type: 'IMAGE_UPLOAD', label: 'Upload Gambar', icon: Image, description: 'Upload foto/gambar', category: 'Media' },
  { type: 'SIGNATURE', label: 'Tanda Tangan', icon: PenLine, description: 'Tanda tangan digital', category: 'Media' },

  // Advanced
  { type: 'LOCATION', label: 'Lokasi GPS', icon: MapPin, description: 'Pilih lokasi di peta', category: 'Lanjutan' },
  { type: 'RATING', label: 'Rating/Bintang', icon: Star, description: 'Penilaian bintang', category: 'Lanjutan' },
  { type: 'MATRIX', label: 'Tabel Matrix', icon: Grid3x3, description: 'Pertanyaan matrix', category: 'Lanjutan' },

  // Layout
  { type: 'SECTION_DIVIDER', label: 'Pemisah Seksi', icon: Minus, description: 'Garis pemisah', category: 'Layout' },
  { type: 'HEADING', label: 'Judul Seksi', icon: Heading, description: 'Teks judul besar', category: 'Layout' },
  { type: 'DESCRIPTION', label: 'Deskripsi', icon: FileText, description: 'Teks deskripsi/paragraf', category: 'Layout' },
];

export const FIELD_CATEGORIES = ['Dasar', 'Waktu', 'Pilihan', 'Media', 'Lanjutan', 'Layout'];

interface FieldTypeListProps {
  onAdd: (type: FieldType) => void;
}

export default function FieldTypeList({ onAdd }: FieldTypeListProps) {
  return (
    <div className="space-y-4">
      {FIELD_CATEGORIES.map((category) => (
        <div key={category}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            {category}
          </p>
          <div className="space-y-1">
            {FIELD_TYPES.filter((f) => f.category === category).map((fieldType) => (
              <button
                key={fieldType.type}
                onClick={() => onAdd(fieldType.type)}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-nu-700/10 hover:text-nu-700 transition-colors group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted group-hover:bg-nu-700/15 transition-colors shrink-0">
                  <fieldType.icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{fieldType.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{fieldType.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
