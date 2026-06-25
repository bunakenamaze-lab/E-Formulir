export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR';
export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type FieldType =
  | 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'EMAIL' | 'PHONE'
  | 'DATE' | 'TIME' | 'DROPDOWN' | 'RADIO' | 'CHECKBOX'
  | 'MULTIPLE_CHOICE' | 'FILE_UPLOAD' | 'IMAGE_UPLOAD' | 'SIGNATURE'
  | 'LOCATION' | 'RATING' | 'MATRIX' | 'SECTION_DIVIDER'
  | 'HEADING' | 'DESCRIPTION';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface FieldConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
  defaultValue?: any;
  rows?: number;
  accept?: string;
  maxSize?: number;
  size?: string;
  columns?: string[];
  rows_matrix?: string[];
  placeholder?: string;
  helpText?: string;
}

export interface ConditionalLogic {
  showIf?: {
    fieldId: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
    value: any;
  };
}

export interface Field {
  id: string;
  formId: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  config: FieldConfig;
  conditional?: ConditionalLogic;
  order: number;
  section?: string;
  createdAt?: string;
}

export interface FormSettings {
  allowMultiple: boolean;
  showProgress: boolean;
  requireAuth: boolean;
  autoSave: boolean;
  multiStep: boolean;
  submitMessage?: string;
  redirectUrl?: string;
  notifyEmail?: string;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  logoUrl?: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  slug: string;
  status: FormStatus;
  settings: FormSettings;
  theme: FormTheme;
  viewCount: number;
  isTemplate: boolean;
  category?: string;
  tags?: string;
  createdById: string;
  createdBy?: Pick<User, 'id' | 'name' | 'email'>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  closedAt?: string;
  fields?: Field[];
  _count?: {
    responses: number;
    fields: number;
  };
}

export interface Answer {
  id: string;
  responseId: string;
  fieldId: string;
  field?: Field;
  value: any;
}

export interface FormResponse {
  id: string;
  formId: string;
  form?: Pick<Form, 'id' | 'title'>;
  respondentEmail?: string;
  respondentName?: string;
  userId?: string;
  isCompleted: boolean;
  isDraft: boolean;
  ipAddress?: string;
  userAgent?: string;
  startedAt: string;
  completedAt?: string;
  timeSpent?: number;
  createdAt: string;
  updatedAt: string;
  answers?: Answer[];
}

export interface AuditLog {
  id: string;
  userId: string;
  user?: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  readAt?: string;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DashboardStats {
  stats: {
    totalForms: number;
    activeForms: number;
    draftForms: number;
    closedForms: number;
    totalResponses: number;
    todayResponses: number;
  };
  recentForms: Form[];
  recentResponses: FormResponse[];
  responsesByDay: { date: string; label: string; count: number }[];
  topForms: (Form & { _count: { responses: number } })[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}
