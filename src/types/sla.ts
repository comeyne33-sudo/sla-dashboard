export type SLAType = 'Basic' | 'Comfort' | 'Premium';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface SLA {
  id: string;
  clientName: string;
  location: string;
  city: string;
  type: SLAType;
  hoursRequired: number;
  partsNeeded: string; // Bijv. "4x 12V 7Ah batterij"
  price: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  plannedQuarter: Quarter;
  lat: number; // Voor de kaart
  lng: number; // Voor de kaart
}