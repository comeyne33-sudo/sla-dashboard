export type SLAType = 'Basic' | 'Comfort' | 'Premium';
export type SLAStatus = 'active' | 'warning' | 'critical'; 

export interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'file';
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
  attachments: Attachment[]; // <--- NIEUW: Lijst met bijlagen
  price: number;
  lat: number;
  lng: number;
  lastUpdate: string;
  isExecuted: boolean; 
}