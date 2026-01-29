export type SLAType = 'Basic' | 'Comfort' | 'Premium'; // Enkel voor Salto
export type SLAStatus = 'active' | 'warning' | 'critical'; 
export type UserRole = 'admin' | 'technician';
export type SLACategory = 'Salto' | 'Renson'; // <--- NIEUW

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

// NIEUW: Voor de Salto deurenlijst
export interface DoorItem {
  id: string;
  sla_id: string;
  door_name: string;
  status: 'pending' | 'ok' | 'nok';
  remarks: string;
}

export interface SLA {
  id: string;
  // GEMEENSCHAPPELIJK
  category: SLACategory; // Salto of Renson
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
  vo_number?: string;        // Nieuw: ERP nummer
  calculation_done: boolean; // Nieuw: Voor nacalculatie lijst

  // SALTO SPECIFIEK
  type?: SLAType;            // Basic/Comfort/Premium (Niet voor Renson)
  partsNeeded?: string;      // Materiaal (Vooral Salto?)
  hoursRequired?: number;    // Uren

  // RENSON SPECIFIEK
  renson_height?: string;    // Gelijkvloers, +1, ...
  renson_installer?: string; // Naam installateur
  renson_size?: string;      // Afmeting
}

// NIEUW: Profiel voor de begroeting
export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
}