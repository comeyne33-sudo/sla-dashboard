import type { SLA } from '../types/sla'; 

export const mockSLAs: SLA[] = [
  {
    id: '1',
    clientName: 'Port of Antwerp',
    location: 'Antwerpen Haven',
    city: 'Antwerpen',
    type: 'Premium',
    status: 'active',
    hoursRequired: 4,
    partsNeeded: '12x 12V 7Ah Batterij',
    price: 1250,
    contactName: 'Jan De Smet',
    contactPhone: '+32 478 12 34 56',
    contactEmail: 'jan@portofantwerp.be',
    plannedQuarter: 'Q1',
    lat: 51.2194,
    lng: 4.4025,
    lastUpdate: '2 min geleden'
  },
  {
    id: '2',
    clientName: 'UZ Gent',
    location: 'Campus Heymans',
    city: 'Gent',
    type: 'Comfort',
    status: 'warning',
    hoursRequired: 2.5,
    partsNeeded: 'Onderhouds kit A',
    price: 450,
    contactName: 'Sarah Peeters',
    contactPhone: '+32 9 123 45 67',
    contactEmail: 'tech@uzgent.be',
    plannedQuarter: 'Q2',
    lat: 51.0543,
    lng: 3.7174,
    lastUpdate: '5 min geleden'
  },
  {
    id: '3',
    clientName: 'Brussels Airport',
    location: 'Terminal B',
    city: 'Zaventem',
    type: 'Premium',
    status: 'critical',
    hoursRequired: 8,
    partsNeeded: '24x 12V 12Ah Batterij',
    price: 2800,
    contactName: 'Mark Dubios',
    contactPhone: '+32 2 753 11 11',
    contactEmail: 'maintenance@brusselsairport.be',
    plannedQuarter: 'Q1',
    lat: 50.9000,
    lng: 4.4833,
    lastUpdate: 'Zojuist'
  }
];