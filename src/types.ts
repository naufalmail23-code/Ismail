export type Zone = 'COMMERCIAL ZONE' | 'DINING ZONE' | 'LIVING ZONE' | 'SLEEPING ZONE';

export type ChecklistId =
  | 'tools_prep'
  | 'grooming'
  | 'wa_blast'
  | 'dept_prep'
  | 'gateway'
  | 'mc_exhibition'
  | 'capsule_exhibition'
  | 'kells_exhibition'
  | 'other_exhibition'
  | 'buddy'
  | 'closing';

export interface ChecklistConfig {
  id: ChecklistId;
  title: string;
  category: 'Preparation' | 'Floor Action' | 'Exhibition';
  points: number;
  allowsGallery: boolean;
  isMultiEntry: boolean;
  requiredForDailyComplete: boolean;
}

export interface PhotoSubmission {
  id: string;
  checklistId: ChecklistId;
  nip: string;
  staffName: string;
  zone: Zone;
  timestamp: string; // ISO string
  timeString: string;
  dateString: string;
  photoUrl: string;
  notes?: string;
  customerName?: string; // for buddy or closing
  productInterest?: string; // for buddy
  spkNumber?: string; // for closing
  nominal?: number; // for closing sales
  isFromGallery: boolean;
  watermarkText: string;
}

export interface StaffRecord {
  nip: string;
  name: string;
  zone: Zone;
  submissions: Record<string, PhotoSubmission[]>; // checklistId -> array of submissions
  points: number;
  streakDays: number;
  streakActive: boolean; // active today if 100% complete (including buddy)
  lastActive?: string;
  managerNotes?: string;
  verifiedByManager?: boolean;
}

export interface ManagerUser {
  nip: string;
  name: string;
  title: string;
}

export interface StoreFinding {
  id: string;
  nip: string;
  staffName: string;
  zone: string;
  category: 'KERUSAKAN_DISPLAY' | 'LAMPU_LISTRIK' | 'TAG_HARGA' | 'KEBERSIHAN_KERAPIHAN' | 'FASILITAS_GEDUNG' | 'LAINNYA';
  categoryLabel: string;
  title: string;
  description: string;
  photoUrl: string;
  timestamp: string;
  timeString: string;
  dateString: string;
  dateKey: string; // YYYY-MM-DD
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  managerFeedback?: string;
  resolvedAt?: string;
}
