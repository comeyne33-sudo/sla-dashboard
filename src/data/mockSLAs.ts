import { SLA } from '../types/sla';

export const mockSLAs: SLA[] = [
  {
    id: '1',
    clientName: 'Port of Antwerp',
    status: 'active',
    uptime: 99.99,
    region: 'Vlaanderen',
    city: 'Antwerpen',
    lastUpdate: 'Zojuist'
  },
  {
    id: '2',
    clientName: 'Brusselse Metro',
    status: 'warning',
    uptime: 98.5,
    region: 'Brussel',
    city: 'Brussel',
    lastUpdate: '5 min geleden'
  }
];