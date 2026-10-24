import { ImpactBreakdown } from './utils/scoring';

export type TicketCategory =
  | 'electrical'
  | 'plumbing'
  | 'tech'
  | 'wifi'
  | 'furniture'
  | 'hvac'
  | 'safety'
  | 'other';

export type TicketStatus =
  | 'reported'
  | 'in_progress'
  | 'resolved'
  | 'verified_closed';

export interface VerificationRecord {
  userId: string;
  userName?: string;
  confirmed: boolean; // true = fixed, false = still exists
  note?: string;
  at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  building: string;
  room: string;
  category: TicketCategory;
  status: TicketStatus;
  safetySeverity: number; // 1 to 5
  affectedCount: number;
  affectedUserIds: string[];
  impactScore: number;
  impactBreakdown: ImpactBreakdown;
  authorId: string;
  authorName: string;
  authorEmail: string;
  isAnonymous: boolean;
  assignedTechnician?: string;
  resolutionNotes?: string;
  resolvedBy?: string;
  verifiedCount: number;
  unresolvedCount: number;
  verifications?: VerificationRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface BuildingHotspot {
  building: string;
  totalTickets: number;
  openTickets: number;
  criticalCount: number;
  affectedSum: number;
  topCategory: string;
}

export const CAMPUS_BUILDINGS = [
  'Block A (Engineering & Labs)',
  'Block B (Science & Humanities)',
  'Block C (Computer Science & IT)',
  'Central Library',
  'Student Center & Cafeteria',
  'Hostel Block 1',
  'Hostel Block 2',
  'Sports Complex & Gym',
] as const;

export const CATEGORY_LABELS: Record<TicketCategory, { label: string; icon: string; color: string }> = {
  electrical: { label: 'Electrical & Lighting', icon: 'zap', color: 'amber' },
  plumbing: { label: 'Plumbing & Water', icon: 'droplet', color: 'blue' },
  tech: { label: 'AV & Classroom Tech', icon: 'projector', color: 'purple' },
  wifi: { label: 'Wi-Fi & Network', icon: 'wifi', color: 'indigo' },
  furniture: { label: 'Furniture & Fixtures', icon: 'armchair', color: 'stone' },
  hvac: { label: 'HVAC & Cooling', icon: 'fan', color: 'cyan' },
  safety: { label: 'Safety Hazard', icon: 'shield-alert', color: 'rose' },
  other: { label: 'General Maintenance', icon: 'wrench', color: 'slate' },
};

export const INITIAL_SEED_TICKETS: Ticket[] = [
  {
    id: 'TK-101',
    title: 'Ceiling fan not working in back row',
    description: 'The ceiling fan in the rear section of room C-204 does not spin when switched on. Makes a slight humming noise then stops.',
    building: 'Block B (Science & Humanities)',
    room: 'C-204',
    category: 'electrical',
    status: 'reported',
    safetySeverity: 2,
    affectedCount: 4,
    affectedUserIds: ['user-seed-1', 'user-seed-2', 'user-seed-3'],
    impactScore: 58,
    impactBreakdown: {
      safetyScore: 14,
      affectedScore: 18,
      recurrenceScore: 20,
      timeScore: 6,
      totalScore: 58,
      priorityLevel: 'High',
      reasons: ['Recurring problem area (3 prior tickets, +20 pts)', '4 students affected (+18 pts)', 'Equipment severity (+14 pts)'],
    },
    authorId: 'student-seed-10',
    authorName: 'Aarav Patel',
    authorEmail: 'aarav.p@campus.edu',
    isAnonymous: false,
    verifiedCount: 0,
    unresolvedCount: 0,
    createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TK-102',
    title: 'Water pipe leaking near electrical socket strip',
    description: 'Water dripping continuously from ceiling joint right above the main electrical power bench in Lab 2. Major electrical hazard.',
    building: 'Block A (Engineering & Labs)',
    room: 'Lab 201',
    category: 'safety',
    status: 'in_progress',
    safetySeverity: 5,
    affectedCount: 9,
    affectedUserIds: ['user-seed-4', 'user-seed-5', 'user-seed-6', 'user-seed-7'],
    impactScore: 88,
    impactBreakdown: {
      safetyScore: 35,
      affectedScore: 24,
      recurrenceScore: 13,
      timeScore: 10,
      totalScore: 88,
      priorityLevel: 'Critical',
      reasons: ['High Safety/Hazard risk: Water near power (+35 pts)', '9 students affected (+24 pts)', 'Recurring plumbing leak (+13 pts)', 'Unresolved for 32h (+10 pts)'],
    },
    authorId: 'student-seed-11',
    authorName: 'Riya Sen',
    authorEmail: 'riya.s@campus.edu',
    isAnonymous: false,
    assignedTechnician: 'Rajesh Sharma (Senior Electrician)',
    verifiedCount: 0,
    unresolvedCount: 0,
    createdAt: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TK-103',
    title: 'Wi-Fi AP dropping connection every 10 minutes',
    description: 'Library 3rd floor quiet zone AP-302 constantly disconnects laptops and mobile devices during peak study hours.',
    building: 'Central Library',
    room: '3rd Floor Quiet Study',
    category: 'wifi',
    status: 'in_progress',
    safetySeverity: 1,
    affectedCount: 22,
    affectedUserIds: ['user-seed-8', 'user-seed-9', 'user-seed-10', 'user-seed-11'],
    impactScore: 71,
    impactBreakdown: {
      safetyScore: 7,
      affectedScore: 30,
      recurrenceScore: 20,
      timeScore: 14,
      totalScore: 71,
      priorityLevel: 'High',
      reasons: ['22 students affected (+30 pts)', 'High recurrence hotspot in library (+20 pts)', 'Unresolved for 54h (+14 pts)'],
    },
    authorId: 'student-seed-12',
    authorName: 'Anonymous Student',
    authorEmail: '',
    isAnonymous: true,
    assignedTechnician: 'Campus IT Network Team',
    verifiedCount: 0,
    unresolvedCount: 0,
    createdAt: new Date(Date.now() - 54 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TK-104',
    title: 'Ceiling projector HDMI flickering and color washed out',
    description: 'Main lecture projector in Room 301 shows severe green tint and loses HDMI signal whenever instructor moves the console.',
    building: 'Block C (Computer Science & IT)',
    room: 'Lecture Hall 301',
    category: 'tech',
    status: 'reported',
    safetySeverity: 2,
    affectedCount: 16,
    affectedUserIds: ['user-seed-12', 'user-seed-13'],
    impactScore: 66,
    impactBreakdown: {
      safetyScore: 14,
      affectedScore: 30,
      recurrenceScore: 13,
      timeScore: 9,
      totalScore: 66,
      priorityLevel: 'High',
      reasons: ['16 students affected in lecture (+30 pts)', 'Moderate equipment severity (+14 pts)', 'Recurring projector issue (+13 pts)'],
    },
    authorId: 'student-seed-13',
    authorName: 'Prof. David Thorne',
    authorEmail: 'd.thorne@campus.edu',
    isAnonymous: false,
    verifiedCount: 0,
    unresolvedCount: 0,
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'TK-105',
    title: 'Water tap leaking continuously in 2nd floor restroom',
    description: 'Middle washbasin faucet does not shut off completely, wasting clean water and pooling on the tile floor.',
    building: 'Block B (Science & Humanities)',
    room: 'Restroom 2F East',
    category: 'plumbing',
    status: 'resolved',
    safetySeverity: 2,
    affectedCount: 3,
    affectedUserIds: ['user-seed-14'],
    impactScore: 42,
    impactBreakdown: {
      safetyScore: 14,
      affectedScore: 12,
      recurrenceScore: 6,
      timeScore: 10,
      totalScore: 42,
      priorityLevel: 'Medium',
      reasons: ['Moderate plumbing leak (+14 pts)', '3 students affected (+12 pts)', 'Prior report (+6 pts)'],
    },
    authorId: 'student-seed-14',
    authorName: 'Kunal Joshi',
    authorEmail: 'kunal.j@campus.edu',
    isAnonymous: false,
    assignedTechnician: 'Prakash (Plumbing Dept)',
    resolvedBy: 'Prakash (Plumbing Dept)',
    resolutionNotes: 'Replaced rubber washer and tightened valve cartridge. Flow tested OK.',
    verifiedCount: 2,
    unresolvedCount: 0,
    verifications: [
      { userId: 'user-seed-15', userName: 'Ananya', confirmed: true, at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      { userId: 'user-seed-16', userName: 'Dev', confirmed: true, at: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];
