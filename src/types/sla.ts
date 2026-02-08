// Aangepaste categorieën
export type SLACategory = 'Toegangscontrole' | 'Draaideurautomatisatie' | 'Poortautomatisatie' | 'Zonneweringen';

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

export interface DoorItem {
  id: string;
  sla_id: string;
  door_name: string;
  
  // Nieuwe velden uit CSV
  zone?: string;
  connection_status?: string;
  
  // Nieuwe checkboxes
  check_battery?: boolean;
  check_rights?: boolean;
  check_firmware?: boolean;
  
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
  category: SLACategory;
  clientName: string;
  location: string;
  city: string;
  status: SLAStatus;
  
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  
  comments: string; // Interne opmerkingen / Info vooraf
  execution_report?: string; // Het verslag van de technieker (voor niet-toegangscontrole)
  
  attachments: Attachment[];
  price: number;
  lat: number;
  lng: number;
  lastUpdate: string;
  isExecuted: boolean;
  plannedMonth: number;
  vo_number?: string;
  calculation_done: boolean;

  // Nacalculatie
  actual_hours?: number;
  calculation_result?: 'profit' | 'correct' | 'loss';
  calculation_note?: string;

  // Werkbon
  signer_name?: string;
  signature_url?: string;

  // Oude velden (mogen blijven voor backward compatibility of specifiek gebruik)
  type?: SLAType;
  partsNeeded?: string;
  hoursRequired?: number;
  renson_height?: string;
  renson_installer?: string;
  renson_size?: string;
}