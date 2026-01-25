export type SLAStatus = 'active' | 'warning' | 'critical';

export interface SLA {
  id: string;
  clientName: string;
  status: SLAStatus;
  uptime: number;
  region: string;
  city: string;
  lastUpdate: string;
}