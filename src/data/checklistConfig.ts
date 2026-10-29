import { ChecklistConfig } from '../types';

// Sequential Selling Journey (Step 1 to Step 5)
export const CHECKLIST_JOURNEY: ChecklistConfig[] = [
  {
    id: 'tools_prep',
    title: 'Tools Preparation',
    category: 'Preparation',
    points: 15,
    allowsGallery: false,
    isMultiEntry: false,
    requiredForDailyComplete: true
  },
  {
    id: 'grooming',
    title: 'Grooming',
    category: 'Preparation',
    points: 15,
    allowsGallery: false,
    isMultiEntry: false,
    requiredForDailyComplete: true
  },
  {
    id: 'wa_blast',
    title: 'WA Blast/Follow up',
    category: 'Preparation',
    points: 20,
    allowsGallery: true, // Gallery upload allowed
    isMultiEntry: false,
    requiredForDailyComplete: true
  },
  {
    id: 'dept_prep',
    title: 'Progress Departemen',
    category: 'Preparation',
    points: 15,
    allowsGallery: false,
    isMultiEntry: false,
    requiredForDailyComplete: true
  },
  {
    id: 'gateway',
    title: 'Stand in Gateway',
    category: 'Floor Action',
    points: 20,
    allowsGallery: false,
    isMultiEntry: false,
    requiredForDailyComplete: true
  }
];

// Exhibition Areas (All unlocked directly because shifts differ per staff)
export const EXHIBITION_ITEMS: ChecklistConfig[] = [
  {
    id: 'mc_exhibition',
    title: 'Pameran MC',
    category: 'Exhibition',
    points: 15,
    allowsGallery: false,
    isMultiEntry: false,
    requiredForDailyComplete: false
  },
  {
    id: 'capsule_exhibition',
    title: 'Pameran Capsule',
    category: 'Exhibition',
    points: 15,
    allowsGallery: false,
    isMultiEntry: false,
    requiredForDailyComplete: false
  },
  {
    id: 'kells_exhibition',
    title: 'Pameran Kells',
    category: 'Exhibition',
    points: 15,
    allowsGallery: false,
    isMultiEntry: false,
    requiredForDailyComplete: false
  },
  {
    id: 'other_exhibition',
    title: 'Pameran Lainnya',
    category: 'Exhibition',
    points: 15,
    allowsGallery: false,
    isMultiEntry: false,
    requiredForDailyComplete: false
  }
];

// Floor Activities (Unlocked once Progress Departemen is completed!)
export const FLOOR_ACTIVITIES: ChecklistConfig[] = [
  {
    id: 'buddy',
    title: 'Buddy',
    category: 'Floor Action',
    points: 25,
    allowsGallery: false, // Camera only
    isMultiEntry: true,
    requiredForDailyComplete: false
  },
  {
    id: 'closing',
    title: 'Closing the Sales',
    category: 'Floor Action',
    points: 50,
    allowsGallery: true, // Gallery upload allowed as requested
    isMultiEntry: true,
    requiredForDailyComplete: false
  }
];

export const ALL_CHECKLIST_ITEMS: ChecklistConfig[] = [
  ...CHECKLIST_JOURNEY,
  ...EXHIBITION_ITEMS,
  ...FLOOR_ACTIVITIES
];

export const CHECKLIST_ITEMS = ALL_CHECKLIST_ITEMS;
