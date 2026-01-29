export type SLAType = 'Basic' | 'Comfort' | 'Premium';
export type SLAStatus = 'active' | 'warning' | 'critical'; 
export type UserRole = 'admin' | 'technician';
export type SLACategory = 'Salto' | 'Renson';

export interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'file';
}

export interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  details: string;
  created_at: string;
}

export interface DoorItem {
  id: string;
  sla_id: string;
  door_name: string;
  status: 'pending' | 'ok' | 'nok';
  remarks: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
}

export interface SLA {
  id: string;
  // GEMEENSCHAPPELIJK
  category: SLACategory;
  clientName: string;
  location: string;
  city: string;
  status: SLAStatus;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  comments: string;
  attachments: Attachment[];
  price: number;
  lat: number;
  lng: number;
  lastUpdate: string;
  isExecuted: boolean;
  plannedMonth: number;
  vo_number?: string;
  calculation_done: boolean;

  // NACALCULATIE (NIEUW)
  actual_hours?: number;
  calculation_result?: 'profit' | 'correct' | 'loss';
  calculation_note?: string;

  // WERKBON / HANDTEKENING (NIEUW)
  signer_name?: string;
  signature_url?: string;

  // SALTO SPECIFIEK
  type?: SLAType;
  partsNeeded?: string;
  hoursRequired?: number;

  // RENSON SPECIFIEK
  renson_height?: string;
  renson_installer?: string;
  renson_size?: string;
}