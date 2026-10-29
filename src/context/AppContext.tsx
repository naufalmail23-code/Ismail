import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { StaffRecord, ChecklistId, PhotoSubmission, Zone, ManagerUser, StoreFinding } from '../types';
import { getInitialStaffData, RAW_STAFF_LIST } from '../data/initialStaff';
import { CHECKLIST_JOURNEY, ALL_CHECKLIST_ITEMS } from '../data/checklistConfig';
import { findManagerByNip } from '../data/managers';
import { getGroomingCompliment } from '../utils/compliments';
import confetti from 'canvas-confetti';
import {
  idbGet,
  idbSet,
  idbDelete,
  safeLocalStorageSet,
  purgeLegacyStorageKeys,
  broadcastRealtimeEvent,
  subscribeRealtimeEvents
} from '../utils/storage';

interface AppContextType {
  currentUserType: 'GUEST' | 'STAFF' | 'MANAGER';
  currentStaffNip: string | null;
  currentStaff: StaffRecord | null;
  currentManager: ManagerUser | null;
  isManagerViewingAsStaff: boolean;
  allStaff: Record<string, StaffRecord>;
  loginStaff: (nip: string, password: string) => { success: boolean; error?: string };
  loginManager: (nip: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  returnToManager: () => void;
  submitChecklistPhoto: (params: {
    checklistId: ChecklistId;
    photoDataUrl: string;
    isFromGallery: boolean;
    notes?: string;
    customerName?: string;
    productInterest?: string;
    spkNumber?: string;
    nominal?: number;
  }) => void;
  deleteSubmission: (checklistId: ChecklistId, submissionId: string) => void;
  switchStaffForTesting: (nip: string, fromManager?: boolean) => void;
  resetAllDataToDefault: () => void;
  exportToCsv: () => void;
  currentTime: Date;
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  clearToast: () => void;
  triggerCelebration: () => void;
  showLoginModal: boolean;
  dismissLoginModal: () => void;
  centerAlertMessage: string | null;
  setCenterAlertMessage: (msg: string | null) => void;
  // Store Findings (Temuan SMT)
  storeFindings: StoreFinding[];
  submitStoreFinding: (params: {
    title: string;
    description: string;
    photoUrl: string;
    category: StoreFinding['category'];
    categoryLabel: string;
    zone: string;
  }) => void;
  updateFindingStatus: (
    findingId: string,
    status: StoreFinding['status'],
    managerFeedback?: string
  ) => void;
  // Historical date query helper
  historyByDate: Record<string, Record<string, StaffRecord>>;
  getStaffDataForDate: (dateKey: string) => Record<string, StaffRecord>;
}

const STORAGE_KEY = 'ready_to_sell_informa_alsut_v6';
const STORAGE_AUTH_KEY = 'ready_to_sell_auth_v6';
const STORAGE_DATE_KEY = 'ready_to_sell_date_v6';
const STORAGE_FINDINGS_KEY = 'ready_to_sell_findings_v6';
const STORAGE_HISTORY_KEY = 'ready_to_sell_history_v6';

// IndexedDB storage keys (high capacity, handles all photo data without quota issues)
const IDB_STAFF_KEY = 'ready_to_sell_staff_v7';
const IDB_FINDINGS_KEY = 'ready_to_sell_findings_v7';
const IDB_HISTORY_KEY = 'ready_to_sell_history_v7';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to get formatted local date YYYY-MM-DD
export const getTodayDateKey = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Core 6 items required for 100% Progress:
export const CORE_100_PERCENT_ITEMS: ChecklistId[] = [
  'tools_prep',
  'grooming',
  'wa_blast',
  'dept_prep',
  'gateway',
  'buddy'
];

export const INITIAL_FINDINGS: StoreFinding[] = [
  {
    id: 'fnd_1',
    nip: '113038',
    staffName: 'FERHANS IQBAL RAMADHAN',
    zone: 'LIVING ZONE',
    category: 'LAMPU_LISTRIK',
    categoryLabel: 'Lampu & Kelistrikan',
    title: 'Lampu Sorot Display Sofa Mati',
    description: 'Ada 2 unit spot track light di area display sofa sudut Living mati total, perlu penggantian bohlam.',
    photoUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    timeString: '10:30 WIB',
    dateString: '29 Okt 2026',
    dateKey: getTodayDateKey(),
    status: 'IN_PROGRESS',
    managerFeedback: 'Sudah dilaporkan ke tim Maintenance Store, teknisi sedang cek sekring.'
  },
  {
    id: 'fnd_2',
    nip: '114620',
    staffName: 'AGISNI NURUL HUDA',
    zone: 'DINING ZONE',
    category: 'TAG_HARGA',
    categoryLabel: 'Tag Harga & Label Promosi',
    title: 'Price Card Meja Makan Preston Hilang',
    description: 'Tag harga dan leaflet promo diskon member pada Meja Makan Preston 6 Seater tidak ada di tempat.',
    photoUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop&q=80',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    timeString: '08:45 WIB',
    dateString: '29 Okt 2026',
    dateKey: getTodayDateKey(),
    status: 'PENDING'
  },
  {
    id: 'fnd_3',
    nip: '098314',
    staffName: 'DENI SETIAWAN',
    zone: 'COMMERCIAL ZONE',
    category: 'KERUSAKAN_DISPLAY',
    categoryLabel: 'Kerusakan Display Produk',
    title: 'Handle Pintu Lemari Arsip Goyang',
    description: 'Handle pintu kanan lemari kantor display goyang dan bautnya kendor, perlu dikencangkan agar tidak patah.',
    photoUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80',
    timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
    timeString: '14:20 WIB',
    dateString: '28 Okt 2026',
    dateKey: getTodayDateKey(new Date(Date.now() - 86400000)),
    status: 'RESOLVED',
    managerFeedback: 'Selesai diperbaiki oleh tim VM Store kemarin sore.',
    resolvedAt: '28 Okt 2026 16:00 WIB'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session Persistence
  const [currentUserType, setCurrentUserType] = useState<'GUEST' | 'STAFF' | 'MANAGER'>(() => {
    try {
      const auth = localStorage.getItem(STORAGE_AUTH_KEY);
      if (auth) {
        const parsed = JSON.parse(auth);
        if (parsed.userType === 'STAFF' || parsed.userType === 'MANAGER') {
          return parsed.userType;
        }
      }
    } catch (e) {
      console.warn('Failed to parse auth storage:', e);
    }
    return 'GUEST';
  });

  const [currentStaffNip, setCurrentStaffNip] = useState<string | null>(() => {
    try {
      const auth = localStorage.getItem(STORAGE_AUTH_KEY);
      if (auth) {
        const parsed = JSON.parse(auth);
        if (parsed.userType === 'STAFF' && parsed.nip) {
          return parsed.nip;
        }
      }
    } catch (e) {
      console.warn('Failed to parse staff nip storage:', e);
    }
    return null;
  });

  const [currentManager, setCurrentManager] = useState<ManagerUser | null>(() => {
    try {
      const auth = localStorage.getItem(STORAGE_AUTH_KEY);
      if (auth) {
        const parsed = JSON.parse(auth);
        if (parsed.userType === 'MANAGER' && parsed.manager) {
          return parsed.manager;
        }
      }
    } catch (e) {
      console.warn('Failed to parse manager storage:', e);
    }
    return null;
  });

  const [isManagerViewingAsStaff, setIsManagerViewingAsStaff] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Center pop-up states
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [centerAlertMessage, setCenterAlertMessage] = useState<string | null>(null);

  // Store Findings (Temuan SMT)
  const [storeFindings, setStoreFindings] = useState<StoreFinding[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FINDINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to read store findings:', e);
    }
    return INITIAL_FINDINGS;
  });

  // Persist store findings to IndexedDB and safe localStorage
  useEffect(() => {
    idbSet(IDB_FINDINGS_KEY, storeFindings);
    safeLocalStorageSet(STORAGE_FINDINGS_KEY, JSON.stringify(storeFindings));
  }, [storeFindings]);

  // Historical staff records by date
  const [historyByDate, setHistoryByDate] = useState<Record<string, Record<string, StaffRecord>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to read history:', e);
    }
    return {};
  });

  // Persist history to IndexedDB and safe localStorage
  useEffect(() => {
    idbSet(IDB_HISTORY_KEY, historyByDate);
    safeLocalStorageSet(STORAGE_HISTORY_KEY, JSON.stringify(historyByDate));
  }, [historyByDate]);

  // Current Day Staff Data
  const [allStaff, setAllStaff] = useState<Record<string, StaffRecord>>(() => {
    const today = getTodayDateKey();
    let records: Record<string, StaffRecord> | null = null;
    const savedDate = localStorage.getItem(STORAGE_DATE_KEY);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        records = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to read localStorage:', e);
    }

    if (!records) {
      records = getInitialStaffData();
    }

    // Daily Reset Enforcement
    if (savedDate && savedDate !== today) {
      // Archive yesterday's data before reset
      try {
        const hist = localStorage.getItem(STORAGE_HISTORY_KEY);
        const parsedHist = hist ? JSON.parse(hist) : {};
        parsedHist[savedDate] = records;
        safeLocalStorageSet(STORAGE_HISTORY_KEY, JSON.stringify(parsedHist));
      } catch {}

      Object.keys(records).forEach((nip) => {
        const rec = records![nip];
        const hadCompletedAllCoreYesterday = CORE_100_PERCENT_ITEMS.every(
          (id) => (rec.submissions[id] || []).length > 0
        );

        if (hadCompletedAllCoreYesterday) {
          rec.streakActive = false;
        } else {
          rec.streakDays = 0;
          rec.streakActive = false;
        }

        rec.submissions = {};
        rec.lastActive = 'Belum ada aktivitas hari ini';
      });
      safeLocalStorageSet(STORAGE_DATE_KEY, today);
    } else if (!savedDate) {
      safeLocalStorageSet(STORAGE_DATE_KEY, today);
    }

    return records;
  });

  // Load authoritative data from IndexedDB on startup & subscribe to cross-tab realtime events
  useEffect(() => {
    purgeLegacyStorageKeys();

    let isMounted = true;
    (async () => {
      try {
        const dbStaff = await idbGet<Record<string, StaffRecord>>(IDB_STAFF_KEY);
        if (isMounted && dbStaff && Object.keys(dbStaff).length > 0) {
          setAllStaff(dbStaff);
        }
        const dbFindings = await idbGet<StoreFinding[]>(IDB_FINDINGS_KEY);
        if (isMounted && dbFindings && dbFindings.length > 0) {
          setStoreFindings(dbFindings);
        }
        const dbHistory = await idbGet<Record<string, Record<string, StaffRecord>>>(IDB_HISTORY_KEY);
        if (isMounted && dbHistory && Object.keys(dbHistory).length > 0) {
          setHistoryByDate(dbHistory);
        }
      } catch (err) {
        console.warn('Initial IndexedDB load error:', err);
      }
    })();

    // Cross-tab real-time sync (SMT submits in one tab -> Manager tab updates live)
    const unsubscribe = subscribeRealtimeEvents((msg) => {
      if (msg.type === 'STAFF_SYNC' && msg.allStaff) {
        setAllStaff(msg.allStaff);
      } else if (msg.type === 'FINDING_SYNC' && msg.storeFindings) {
        setStoreFindings(msg.storeFindings);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sync today's active data into historyByDate ONLY when allStaff changes (not every second)
  useEffect(() => {
    const today = getTodayDateKey();
    setHistoryByDate((prev) => ({
      ...prev,
      [today]: allStaff
    }));
  }, [allStaff]);

  // Persist staff records to IndexedDB and safe localStorage, broadcast update
  useEffect(() => {
    idbSet(IDB_STAFF_KEY, allStaff);
    safeLocalStorageSet(STORAGE_KEY, JSON.stringify(allStaff));
    broadcastRealtimeEvent({ type: 'STAFF_SYNC', allStaff, dateKey: getTodayDateKey() });
  }, [allStaff]);

  // Real-time clock & midnight rollover detector
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const today = getTodayDateKey(now);
      const savedDate = localStorage.getItem(STORAGE_DATE_KEY);
      if (savedDate && savedDate !== today) {
        setAllStaff((prev) => {
          // Archive past day
          setHistoryByDate((h) => ({
            ...h,
            [savedDate]: prev
          }));

          const nextStaff = { ...prev };
          Object.keys(nextStaff).forEach((nip) => {
            const rec = { ...nextStaff[nip] };
            const completedAllCore = CORE_100_PERCENT_ITEMS.every(
              (id) => (rec.submissions[id] || []).length > 0
            );
            if (!completedAllCore) {
              rec.streakDays = 0;
            }
            rec.streakActive = false;
            rec.submissions = {};
            rec.lastActive = 'Belum ada aktivitas hari ini';
            nextStaff[nip] = rec;
          });
          return nextStaff;
        });
        safeLocalStorageSet(STORAGE_DATE_KEY, today);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#38bdf8', '#34d399', '#ffffff']
      });
    } catch {
      // ignore
    }
  };

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const clearToast = () => setToastMessage(null);

  const currentStaff = currentStaffNip ? allStaff[currentStaffNip] || null : null;

  const dismissLoginModal = () => {
    setShowLoginModal(false);
  };

  const loginStaff = (nip: string, pass: string): { success: boolean; error?: string } => {
    const cleanNip = nip.trim();
    const cleanPass = pass.trim();

    if (cleanPass !== 'alsutjaya') {
      return { success: false, error: 'Password salah! Hubungi Supervisor atau Manager.' };
    }

    const found = RAW_STAFF_LIST.find((s) => s.nip === cleanNip);
    if (!found) {
      return {
        success: false,
        error: `NIP ${cleanNip} tidak terdaftar!`
      };
    }

    setCurrentUserType('STAFF');
    setCurrentStaffNip(cleanNip);
    setIsManagerViewingAsStaff(false);
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify({ userType: 'STAFF', nip: cleanNip }));
    setShowLoginModal(true);

    return { success: true };
  };

  const loginManager = (nipInput: string, pass: string): { success: boolean; error?: string } => {
    const cleanNip = nipInput.trim();
    const cleanPass = pass.trim();

    if (cleanPass !== 'manageralsut') {
      return { success: false, error: 'Password Manajer salah!' };
    }

    const manager = findManagerByNip(cleanNip);
    if (!manager && cleanNip !== '198469') {
      return {
        success: false,
        error: `NIP ${cleanNip} tidak terdaftar sebagai Manager Store Informa Alam Sutera!`
      };
    }

    const activeMgr: ManagerUser = manager || {
      nip: '198469',
      name: 'STORE MANAGER',
      title: 'STORE MANAGER'
    };

    setCurrentUserType('MANAGER');
    setCurrentManager(activeMgr);
    setCurrentStaffNip(null);
    setIsManagerViewingAsStaff(false);

    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify({ userType: 'MANAGER', manager: activeMgr }));
    showToast(`Selamat datang, ${activeMgr.name} (${activeMgr.title})`, 'success');
    return { success: true };
  };

  const logout = () => {
    setCurrentUserType('GUEST');
    setCurrentStaffNip(null);
    setCurrentManager(null);
    setIsManagerViewingAsStaff(false);
    setShowLoginModal(false);
    localStorage.removeItem(STORAGE_AUTH_KEY);
  };

  const returnToManager = () => {
    setCurrentUserType('MANAGER');
    setCurrentStaffNip(null);
    setIsManagerViewingAsStaff(false);
    showToast('Kembali ke Portal Manager', 'info');
  };

  const switchStaffForTesting = (nip: string, fromManager: boolean = false) => {
    if (allStaff[nip]) {
      setCurrentStaffNip(nip);
      setCurrentUserType('STAFF');
      if (fromManager || currentManager) {
        setIsManagerViewingAsStaff(true);
      }
    }
  };

  // Submit Checklist Photo with center pop-up after EVERY checklist
  const submitChecklistPhoto = (params: {
    checklistId: ChecklistId;
    photoDataUrl: string;
    isFromGallery: boolean;
    notes?: string;
    customerName?: string;
    productInterest?: string;
    spkNumber?: string;
    nominal?: number;
  }) => {
    if (!currentStaffNip) return;

    const staff = allStaff[currentStaffNip];
    if (!staff) return;

    const config = ALL_CHECKLIST_ITEMS.find((c) => c.id === params.checklistId);
    if (!config) return;

    const now = new Date();
    const timeString =
      now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const dateString = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newSubmission: PhotoSubmission = {
      id: `sub_${currentStaffNip}_${params.checklistId}_${Date.now()}`,
      checklistId: params.checklistId,
      nip: currentStaffNip,
      staffName: staff.name,
      zone: staff.zone,
      timestamp: now.toISOString(),
      timeString,
      dateString,
      photoUrl: params.photoDataUrl,
      notes: params.notes,
      customerName: params.customerName,
      productInterest: params.productInterest,
      spkNumber: params.spkNumber,
      nominal: params.nominal,
      isFromGallery: params.isFromGallery,
      watermarkText: `[READY TO SELL - INFORMA ALAM SUTERA] ${currentStaffNip} - ${timeString}`
    };

    setAllStaff((prev) => {
      const currentRec = prev[currentStaffNip];
      const existingList = currentRec.submissions[params.checklistId] || [];

      let updatedList: PhotoSubmission[];
      if (config.isMultiEntry) {
        updatedList = [...existingList, newSubmission];
      } else {
        updatedList = [newSubmission];
      }

      // Re-calculate Total Points:
      let newPoints = 0;
      ALL_CHECKLIST_ITEMS.forEach((item) => {
        const itemSubs =
          item.id === params.checklistId
            ? updatedList
            : currentRec.submissions[item.id] || [];
        if (item.isMultiEntry) {
          newPoints += itemSubs.length * item.points;
        } else if (itemSubs.length > 0) {
          newPoints += item.points;
        }
      });

      // Progress 100% check:
      const allCoreDone = CORE_100_PERCENT_ITEMS.every((itemId) => {
        const count =
          itemId === params.checklistId
            ? updatedList.length
            : (currentRec.submissions[itemId] || []).length;
        return count > 0;
      });

      if (allCoreDone) {
        newPoints += 50; // Completion reward
      }

      // TikTok-style Streak calculation:
      let updatedStreakDays = currentRec.streakDays || 0;
      if (allCoreDone && !currentRec.streakActive) {
        updatedStreakDays = Math.max(1, updatedStreakDays + 1);
      }

      return {
        ...prev,
        [currentStaffNip]: {
          ...currentRec,
          submissions: {
            ...currentRec.submissions,
            [params.checklistId]: updatedList
          },
          points: newPoints,
          streakDays: updatedStreakDays,
          streakActive: allCoreDone,
          lastActive: 'Baru saja'
        }
      };
    });

    triggerCelebration();

    // Center Pop-up after EVERY checklist (Request 1)
    if (config.id === 'grooming') {
      const compliment = getGroomingCompliment(staff.name);
      setCenterAlertMessage(compliment);
    } else if (config.id === 'tools_prep') {
      setCenterAlertMessage('Terima kasih ya sudah melengkapi Tools Preparation! Perlengkapan jualan Anda sudah siap untuk melayani customer hari ini.');
    } else if (config.id === 'wa_blast') {
      setCenterAlertMessage('Terima kasih ya sudah melakukan WA Blast & Follow up! Konsistensi menyapa customer adalah kunci dalam meningkatkan retensi.');
    } else if (config.id === 'dept_prep') {
      setCenterAlertMessage('Terima kasih ya sudah mempersiapkan Departemen! Area store Informa Alam Sutera makin rapi dan siap dikunjungi.');
    } else if (config.id === 'gateway') {
      setCenterAlertMessage('Terima kasih ya sudah standby di Gateway! Berikan senyum, salam, dan sapaan terbaik untuk customer.');
    } else if (config.id === 'buddy') {
      setCenterAlertMessage(`Terima kasih ya sudah mendampingi ${params.customerName || 'customer'}! Catatan dan kebutuhan customer berhasil disimpan.`);
    } else if (config.id === 'closing') {
      setCenterAlertMessage('Luar biasa closing-nya! Terima kasih ya sudah mencatatkan transaksi ini. Satu langkah makin dekat target!');
    } else {
      setCenterAlertMessage(`Terima kasih ya sudah mengisi ${config.title}! Tetap semangat beraktivitas.`);
    }
  };

  // Submit Store Finding (Lapor Temuan)
  const submitStoreFinding = (params: {
    title: string;
    description: string;
    photoUrl: string;
    category: StoreFinding['category'];
    categoryLabel: string;
    zone: string;
  }) => {
    if (!currentStaff) return;

    const now = new Date();
    const timeString =
      now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const dateString = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newFinding: StoreFinding = {
      id: `fnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nip: currentStaff.nip,
      staffName: currentStaff.name,
      zone: params.zone || currentStaff.zone,
      category: params.category,
      categoryLabel: params.categoryLabel,
      title: params.title,
      description: params.description,
      photoUrl: params.photoUrl,
      timestamp: now.toISOString(),
      timeString,
      dateString,
      dateKey: getTodayDateKey(now),
      status: 'PENDING'
    };

    setStoreFindings((prev) => [newFinding, ...prev]);
    triggerCelebration();
    setCenterAlertMessage(
      'Terima kasih ya sudah melaporkan temuan store ini! Laporan Anda langsung diteruskan ke Dashboard Manager untuk ditindaklanjuti.'
    );
  };

  // Update Store Finding Status (Manager Action)
  const updateFindingStatus = (
    findingId: string,
    status: StoreFinding['status'],
    managerFeedback?: string
  ) => {
    const now = new Date();
    const resolvedAt =
      now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' ' +
      now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) +
      ' WIB';

    setStoreFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          return {
            ...f,
            status,
            managerFeedback: managerFeedback ?? f.managerFeedback,
            resolvedAt: status === 'RESOLVED' ? resolvedAt : f.resolvedAt
          };
        }
        return f;
      })
    );
    showToast(`Status temuan berhasil diubah menjadi: ${status === 'RESOLVED' ? 'Selesai' : status === 'IN_PROGRESS' ? 'Dalam Proses' : 'Perlu Tindakan'}`, 'success');
  };

  // Helper to get staff data for any specific date
  const getStaffDataForDate = (dateKey: string): Record<string, StaffRecord> => {
    const today = getTodayDateKey(currentTime);
    if (dateKey === today) {
      return allStaff;
    }
    if (historyByDate[dateKey]) {
      return historyByDate[dateKey];
    }
    // If past date has no stored record, return initial dataset with completed sample for that date
    return getInitialStaffData();
  };

  const deleteSubmission = (checklistId: ChecklistId, submissionId: string) => {
    if (!currentStaffNip) return;
    setAllStaff((prev) => {
      const currentRec = prev[currentStaffNip];
      const existing = currentRec.submissions[checklistId] || [];
      const updated = existing.filter((s) => s.id !== submissionId);

      const newSubs = {
        ...currentRec.submissions,
        [checklistId]: updated
      };

      const allCoreDone = CORE_100_PERCENT_ITEMS.every(
        (id) => (newSubs[id] || []).length > 0
      );

      let newPoints = 0;
      ALL_CHECKLIST_ITEMS.forEach((item) => {
        const itemSubs = newSubs[item.id] || [];
        if (item.isMultiEntry) {
          newPoints += itemSubs.length * item.points;
        } else if (itemSubs.length > 0) {
          newPoints += item.points;
        }
      });

      return {
        ...prev,
        [currentStaffNip]: {
          ...currentRec,
          submissions: newSubs,
          points: newPoints,
          streakActive: allCoreDone
        }
      };
    });
  };

  const resetAllDataToDefault = () => {
    const fresh = getInitialStaffData();
    setAllStaff(fresh);
    setStoreFindings(INITIAL_FINDINGS);
    setHistoryByDate({});

    idbSet(IDB_STAFF_KEY, fresh);
    idbSet(IDB_FINDINGS_KEY, INITIAL_FINDINGS);
    idbDelete(IDB_HISTORY_KEY);

    safeLocalStorageSet(STORAGE_KEY, JSON.stringify(fresh));
    safeLocalStorageSet(STORAGE_DATE_KEY, getTodayDateKey());
    safeLocalStorageSet(STORAGE_FINDINGS_KEY, JSON.stringify(INITIAL_FINDINGS));
    try {
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    } catch {}

    broadcastRealtimeEvent({ type: 'STAFF_SYNC', allStaff: fresh, dateKey: getTodayDateKey() });
    broadcastRealtimeEvent({ type: 'FINDING_SYNC', storeFindings: INITIAL_FINDINGS });
    showToast('Seluruh data checklist dan temuan berhasil di-reset!', 'info');
  };

  const exportToCsv = () => {
    const rows = [
      [
        'NIP',
        'NAMA SMT',
        'ZONA',
        'TOOLS PREP',
        'GROOMING',
        'WA BLAST',
        'PROGRESS DEPT',
        'STAND IN GATEWAY',
        'BUDDY COUNT',
        'CLOSING COUNT',
        'MC EXH',
        'CAPSULE EXH',
        'KELLS EXH',
        'OTHER EXH',
        'TOTAL POIN',
        'STREAK DAYS',
        'STATUS 100%'
      ]
    ];

    RAW_STAFF_LIST.forEach((s) => {
      const rec = allStaff[s.nip];
      const subs = rec?.submissions || {};
      const coreDone = CORE_100_PERCENT_ITEMS.every((id) => (subs[id] || []).length > 0);

      rows.push([
        s.nip,
        `"${s.name}"`,
        s.zone,
        (subs['tools_prep'] || []).length > 0 ? 'YA' : 'TIDAK',
        (subs['grooming'] || []).length > 0 ? 'YA' : 'TIDAK',
        (subs['wa_blast'] || []).length > 0 ? 'YA' : 'TIDAK',
        (subs['dept_prep'] || []).length > 0 ? 'YA' : 'TIDAK',
        (subs['gateway'] || []).length > 0 ? 'YA' : 'TIDAK',
        String((subs['buddy'] || []).length),
        String((subs['closing'] || []).length),
        (subs['mc_exhibition'] || []).length > 0 ? 'YA' : 'TIDAK',
        (subs['capsule_exhibition'] || []).length > 0 ? 'YA' : 'TIDAK',
        (subs['kells_exhibition'] || []).length > 0 ? 'YA' : 'TIDAK',
        (subs['other_exhibition'] || []).length > 0 ? 'YA' : 'TIDAK',
        String(rec?.points || 0),
        String(rec?.streakDays || 0),
        coreDone ? '100% LENGKAP' : 'BELUM'
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daily_Tracker_Informa_Alsut_${getTodayDateKey()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data CSV berhasil diunduh!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUserType,
        currentStaffNip,
        currentStaff,
        currentManager,
        isManagerViewingAsStaff,
        allStaff,
        loginStaff,
        loginManager,
        logout,
        returnToManager,
        submitChecklistPhoto,
        deleteSubmission,
        switchStaffForTesting,
        resetAllDataToDefault,
        exportToCsv,
        currentTime,
        toastMessage,
        clearToast,
        triggerCelebration,
        showLoginModal,
        dismissLoginModal,
        centerAlertMessage,
        setCenterAlertMessage,
        storeFindings,
        submitStoreFinding,
        updateFindingStatus,
        historyByDate,
        getStaffDataForDate
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
