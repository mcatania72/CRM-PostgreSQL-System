// API Response Types
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Entity Types
export interface User {
  id: number;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: Record<string, any>;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALESPERSON = 'salesperson',
  USER = 'user'
}

export interface Customer {
  id: number;
  name: string;
  company?: string;
  industry?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  status: CustomerStatus;
  notes?: string;
  estimatedValue?: number;
  website?: string;
  employeeCount?: number;
  customFields?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  opportunities?: Opportunity[];
  interactions?: Interaction[];
  activities?: Activity[];
}

export enum CustomerStatus {
  PROSPECT = 'prospect',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOST = 'lost'
}

export interface Opportunity {
  id: number;
  title: string;
  description?: string;
  value?: number;
  stage: OpportunityStage;
  probability?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  source?: string;
  competitorAnalysis?: string;
  lossReason?: string;
  customFields?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  customerId: number;
  customer?: Customer;
  activities?: Activity[];
}

export enum OpportunityStage {
  LEAD = 'lead',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed-won',
  CLOSED_LOST = 'closed-lost'
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  type: ActivityType;
  status: ActivityStatus;
  priority: ActivityPriority;
  dueDate?: string;
  completedAt?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  result?: string;
  notes?: string;
  customFields?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  customerId: number;
  customer?: Customer;
  opportunityId?: number;
  opportunity?: Opportunity;
  assignedToId?: number;
  assignedTo?: User;
}

export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  TASK = 'task',
  NOTE = 'note',
  FOLLOW_UP = 'follow-up'
}

export enum ActivityStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}

export enum ActivityPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Interaction {
  id: number;
  type: InteractionType;
  direction: InteractionDirection;
  subject?: string;
  description: string;
  notes?: string;
  date: string;
  duration?: number;
  channel?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  isImportant: boolean;
  needsFollowUp: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
  customerId: number;
  customer?: Customer;
  userId?: number;
  user?: User;
}

export enum InteractionType {
  PHONE = 'phone',
  EMAIL = 'email',
  MEETING = 'meeting',
  CHAT = 'chat',
  SOCIAL = 'social',
  WEBSITE = 'website',
  OTHER = 'other'
}

export enum InteractionDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound'
}

// Dashboard Types
export interface DashboardStats {
  customers: {
    total: number;
    recent?: number;
  };
  opportunities: {
    total: number;
    totalValue: number;
    wonValue: number;
    recent?: number;
  };
  activities: {
    total: number;
  };
  interactions: {
    total: number;
  };
}

export interface DashboardMetrics {
  conversionRate: number;
  opportunityCounts: {
    total: number;
    won: number;
    lost?: number;
    active?: number;
  };
}

export interface PipelineData {
  stage: OpportunityStage;
  count: number;
  totalValue: number;
  avgProbability?: number;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  firstName?: string;
  lastName?: string;
}

export interface CustomerForm {
  name: string;
  company?: string;
  industry?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  status: CustomerStatus;
  notes?: string;
  estimatedValue?: number;
  website?: string;
  employeeCount?: number;
  tags?: string[];
}

export interface OpportunityForm {
  title: string;
  description?: string;
  value?: number;
  stage: OpportunityStage;
  probability?: number;
  expectedCloseDate?: string;
  customerId: number;
  source?: string;
  tags?: string[];
}

export interface ActivityForm {
  title: string;
  description?: string;
  type: ActivityType;
  status: ActivityStatus;
  priority: ActivityPriority;
  dueDate?: string;
  estimatedDuration?: number;
  customerId: number;
  opportunityId?: number;
  assignedToId?: number;
  notes?: string;
  tags?: string[];
}

export interface InteractionForm {
  type: InteractionType;
  direction: InteractionDirection;
  subject?: string;
  description: string;
  notes?: string;
  date: string;
  duration?: number;
  channel?: string;
  customerId: number;
  isImportant?: boolean;
  needsFollowUp?: boolean;
  followUpDate?: string;
  tags?: string[];
}

// Filter Types
export interface CustomerFilter {
  search?: string;
  status?: CustomerStatus;
  industry?: string;
  page?: number;
  limit?: number;
}

export interface OpportunityFilter {
  search?: string;
  stage?: OpportunityStage;
  customerId?: number;
  page?: number;
  limit?: number;
}

export interface ActivityFilter {
  search?: string;
  status?: ActivityStatus;
  type?: ActivityType;
  priority?: ActivityPriority;
  assignedToId?: number;
  customerId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface InteractionFilter {
  search?: string;
  type?: InteractionType;
  direction?: InteractionDirection;
  customerId?: number;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// UI Types
export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  current?: boolean;
  children?: NavigationItem[];
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Auth Types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterForm) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Query Types
export interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
}