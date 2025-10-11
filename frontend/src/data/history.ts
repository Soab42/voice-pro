export interface CallRecord {
  id: string;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  duration: number; // in seconds
  date: string;
  cost: number; // in USD
  status: 'completed' | 'missed' | 'voicemail';
}

export const callHistory: CallRecord[] = [
  {
    id: '1',
    direction: 'outbound',
    from: '+1234567890',
    to: '+15551234567',
    duration: 125,
    date: '2025-10-10T10:00:00Z',
    cost: 0.05,
    status: 'completed',
  },
  {
    id: '2',
    direction: 'inbound',
    from: '+15558765432',
    to: '+1234567890',
    duration: 240,
    date: '2025-10-10T09:30:00Z',
    cost: 0.00, // Inbound calls might be free
    status: 'completed',
  },
  {
    id: '3',
    direction: 'outbound',
    from: '+1234567890',
    to: '+15552345678',
    duration: 0,
    date: '2025-10-09T15:12:00Z',
    cost: 0.00,
    status: 'missed',
  },
  {
    id: '4',
    direction: 'inbound',
    from: '+15559876543',
    to: '+1234567890',
    duration: 30,
    date: '2025-10-09T11:05:00Z',
    cost: 0.00,
    status: 'voicemail',
  },
];
