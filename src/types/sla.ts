export type SLAType = 'Basic' | 'Comfort' | 'Premium';
export type SLAStatus = 'active' | 'warning' | 'critical'; 
export type UserRole = 'admin' | 'technician'; // <--- NIEUW

export interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'file';
}

export interface AuditLog { // <--- NIEUW
  id: string;
  user_email: string;
  action: string;
  details: string;
  created_at: string;
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