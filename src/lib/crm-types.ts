// Extended CRM Types for comprehensive lead and project tracking

export type LeadStatus = 'neu' | 'qualifiziert' | 'angebot_erstellt' | 'in_verhandlung' | 'gewonnen' | 'verloren';
export type ProductInterest = 'pv' | 'speicher' | 'waermepumpe' | 'fenster' | 'tueren' | 'daemmung' | 'rollaeden';
export type UserRole = 'admin' | 'kunde' | 'monteur' | 'vertrieb';
export type ContactType = 'email' | 'telefon' | 'chat' | 'website_formular' | 'termin';
export type DocumentType = 'angebot' | 'vertrag' | 'rechnung' | 'foto' | 'technische_zeichnung' | 'foerderantrag';
export type NotificationType = 'neuer_lead' | 'status_change' | 'follow_up' | 'termin_erinnerung' | 'dokument_upload';
export type AutomationTrigger = 'lead_created' | 'status_changed' | 'no_response' | 'date_reached' | 'document_uploaded';

export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  last_login?: string;
  avatar_url?: string;
}

export interface Customer {
  id: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  notes?: string;
  lead_status: LeadStatus;
  lead_source?: string;
  assigned_to?: string;
  estimated_value?: number;
  probability?: number;
  expected_close_date?: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
  product_interests: ProductInterest[];
  priority: number;
  tags: string[];
  gdpr_consent: boolean;
  marketing_consent: boolean;
}

export interface ContactHistory {
  id: string;
  created_at: string;
  customer_id: string;
  user_id?: string;
  contact_type: ContactType;
  subject?: string;
  content?: string;
  direction: 'inbound' | 'outbound';
  duration_minutes?: number;
  outcome?: string;
  next_action?: string;
  next_action_date?: string;
  attachments: string[];
  metadata: Record<string, unknown>;
}

export interface Document {
  id: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  uploaded_by?: string;
  document_type: DocumentType;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  version: number;
  is_active: boolean;
  tags: string[];
}

export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  assigned_installer?: string;
  project_manager?: string;
  title: string;
  description?: string;
  status: 'planung' | 'angebot_erstellt' | 'beauftragt' | 'in_arbeit' | 'abgeschlossen' | 'storniert';
  product_type: ProductInterest;
  start_date?: string;
  planned_end_date?: string;
  actual_end_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  margin_percent?: number;
  address?: string;
  coordinates?: { x: number; y: number };
  technical_specs: Record<string, unknown>;
  materials_list: Record<string, unknown>;
  labor_hours?: number;
  notes?: string;
}

export interface Quote {
  id: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  project_id: string;
  created_by?: string;
  quote_number: string;
  title: string;
  description?: string;
  status: 'entwurf' | 'versendet' | 'angenommen' | 'abgelehnt' | 'abgelaufen';
  valid_until?: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  line_items: QuoteLineItem[];
  terms_conditions?: string;
  notes?: string;
}

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_code?: string;
  category?: string;
}

export interface Subsidy {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  provider?: string;
  product_types: ProductInterest[];
  amount_type: 'fixed' | 'percentage' | 'per_unit';
  amount?: number;
  max_amount?: number;
  valid_from?: string;
  valid_until?: string;
  conditions?: string;
  application_url?: string;
  is_active: boolean;
  postal_codes: string[];
  income_limits: Record<string, unknown>;
}

export interface CustomerSubsidy {
  id: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  project_id: string;
  subsidy_id: string;
  status: 'geplant' | 'beantragt' | 'bewilligt' | 'abgelehnt' | 'ausgezahlt';
  applied_date?: string;
  approved_date?: string;
  amount_applied?: number;
  amount_approved?: number;
  reference_number?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  created_at: string;
  user_id: string;
  customer_id: string;
  notification_type: NotificationType;
  title: string;
  message?: string;
  is_read: boolean;
  action_url?: string;
  metadata: Record<string, unknown>;
}

export interface AutomationRule {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  is_active: boolean;
  trigger_type: AutomationTrigger;
  trigger_conditions: Record<string, unknown>;
  actions: AutomationAction[];
  delay_hours: number;
  created_by?: string;
}

export interface AutomationAction {
  type: 'email' | 'notification' | 'status_change' | 'task_create' | 'webhook';
  template?: string;
  message?: string;
  recipient?: string;
  data?: Record<string, unknown>;
}

export interface MarketingCampaign {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  campaign_type: 'email' | 'sms' | 'newsletter' | 'social_media';
  status: 'entwurf' | 'geplant' | 'aktiv' | 'pausiert' | 'beendet';
  target_audience: Record<string, unknown>;
  content?: string;
  scheduled_date?: string;
  sent_date?: string;
  created_by?: string;
  metrics: CampaignMetrics;
}

export interface CampaignMetrics {
  sent_count?: number;
  delivered_count?: number;
  opened_count?: number;
  clicked_count?: number;
  bounced_count?: number;
  unsubscribed_count?: number;
  open_rate?: number;
  click_rate?: number;
  conversion_rate?: number;
}

export interface CampaignRecipient {
  id: string;
  created_at: string;
  campaign_id: string;
  customer_id: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
}

export interface KPIMetric {
  id: string;
  created_at: string;
  metric_name: string;
  metric_value: number;
  metric_date: string;
  period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  metadata: Record<string, unknown>;
}

// Dashboard and Analytics Types
export interface DashboardStats {
  totalCustomers: number;
  totalLeads: number;
  activeProjects: number;
  monthlyRevenue: number;
  conversionRate: number;
  averageDealSize: number;
  leadsThisMonth: number;
  projectsCompleted: number;
}

export interface LeadPipelineStats {
  neu: number;
  qualifiziert: number;
  angebot_erstellt: number;
  in_verhandlung: number;
  gewonnen: number;
  verloren: number;
}

export interface ProductInterestStats {
  pv: number;
  speicher: number;
  waermepumpe: number;
  fenster: number;
  tueren: number;
  daemmung: number;
  rollaeden: number;
}

export interface RevenueByProduct {
  product: ProductInterest;
  revenue: number;
  count: number;
  averageValue: number;
}

export interface MonthlyMetrics {
  month: string;
  newLeads: number;
  convertedLeads: number;
  revenue: number;
  projects: number;
}

// Filter and Search Types
export interface CustomerFilter {
  lead_status?: LeadStatus[];
  product_interests?: ProductInterest[];
  assigned_to?: string[];
  priority?: number[];
  tags?: string[];
  city?: string[];
  lead_source?: string[];
  date_range?: {
    start: string;
    end: string;
    field: 'created_at' | 'last_contact_date' | 'next_follow_up_date';
  };
  search?: string;
}

export interface ProjectFilter {
  status?: string[];
  product_type?: ProductInterest[];
  assigned_installer?: string[];
  project_manager?: string[];
  date_range?: {
    start: string;
    end: string;
    field: 'created_at' | 'start_date' | 'planned_end_date';
  };
  search?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form Types
export interface CustomerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
  lead_status: LeadStatus;
  lead_source?: string;
  assigned_to?: string;
  estimated_value?: number;
  probability?: number;
  expected_close_date?: string;
  next_follow_up_date?: string;
  product_interests: ProductInterest[];
  priority: number;
  tags: string[];
  gdpr_consent: boolean;
  marketing_consent: boolean;
}

export interface ProjectFormData {
  customer_id: string;
  assigned_installer?: string;
  project_manager?: string;
  title: string;
  description?: string;
  product_type: ProductInterest;
  start_date?: string;
  planned_end_date?: string;
  estimated_cost?: number;
  address?: string;
  technical_specs: Record<string, unknown>;
  materials_list: Record<string, unknown>;
  labor_hours?: number;
  notes?: string;
}

export interface ContactFormData {
  customer_id: string;
  contact_type: ContactType;
  subject?: string;
  content?: string;
  direction: 'inbound' | 'outbound';
  duration_minutes?: number;
  outcome?: string;
  next_action?: string;
  next_action_date?: string;
}

// Utility Types
export type CustomerWithUser = Customer & {
  user?: User;
  assigned_user?: User;
};

export type ProjectWithCustomer = Project & {
  customer: Customer;
  assigned_installer_user?: User;
  project_manager_user?: User;
};

export type ContactHistoryWithUser = ContactHistory & {
  user?: User;
  customer: Customer;
};

export type DocumentWithUser = Document & {
  uploaded_by_user?: User;
  customer: Customer;
};

export type QuoteWithDetails = Quote & {
  customer: Customer;
  project: Project;
  created_by_user?: User;
};

// Chat and Communication Types
export interface ChatMessage {
  id: string;
  created_at: string;
  customer_id: string;
  user_id?: string;
  message: string;
  is_from_customer: boolean;
  is_read: boolean;
  attachments?: string[];
  message_type: 'text' | 'image' | 'file' | 'system';
}

export interface ChatSession {
  id: string;
  customer_id: string;
  started_at: string;
  ended_at?: string;
  status: 'active' | 'closed' | 'transferred';
  assigned_to?: string;
  messages: ChatMessage[];
  customer: Customer;
  assigned_user?: User;
}

// Integration Types
export interface GoogleSheetsConfig {
  spreadsheet_id: string;
  sheet_name: string;
  range: string;
  sync_enabled: boolean;
  last_sync: string;
  mapping: Record<string, string>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  template_type: 'follow_up' | 'welcome' | 'quote' | 'reminder' | 'newsletter';
  variables: string[];
  is_active: boolean;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret?: string;
  headers?: Record<string, string>;
}
