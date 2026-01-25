export type SLAStatus = 'active' | 'warning' | 'critical';
export type SLAType = 'Basic' | 'Comfort' | 'Premium';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface SLA {
  id: string;
  clientName: string;
  location: string;
  city: string;
  type: SLAType;
  status: SLAStatus;
  hoursRequired: number;
  partsNeeded: string;
  price: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  plannedQuarter: Quarter;
  lat: number;
  lng: number;
  lastUpdate?: string; 
}