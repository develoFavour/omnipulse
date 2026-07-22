// lib/types/index.ts

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tenant {
  id: string;
  company_name: string;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TenantChannel {
  id: string;
  tenant_id: string;
  platform_name: 'whatsapp' | 'telegram' | 'instagram' | 'x';
  sender_identity: string;
  status: 'active' | 'pending' | 'suspended';
  created_at?: string;
  updated_at?: string;
}

export interface Contact {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  channel: 'whatsapp' | 'telegram' | 'instagram' | 'x';
  routing_value: string;
  source: 'manual' | 'csv_import' | 'inbound_webhook';
  status: 'active' | 'opted_out';
  created_at?: string;
  updated_at?: string;
}

export interface Campaign {
  id: string;
  tenant_id: string;
  title: string;
  message_body: string;
  external_template_code?: string;
  media_url?: string;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed';
  delivery_type: 'direct_message' | 'public_post';
  selected_channels: string[];
  total_targets: number;
  processed_targets: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiError {
  error: string;
  details?: any;
}
