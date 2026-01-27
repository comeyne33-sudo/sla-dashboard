export type SLAType = 'Basic' | 'Comfort' | 'Premium';
export type SLAStatus = 'active' | 'warning' | 'critical'; 
export type UserRole = 'admin' | 'technician';

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

// NIEUW: Type voor nacalculatie
export interface PostCalculation {
  id: string;
  sla_id: string;
  planned_hours: number;
  actual_hours: number;
  status: 'profit' | 'warning' | 'loss';
  created_at: string;
  // We breiden dit type uit met SLA data voor de weergave (join)
  slas?: {
    clientName: string;
    city: string;
  };
}

export interface SLA {
  id: string;
  clientName: string;
  location: string;
  city: string;
  type: SLAType;
  status: SLAStatus;
  partsNeeded: string;
  hoursRequired: number;
  plannedMonth: number; 
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
}