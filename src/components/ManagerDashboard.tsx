import React, { useState, useMemo } from 'react';
import { useApp, CORE_100_PERCENT_ITEMS, getTodayDateKey } from '../context/AppContext';
import { RAW_STAFF_LIST } from '../data/initialStaff';
import { CHECKLIST_JOURNEY, EXHIBITION_ITEMS, FLOOR_ACTIVITIES } from '../data/checklistConfig';
import { StaffRecord, Zone, PhotoSubmission, StoreFinding } from '../types';
import {
  Users,
  Award,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  Eye,
  LogOut,
  RotateCcw,
  ShieldCheck,
  BellRing,
  X,
  ExternalLink,
  Flame,
  MessageSquare,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Send
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const {
    allStaff,
    logout,
    currentTime,
    exportToCsv,
    resetAllDataToDefault,
    switchStaffForTesting,
    currentManager,
    storeFindings,
    updateFindingStatus,
    getStaffDataForDate
  } = useApp();

  // Tab State: Matrix, Buddy Notes, and Laporan Temuan Store
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'BUDDY_NOTES' | 'FINDINGS'>('MATRIX');
  
  // Historical Date Picker State (Request 4)
  const todayKey = getTodayDateKey(currentTime);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  const [selectedZone, setSelectedZone] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'COMPLETE' | 'IN_PROGRESS' | 'NOT_STARTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'PROGRESS' | 'STREAK' | 'POINTS' | 'NAME' | 'NIP' | 'BUDDY'>('PROGRESS');

  // Finding filter state
  const [findingStatusFilter, setFindingStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [findingZoneFilter, setFindingZoneFilter] = useState<string>('Semua');

  // Inspection modal for a selected staff member / photo
  const [selectedStaffNip, setSelectedStaffNip] = useState<string | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<PhotoSubmission | null>(null);
  const [viewingFindingPhoto, setViewingFindingPhoto] = useState<string | null>(null);
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Manager feedback edit state for findings
  const [editingFindingId, setEditingFindingId] = useState<string | null>(null);
  const [managerNoteInput, setManagerNoteInput] = useState<string>('');

  // Selected Date Object for Indonesian formatting
  const selectedDateObj = useMemo(() => {
    try {
      const [y, m, d] = selectedDateKey.split('-').map(Number);
      return new Date(y, m - 1, d);
    } catch {
      return currentTime;
    }
  }, [selectedDateKey, currentTime]);

  const selectedDateDisplay = selectedDateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const timeStr = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) + ' WIB';

  // Navigate dates
  const handleShiftDate = (days: number) => {
    const next = new Date(selectedDateObj);
    next.setDate(next.getDate() + days);
    setSelectedDateKey(getTodayDateKey(next));
  };

  // Staff records for the selected date
  const staffDataForSelectedDate = useMemo(() => {
    return getStaffDataForDate(selectedDateKey);
  }, [selectedDateKey, getStaffDataForDate, allStaff]);

  // Calculate statistics across all sales staff for the selected date
  const staffList = useMemo(() => {
    return RAW_STAFF_LIST.map((meta) => {
      const rec = staffDataForSelectedDate[meta.nip];
      const subs = rec?.submissions || {};

      const hasTools = (subs['tools_prep'] || []).length > 0;
      const hasGrooming = (subs['grooming'] || []).length > 0;
      const hasWa = (subs['wa_blast'] || []).length > 0;
      const hasDept = (subs['dept_prep'] || []).length > 0;
      const hasGateway = (subs['gateway'] || []).length > 0;
      const buddyList = subs['buddy'] || [];
      const closingList = subs['closing'] || [];
      const hasMc = (subs['mc_exhibition'] || []).length > 0;
      const hasCapsule = (subs['capsule_exhibition'] || []).length > 0;
      const hasKells = (subs['kells_exhibition'] || []).length > 0;
      const hasOther = (subs['other_exhibition'] || []).length > 0;

      // 6 core items count (including buddy for 100%)
      const coreDoneCount = [
        hasTools,
        hasGrooming,
        hasWa,
        hasDept,
        hasGateway,
        buddyList.length > 0
      ].filter(Boolean).length;

      const progressPercent = Math.round((coreDoneCount / 6) * 100);

      return {
        ...meta,
        record: rec,
        submissions: subs,
        points: rec?.points || 0,
        streakDays: rec?.streakDays || 0,
        streakActive: !!rec?.streakActive,
        progressPercent,
        hasTools,
        hasGrooming,
        hasWa,
        hasDept,
        hasGateway,
        buddyCount: buddyList.length,
        closingCount: closingList.length,
        buddySubmissions: buddyList,
        hasMc,
        hasCapsule,
        hasKells,
        hasOther
      };
    });
  }, [staffDataForSelectedDate]);

  // Aggregate all Buddy interaction & issue logs for managers
  const allBuddyNotes = useMemo(() => {
    const list: Array<{
      id: string;
      staffName: string;
      staffNip: string;
      zone: Zone;
      timeString: string;
      customerName?: string;
      productInterest?: string;
      notes?: string;
      photoUrl: string;
    }> = [];

    staffList.forEach((s) => {
      s.buddySubmissions.forEach((b) => {
        list.push({
          id: b.id,
          staffName: s.name,
          staffNip: s.nip,
          zone: s.zone,
          timeString: b.timeString,
          customerName: b.customerName,
          productInterest: b.productInterest,
          notes: b.notes,
          photoUrl: b.photoUrl
        });
      });
    });

    return list.sort((a, b) => b.id.localeCompare(a.id));
  }, [staffList]);

  // Filtered store findings
  const filteredFindings = useMemo(() => {
    return storeFindings.filter((f) => {
      if (findingStatusFilter !== 'ALL' && f.status !== findingStatusFilter) return false;
      if (findingZoneFilter !== 'Semua' && f.zone !== findingZoneFilter) return false;
      return true;
    });
  }, [storeFindings, findingStatusFilter, findingZoneFilter]);

  const pendingFindingsCount = storeFindings.filter((f) => f.status === 'PENDING').length;

  // High-level KPI aggregations for selected date
  const totalStaffCount = staffList.length;
  const completedStaffCount = staffList.filter((s) => s.progressPercent >= 100).length;
  const totalBuddies = staffList.reduce((acc, curr) => acc + curr.buddyCount, 0);
  const totalClosings = staffList.reduce((acc, curr) => acc + curr.closingCount, 0);
  const activeStreakCount = staffList.filter((s) => s.streakActive).length;

  // Selected Staff Record for Detail Modal (Request 1)
  const selectedStaffRecord = useMemo(() => {
    if (!selectedStaffNip) return null;
    return staffList.find((s) => s.nip === selectedStaffNip) || null;
  }, [selectedStaffNip, staffList]);

  // Max Points & Top Scorers (Request 2)
  const maxPoints = useMemo(() => {
    return Math.max(...staffList.map((s) => s.points), 0);
  }, [staffList]);

  const topScorers = useMemo(() => {
    if (maxPoints === 0) return [];
    return staffList.filter((s) => s.points === maxPoints);
  }, [staffList, maxPoints]);

  // Filtered & Sorted Staff List
  const filteredStaff = useMemo(() => {
    return staffList
      .filter((s) => {
        if (selectedZone !== 'Semua' && s.zone !== selectedZone) return false;
        if (selectedStatus === 'COMPLETE' && s.progressPercent < 100) return false;
        if (selectedStatus === 'IN_PROGRESS' && (s.progressPercent === 0 || s.progressPercent >= 100)) return false;
        if (selectedStatus === 'NOT_STARTED' && s.progressPercent > 0) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNip = s.nip.toLowerCase().includes(q);
          const matchName = s.name.toLowerCase().includes(q);
          const matchZone = s.zone.toLowerCase().includes(q);
          if (!matchNip && !matchName && !matchZone) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PROGRESS') return b.progressPercent - a.progressPercent;
        if (sortBy === 'STREAK') return b.streakDays - a.streakDays;
        if (sortBy === 'POINTS') return b.points - a.points;
        if (sortBy === 'BUDDY') return b.buddyCount - a.buddyCount;
        if (sortBy === 'NAME') return a.name.localeCompare(b.name);
        if (sortBy === 'NIP') return a.nip.localeCompare(b.nip);
        return 0;
      });
  }, [staffList, selectedZone, selectedStatus, searchQuery, sortBy]);

  const handleSendReminder = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-14 sm:h-15 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Logo Manager with ShieldCheck perisai dengan centang */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-2xs shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight whitespace-nowrap">
                Ready to Sell
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-sky-50 text-sky-700 border border-sky-200 shrink-0 whitespace-nowrap">
                ALSUT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentManager && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 border border-sky-100 text-xs shrink-0">
                <ShieldCheck size={13} className="text-sky-600 shrink-0" />
                <span className="font-bold text-slate-800 truncate max-w-[150px]">{currentManager.name}</span>
                <span className="text-[10px] text-sky-700 font-medium whitespace-nowrap">({currentManager.title})</span>
              </div>
            )}

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 border border-sky-100 text-xs text-sky-800 font-mono whitespace-nowrap shrink-0">
              <Clock size={13} className="text-sky-600" />
              <span>{timeStr}</span>
            </div>

            <button
              onClick={exportToCsv}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer whitespace-nowrap"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 pt-4 space-y-4 flex-1 pb-10">
        
        {/* Banner with Monitoring Title & Interactive Date Picker (Request 4) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-sky-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold mb-1 whitespace-nowrap">
              <span>Informa Living World Alam Sutera</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 whitespace-nowrap truncate">
              Monitoring Activity SMT
            </h2>
          </div>

          {/* Interactive Date & Day Navigator (Request 4) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-sky-50/80 p-1.5 rounded-xl border border-sky-200 shrink-0">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-1 rounded-lg bg-white border border-sky-200 text-slate-600 hover:text-sky-700 transition cursor-pointer shadow-2xs"
              title="Hari Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-sky-200 rounded-lg shadow-2xs">
              <Calendar size={14} className="text-sky-600 shrink-0" />
              <span className="text-xs font-extrabold text-slate-800 whitespace-nowrap">
                {selectedDateDisplay}
              </span>
              <input
                type="date"
                value={selectedDateKey}
                onChange={(e) => {
                  if (e.target.value) setSelectedDateKey(e.target.value);
                }}
                className="w-4 h-4 opacity-0 absolute cursor-pointer"
                title="Pilih Tanggal Tertentu"
              />
            </div>

            <button
              onClick={() => handleShiftDate(1)}
              className="p-1 rounded-lg bg-white border border-sky-200 text-slate-600 hover:text-sky-700 transition cursor-pointer shadow-2xs"
              title="Hari Berikutnya"
            >
              <ChevronRight size={16} />
            </button>

            {selectedDateKey !== todayKey && (
              <button
                onClick={() => setSelectedDateKey(todayKey)}
                className="px-2 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-bold transition cursor-pointer whitespace-nowrap shadow-xs"
              >
                Hari Ini
              </button>
            )}
          </div>
        </div>

        {/* Operational KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          
          <div className="p-3 rounded-xl bg-white border border-sky-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Total SMT</span>
              <Users size={14} className="text-sky-500 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{totalStaffCount}</div>
            <p className="text-[10px] text-slate-400 whitespace-nowrap">4 Zona Toko</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-sky-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">100% Lengkap</span>
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              {completedStaffCount} <span className="text-xs text-slate-400 font-normal">/ {totalStaffCount}</span>
            </div>
            <p className="text-[10px] text-slate-400 whitespace-nowrap">Sampai Buddy</p>
          </div>

          {/* Poin Tertinggi Card (Request 2) */}
          <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 whitespace-nowrap">Poin Tertinggi</span>
              <Award size={14} className="text-amber-500 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
              {maxPoints} <span className="text-xs text-slate-400 font-normal">Poin</span>
            </div>
            <p className="text-[10px] text-slate-700 font-bold truncate" title={topScorers.map((s) => s.name).join(', ')}>
              {topScorers.length > 0
                ? topScorers.length === 1
                  ? `👑 ${topScorers[0].name}`
                  : `👑 ${topScorers[0].name} +${topScorers.length - 1}`
                : 'Belum ada poin'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-sky-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Total Dampingan</span>
              <Award size={14} className="text-sky-600 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-700 font-mono">{totalBuddies}</div>
            <p className="text-[10px] text-slate-400 whitespace-nowrap">Interaksi Buddy</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-sky-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Closing Sales</span>
              <Award size={14} className="text-emerald-500 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">{totalClosings}</div>
            <p className="text-[10px] text-slate-400 whitespace-nowrap">Transaksi Terbit</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-sky-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 whitespace-nowrap">Temuan Store</span>
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
              {pendingFindingsCount} <span className="text-xs text-slate-400 font-normal">Perlu Tindakan</span>
            </div>
            <p className="text-[10px] text-slate-400 whitespace-nowrap">{storeFindings.length} Total Laporan</p>
          </div>

        </div>

        {/* 3 Main View Tabs: Matriks, Catatan Buddy, and Laporan Temuan Store (Request 5) */}
        <div className="flex items-center gap-1.5 border-b border-sky-100 pb-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('MATRIX')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'MATRIX'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <FileText size={14} />
            <span>Matriks Checklist ({filteredStaff.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('BUDDY_NOTES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'BUDDY_NOTES'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <MessageSquare size={14} />
            <span>Catatan Customer / Buddy Logs ({allBuddyNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('FINDINGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'FINDINGS'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <AlertCircle size={14} className={activeTab === 'FINDINGS' ? 'text-white' : 'text-amber-500'} />
            <span>Laporan Temuan Store ({storeFindings.length})</span>
            {pendingFindingsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                activeTab === 'FINDINGS' ? 'bg-white text-amber-700' : 'bg-amber-500 text-white'
              }`}>
                {pendingFindingsCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Checklist Matrix */}
        {activeTab === 'MATRIX' && (
          <div className="rounded-2xl bg-white border border-sky-100 shadow-xs overflow-hidden">
            
            {/* Header Controls */}
            <div className="p-3.5 sm:p-4 border-b border-slate-100 space-y-2.5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base whitespace-nowrap truncate">
                    Matriks Checklist Harian · {selectedDateDisplay}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    Menampilkan {filteredStaff.length} dari {totalStaffCount} SMT · Progres 100% tercapai saat Buddy terisi
                  </p>
                </div>

                <button
                  onClick={resetAllDataToDefault}
                  className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer self-start sm:self-auto whitespace-nowrap"
                  title="Reset seluruh checklist"
                >
                  <RotateCcw size={12} />
                  <span>Reset Data</span>
                </button>
              </div>

              {/* Zone Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                {[
                  { id: 'Semua', label: 'Semua Zona' },
                  { id: 'COMMERCIAL ZONE', label: 'Commercial' },
                  { id: 'DINING ZONE', label: 'Dining' },
                  { id: 'LIVING ZONE', label: 'Living' },
                  { id: 'SLEEPING ZONE', label: 'Sleeping' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedZone(tab.id)}
                    className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition cursor-pointer text-[11px] ${
                      selectedZone === tab.id
                        ? 'bg-sky-500 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Status Filter & Search Input */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-0.5">
                
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari NIP atau Nama SMT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>

                {/* Status pills & Sort */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md border border-slate-200 text-[11px]">
                    <button
                      onClick={() => setSelectedStatus('ALL')}
                      className={`px-2 py-0.5 rounded cursor-pointer whitespace-nowrap ${
                        selectedStatus === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      onClick={() => setSelectedStatus('COMPLETE')}
                      className={`px-2 py-0.5 rounded cursor-pointer whitespace-nowrap ${
                        selectedStatus === 'COMPLETE' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'
                      }`}
                    >
                      100% Lengkap
                    </button>
                    <button
                      onClick={() => setSelectedStatus('IN_PROGRESS')}
                      className={`px-2 py-0.5 rounded cursor-pointer whitespace-nowrap ${
                        selectedStatus === 'IN_PROGRESS' ? 'bg-amber-600 text-white font-bold' : 'text-slate-500'
                      }`}
                    >
                      Proses
                    </button>
                    <button
                      onClick={() => setSelectedStatus('NOT_STARTED')}
                      className={`px-2 py-0.5 rounded cursor-pointer whitespace-nowrap ${
                        selectedStatus === 'NOT_STARTED' ? 'bg-rose-600 text-white font-bold' : 'text-slate-500'
                      }`}
                    >
                      0%
                    </button>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-700 font-semibold focus:outline-none focus:border-sky-500 cursor-pointer whitespace-nowrap"
                  >
                    <option value="PROGRESS">% Selesai</option>
                    <option value="STREAK">Streak Tertinggi</option>
                    <option value="POINTS">Total Poin</option>
                    <option value="BUDDY">Buddy Terbanyak</option>
                    <option value="NAME">Nama (A-Z)</option>
                    <option value="NIP">NIP</option>
                  </select>
                </div>

              </div>

            </div>

            {/* Interactive Table with strict sticky alignment */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-sky-50/60 border-b border-sky-100 text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-2 px-2.5 sticky left-0 bg-sky-50 z-10 w-[75px] min-w-[75px] whitespace-nowrap">ZONA</th>
                    <th className="py-2 px-2 sticky left-[75px] bg-sky-50 z-10 w-[65px] min-w-[65px] whitespace-nowrap">NIP</th>
                    <th className="py-2 px-2.5 sticky left-[140px] bg-sky-50 z-10 min-w-[130px] max-w-[170px] whitespace-nowrap">NAMA SMT</th>
                    <th className="py-2 px-1.5 text-center whitespace-nowrap" title="Tools Preparation">Tools</th>
                    <th className="py-2 px-1.5 text-center whitespace-nowrap" title="Grooming">Groom</th>
                    <th className="py-2 px-1.5 text-center whitespace-nowrap" title="WA Blast/Follow up">WA Blast</th>
                    <th className="py-2 px-1.5 text-center whitespace-nowrap" title="Progress Departemen">Prog Dept</th>
                    <th className="py-2 px-1.5 text-center whitespace-nowrap" title="Stand in Gateway">Gateway</th>
                    <th className="py-2 px-1.5 text-center text-sky-700 font-black whitespace-nowrap" title="Buddy (Kunci 100%)">Buddy</th>
                    <th className="py-2 px-1.5 text-center text-emerald-700 whitespace-nowrap" title="Closing Count">Close</th>
                    <th className="py-2 px-1.5 text-center whitespace-nowrap" title="Pameran MC">MC</th>
                    <th className="py-2 px-1.5 text-center whitespace-nowrap" title="Pameran Capsule">Capsule</th>
                    <th className="py-2 px-1.5 text-center whitespace-nowrap" title="Pameran Kells">Kells</th>
                    <th className="py-2 px-1.5 text-center whitespace-nowrap" title="Pameran Lainnya">Lainnya</th>
                    <th
                      className="py-2 px-2 text-center whitespace-nowrap cursor-pointer hover:bg-sky-100/70 transition"
                      onClick={() => setSortBy('POINTS')}
                      title="Klik untuk mengurutkan poin terbanyak"
                    >
                      <span className="flex items-center justify-center gap-0.5">
                        <span>Poin</span>
                        <Award size={11} className={sortBy === 'POINTS' ? 'text-amber-500' : 'text-slate-400'} />
                      </span>
                    </th>
                    <th
                      className="py-2 px-2 text-center whitespace-nowrap cursor-pointer hover:bg-sky-100/70 transition"
                      onClick={() => setSortBy('STREAK')}
                      title="Klik untuk mengurutkan streak tertinggi"
                    >
                      Streak
                    </th>
                    <th className="py-2 px-2.5 text-center min-w-[75px] whitespace-nowrap">Progress</th>
                    <th className="py-2 px-2 text-center whitespace-nowrap">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((staff) => (
                    <tr
                      key={staff.nip}
                      className="hover:bg-sky-50/40 transition group"
                    >
                      <td className="py-2 px-2.5 font-semibold text-slate-600 text-[10px] sm:text-[11px] whitespace-nowrap sticky left-0 bg-white group-hover:bg-sky-50/40 z-10">
                        {staff.zone.replace(' ZONE', '')}
                      </td>

                      <td className="py-2 px-2 font-mono font-bold text-slate-500 text-[10px] sm:text-[11px] whitespace-nowrap sticky left-[75px] bg-white group-hover:bg-sky-50/40 z-10">
                        {staff.nip}
                      </td>

                      <td
                        title={staff.name}
                        className="py-2 px-2.5 font-bold text-slate-900 text-[10px] sm:text-[11px] leading-tight max-w-[170px] sticky left-[140px] bg-white group-hover:bg-sky-50/40 z-10 break-words"
                      >
                        {staff.name}
                      </td>

                      <td className="py-2 px-1.5 text-center">
                        <TableCheckBadge isDone={staff.hasTools} />
                      </td>
                      <td className="py-2 px-1.5 text-center">
                        <TableCheckBadge isDone={staff.hasGrooming} />
                      </td>
                      <td className="py-2 px-1.5 text-center">
                        <TableCheckBadge isDone={staff.hasWa} />
                      </td>
                      <td className="py-2 px-1.5 text-center">
                        <TableCheckBadge isDone={staff.hasDept} />
                      </td>
                      <td className="py-2 px-1.5 text-center">
                        <TableCheckBadge isDone={staff.hasGateway} />
                      </td>

                      {/* Buddy Count */}
                      <td className="py-2 px-1.5 text-center">
                        {staff.buddyCount > 0 ? (
                          <span className="inline-block px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-mono font-bold text-[10px] whitespace-nowrap">
                            {staff.buddyCount}x
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono text-[10px]">0</span>
                        )}
                      </td>

                      {/* Closing Count */}
                      <td className="py-2 px-1.5 text-center">
                        {staff.closingCount > 0 ? (
                          <span className="inline-block px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] whitespace-nowrap">
                            {staff.closingCount}x
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono text-[10px]">0</span>
                        )}
                      </td>

                      <td className="py-2 px-1.5 text-center">
                        <TableCheckBadge isDone={staff.hasMc} />
                      </td>
                      <td className="py-2 px-1.5 text-center">
                        <TableCheckBadge isDone={staff.hasCapsule} />
                      </td>
                      <td className="py-2 px-1.5 text-center">
                        <TableCheckBadge isDone={staff.hasKells} />
                      </td>
                      <td className="py-2 px-1.5 text-center">
                        <TableCheckBadge isDone={staff.hasOther} />
                      </td>

                      {/* Poin Column (Request 2) */}
                      <td className="py-2 px-2 text-center font-mono whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold text-[10px] sm:text-[11px] ${
                            staff.points === maxPoints && staff.points > 0
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black shadow-2xs'
                              : staff.points > 0
                              ? 'bg-sky-50 text-sky-800 border border-sky-100'
                              : 'text-slate-300 font-normal'
                          }`}
                          title={`${staff.points} Total Poin`}
                        >
                          <Award
                            size={11}
                            className={staff.points === maxPoints && staff.points > 0 ? 'text-amber-600' : 'text-sky-500'}
                          />
                          <span>{staff.points}</span>
                          {staff.points === maxPoints && staff.points > 0 && <span title="Poin Terbanyak Hari Ini">👑</span>}
                        </span>
                      </td>

                      {/* Streak */}
                      <td className="py-2 px-2 text-center font-mono font-bold text-[10px] whitespace-nowrap">
                        {staff.streakActive ? (
                          <span className="text-amber-600 inline-flex items-center justify-center gap-0.5">
                            {staff.streakDays}🔥
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {staff.streakDays}⚪
                          </span>
                        )}
                      </td>

                      {/* Progress bar */}
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <div className="w-10 sm:w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                staff.progressPercent >= 100
                                  ? 'bg-emerald-500'
                                  : staff.progressPercent > 0
                                  ? 'bg-amber-500'
                                  : 'bg-transparent'
                              }`}
                              style={{ width: `${staff.progressPercent}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-600 w-6 text-right">
                            {staff.progressPercent}%
                          </span>
                        </div>
                      </td>

                      {/* Detail Column (Request 1) */}
                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedStaffNip(staff.nip)}
                          className="px-2.5 py-1 rounded-md bg-sky-500 hover:bg-sky-600 text-white font-bold text-[10px] transition cursor-pointer flex items-center justify-center gap-1 mx-auto shadow-2xs"
                          title="Lihat Detail Lengkap SMT"
                        >
                          <FileText size={11} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 2: Buddy Interaction & Issue Notes */}
        {activeTab === 'BUDDY_NOTES' && (
          <div className="rounded-2xl bg-white border border-sky-100 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Catatan Interaksi & Kendala Customer (Buddy Logs)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Daftar kendala yang ditulis oleh SMT saat mendampingi customer di floor untuk evaluasi manajerial.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
                {allBuddyNotes.length} Catatan
              </span>
            </div>

            {allBuddyNotes.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p className="font-semibold text-slate-700">Belum Ada Catatan Buddy Hari Ini</p>
                <p className="text-slate-400 mt-0.5">
                  Catatan kendala yang ditulis SMT saat mendampingi akan tampil di sini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allBuddyNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-sky-50/30 transition flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1 gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-slate-900 truncate">{note.staffName}</span>
                          <span className="text-slate-400 font-mono text-[10px] shrink-0">({note.staffNip})</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[10px] shrink-0 whitespace-nowrap">{note.timeString}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 mb-2 flex-wrap">
                        <span className="px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600 font-semibold whitespace-nowrap">
                          {note.zone.replace(' ZONE', '')}
                        </span>
                        {note.customerName && (
                          <span className="text-slate-800 font-semibold truncate">
                            Customer: {note.customerName}
                          </span>
                        )}
                        {note.productInterest && (
                          <span className="text-sky-700 font-medium truncate">
                            · Minat: {note.productInterest}
                          </span>
                        )}
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-sky-100 text-xs text-slate-700 leading-relaxed">
                        <span className="font-bold text-sky-800 block text-[10px] uppercase mb-0.5">
                          Catatan / Kendala yang Dihadapi:
                        </span>
                        {note.notes ? (
                          <p className="italic text-slate-800 text-[11px]">"{note.notes}"</p>
                        ) : (
                          <p className="text-slate-400 italic text-[11px]">Tidak ada catatan kendala tertulis.</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setViewingPhoto({
                          id: note.id,
                          checklistId: 'buddy',
                          nip: note.staffNip,
                          staffName: note.staffName,
                          zone: note.zone,
                          timestamp: '',
                          timeString: note.timeString,
                          dateString: '',
                          photoUrl: note.photoUrl,
                          notes: note.notes,
                          isFromGallery: false,
                          watermarkText: ''
                        })}
                        className="text-sky-600 hover:underline font-semibold cursor-pointer text-[11px]"
                      >
                        Lihat Foto
                      </button>
                      <button
                        onClick={() => switchStaffForTesting(note.staffNip, true)}
                        className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer text-[11px]"
                      >
                        <span>Buka Lembar SMT</span>
                        <ExternalLink size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Laporan Temuan Store (Request 5) */}
        {activeTab === 'FINDINGS' && (
          <div className="rounded-2xl bg-white border border-sky-100 shadow-xs p-4 sm:p-5 space-y-4">
            
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Dashboard Temuan & Kendala Store
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                    {filteredFindings.length} Laporan
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Laporan kerusakan display, lampu mati, atau kendala fasilitas store yang dilaporkan oleh SMT di floor.
                </p>
              </div>

              {/* Status and Zone Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {/* Status Filter */}
                <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setFindingStatusFilter('ALL')}
                    className={`px-2 py-1 rounded-md font-semibold text-[11px] cursor-pointer whitespace-nowrap ${
                      findingStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setFindingStatusFilter('PENDING')}
                    className={`px-2 py-1 rounded-md font-semibold text-[11px] cursor-pointer whitespace-nowrap ${
                      findingStatusFilter === 'PENDING' ? 'bg-amber-500 text-white font-bold' : 'text-slate-500'
                    }`}
                  >
                    Perlu Tindakan
                  </button>
                  <button
                    onClick={() => setFindingStatusFilter('IN_PROGRESS')}
                    className={`px-2 py-1 rounded-md font-semibold text-[11px] cursor-pointer whitespace-nowrap ${
                      findingStatusFilter === 'IN_PROGRESS' ? 'bg-sky-500 text-white font-bold' : 'text-slate-500'
                    }`}
                  >
                    Dalam Proses
                  </button>
                  <button
                    onClick={() => setFindingStatusFilter('RESOLVED')}
                    className={`px-2 py-1 rounded-md font-semibold text-[11px] cursor-pointer whitespace-nowrap ${
                      findingStatusFilter === 'RESOLVED' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-500'
                    }`}
                  >
                    Selesai
                  </button>
                </div>

                {/* Zone Filter */}
                <select
                  value={findingZoneFilter}
                  onChange={(e) => setFindingZoneFilter(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="Semua">Semua Zona</option>
                  <option value="COMMERCIAL ZONE">Commercial Zone</option>
                  <option value="DINING ZONE">Dining Zone</option>
                  <option value="LIVING ZONE">Living Zone</option>
                  <option value="SLEEPING ZONE">Sleeping Zone</option>
                  <option value="AREA UMUM">Area Umum</option>
                </select>
              </div>
            </div>

            {/* Findings Card Grid */}
            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <AlertCircle size={28} className="mx-auto text-slate-300 mb-1" />
                <p className="font-bold text-slate-700">Tidak Ada Temuan Sesuai Filter</p>
                <p className="text-slate-400 mt-0.5">Semua area store dilaporkan dalam kondisi prima.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredFindings.map((finding) => (
                  <div
                    key={finding.id}
                    className={`rounded-2xl border bg-white p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition space-y-3 ${
                      finding.status === 'PENDING'
                        ? 'border-amber-200'
                        : finding.status === 'IN_PROGRESS'
                        ? 'border-sky-200'
                        : 'border-emerald-200'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Photo Thumbnail + Status Badge */}
                      <div className="relative h-40 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center group cursor-pointer"
                        onClick={() => setViewingFindingPhoto(finding.photoUrl)}
                      >
                        <img
                          src={finding.photoUrl}
                          alt={finding.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-md bg-white/95 text-sky-800 text-[10px] font-bold shadow-xs">
                            {finding.zone.replace(' ZONE', '')}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs ${
                            finding.status === 'PENDING'
                              ? 'bg-amber-500'
                              : finding.status === 'IN_PROGRESS'
                              ? 'bg-sky-500'
                              : 'bg-emerald-500'
                          }`}>
                            {finding.status === 'PENDING'
                              ? 'Perlu Tindakan'
                              : finding.status === 'IN_PROGRESS'
                              ? 'Dalam Proses'
                              : 'Selesai'}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs">
                          <Eye size={10} />
                          <span>Klik Lihat</span>
                        </div>
                      </div>

                      {/* Reporter Info */}
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap">
                          <span className="font-bold text-slate-800">{finding.staffName}</span>
                          <span className="text-slate-400 font-mono">({finding.nip})</span>
                          <span>·</span>
                          <span className="text-slate-400">{finding.timeString}</span>
                          <span>·</span>
                          <span className="text-slate-400">{finding.dateString}</span>
                        </div>
                      </div>

                      {/* Essay Description */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Deskripsi Temuan:</span>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                          {finding.description}
                        </p>
                      </div>

                      {/* Manager Feedback / Resolution Note */}
                      {finding.managerFeedback && (
                        <div className="p-2 rounded-xl bg-sky-50/80 border border-sky-200 text-xs text-sky-900">
                          <span className="font-bold block text-[10px] uppercase text-sky-800">
                            Tindak Lanjut Manager:
                          </span>
                          <p className="text-[11px] mt-0.5 italic text-slate-800">"{finding.managerFeedback}"</p>
                          {finding.resolvedAt && (
                            <span className="text-[9px] text-slate-500 block mt-1">Diselesaikan pada: {finding.resolvedAt}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Manager Action Row */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                      {editingFindingId === finding.id ? (
                        <div className="space-y-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <label className="block text-[10px] font-bold text-slate-700">Tulis Catatan / Tindak Lanjut:</label>
                          <input
                            type="text"
                            placeholder="Contoh: Sudah dikoordinasikan ke tim VM..."
                            value={managerNoteInput}
                            onChange={(e) => setManagerNoteInput(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => {
                                setEditingFindingId(null);
                                setManagerNoteInput('');
                              }}
                              className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-800"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => {
                                updateFindingStatus(finding.id, finding.status, managerNoteInput);
                                setEditingFindingId(null);
                                setManagerNoteInput('');
                              }}
                              className="px-2.5 py-0.5 rounded bg-sky-500 text-white text-[10px] font-bold hover:bg-sky-600"
                            >
                              Simpan Catatan
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1.5">
                          <button
                            onClick={() => {
                              setEditingFindingId(finding.id);
                              setManagerNoteInput(finding.managerFeedback || '');
                            }}
                            className="text-[11px] text-sky-600 hover:underline font-semibold cursor-pointer"
                          >
                            {finding.managerFeedback ? 'Ubah Catatan' : '+ Catatan Manager'}
                          </button>

                          <div className="flex items-center gap-1">
                            {finding.status !== 'IN_PROGRESS' && finding.status !== 'RESOLVED' && (
                              <button
                                onClick={() => updateFindingStatus(finding.id, 'IN_PROGRESS')}
                                className="px-2 py-1 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-[10px] transition cursor-pointer"
                              >
                                Proses
                              </button>
                            )}
                            {finding.status !== 'RESOLVED' && (
                              <button
                                onClick={() => updateFindingStatus(finding.id, 'RESOLVED')}
                                className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] transition cursor-pointer flex items-center gap-0.5"
                              >
                                <Check size={11} />
                                <span>Selesai</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Detail Modal for Selected Staff Member (Request 1) */}
      {selectedStaffRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-sky-50/70">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {selectedStaffRecord.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-700 border border-sky-200 uppercase tracking-wide">
                      {selectedStaffRecord.zone.replace(' ZONE', '')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {selectedStaffRecord.nip}
                    </span>
                    {selectedStaffRecord.points === maxPoints && selectedStaffRecord.points > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        👑 Top Poin
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                    {selectedStaffRecord.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => switchStaffForTesting(selectedStaffRecord.nip, true)}
                  className="px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer whitespace-nowrap"
                  title="Buka tampilan persis seperti SMT melihat aplikasinya"
                >
                  <Eye size={13} />
                  <span className="hidden sm:inline">Buka Lembar SMT</span>
                </button>
                <button
                  onClick={() => setSelectedStaffNip(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Stats Row + All Checklist Items */}
            <div className="p-4 overflow-y-auto space-y-4">
              
              {/* Quick Summary Pill Bar */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-sky-50/80 border border-sky-100">
                  <span className="text-[9px] font-extrabold text-sky-600 uppercase tracking-wider block">Total Poin</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                    {selectedStaffRecord.points}
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-100">
                  <span className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider block">Streak</span>
                  <span className="text-base sm:text-lg font-black font-mono text-slate-900">
                    {selectedStaffRecord.streakDays}{selectedStaffRecord.streakActive ? '🔥' : '⚪'}
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-100">
                  <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider block">Progress</span>
                  <span className="text-base sm:text-lg font-black font-mono text-emerald-700">
                    {selectedStaffRecord.progressPercent}%
                  </span>
                </div>
              </div>

              {/* Submissions by Category */}
              {/* 1. Selling Journey */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-sky-800 uppercase tracking-wider">
                  Selling Journey
                </h4>
                <div className="space-y-2">
                  {CHECKLIST_JOURNEY.map((item) => {
                    const subs = selectedStaffRecord.submissions[item.id] || [];
                    const isDone = subs.length > 0;
                    const latest = subs[subs.length - 1];

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border transition ${
                          isDone ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50/60 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                              isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {isDone ? <Check size={12} /> : '—'}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isDone ? `Selesai · ${latest.timeString}` : 'Belum Diisi'}
                          </span>
                        </div>

                        {/* Thumbnail & Note */}
                        {isDone && latest && (
                          <div className="flex items-start gap-3 mt-2 pt-2 border-t border-emerald-100">
                            <img
                              src={latest.photoUrl}
                              alt={item.title}
                              onClick={() => setViewingPhoto(latest)}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition shrink-0"
                              title="Klik untuk perbesar foto"
                            />
                            <div className="text-xs space-y-1 flex-1 min-w-0">
                              <p className="text-[10px] text-slate-500">
                                Diunggah via: <span className="font-semibold text-slate-700">{latest.isFromGallery ? 'Galeri HP' : 'Kamera Langsung'}</span>
                              </p>
                              {latest.notes ? (
                                <div className="p-2 rounded-lg bg-white border border-emerald-100 text-slate-700 text-[11px] leading-relaxed">
                                  <span className="font-bold text-sky-700 block text-[9px] uppercase">Catatan/Kendala:</span>
                                  <p className="italic">"{latest.notes}"</p>
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-400 italic">Tidak ada catatan.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Floor Activities: Buddy & Closing */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">
                  Buddy & Closing ({selectedStaffRecord.buddyCount}x Buddy, {selectedStaffRecord.closingCount}x Closing)
                </h4>
                
                {selectedStaffRecord.buddyCount === 0 && selectedStaffRecord.closingCount === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    Belum ada aktivitas Buddy atau Closing yang diisi hari ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {/* Buddy Submissions */}
                    {selectedStaffRecord.buddySubmissions.map((b, idx) => (
                      <div key={b.id || idx} className="p-3 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-sky-800 flex items-center gap-1">
                            <span>👥 Dampingan Buddy #{idx + 1}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{b.timeString}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <img
                            src={b.photoUrl}
                            alt="Buddy"
                            onClick={() => setViewingPhoto(b)}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition shrink-0"
                          />
                          <div className="text-xs space-y-1 flex-1 min-w-0">
                            {b.customerName && (
                              <p className="text-slate-800">
                                <span className="font-bold text-slate-600">Customer:</span> {b.customerName}
                              </p>
                            )}
                            {b.productInterest && (
                              <p className="text-slate-800">
                                <span className="font-bold text-slate-600">Minat Produk:</span> {b.productInterest}
                              </p>
                            )}
                            {b.notes && (
                              <div className="p-2 rounded-lg bg-white border border-sky-100 text-[11px] text-slate-700 italic">
                                "{b.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Closing Submissions */}
                    {(selectedStaffRecord.submissions['closing'] || []).map((c, idx) => (
                      <div key={c.id || idx} className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-emerald-800">
                            💰 Closing the Sales #{idx + 1}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{c.timeString}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <img
                            src={c.photoUrl}
                            alt="Closing"
                            onClick={() => setViewingPhoto(c)}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition shrink-0"
                          />
                          <div className="text-xs space-y-1 flex-1 min-w-0">
                            {c.nominal && (
                              <p className="font-extrabold text-emerald-700 text-sm font-mono">
                                Rp {c.nominal.toLocaleString('id-ID')}
                              </p>
                            )}
                            {c.notes && (
                              <div className="p-2 rounded-lg bg-white border border-emerald-100 text-[11px] text-slate-700 italic">
                                "{c.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Pameran */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-black text-sky-800 uppercase tracking-wider">
                  Area Pameran
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {EXHIBITION_ITEMS.map((exh) => {
                    const subs = selectedStaffRecord.submissions[exh.id] || [];
                    const isDone = subs.length > 0;
                    const latest = subs[0];

                    return (
                      <div
                        key={exh.id}
                        className={`p-2.5 rounded-2xl border text-xs ${
                          isDone ? 'bg-sky-50/60 border-sky-200' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800">{exh.title}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isDone ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isDone ? 'Selesai ✓' : 'Belum'}
                          </span>
                        </div>
                        {isDone && latest && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <img
                              src={latest.photoUrl}
                              alt={exh.title}
                              onClick={() => setViewingPhoto(latest)}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90"
                            />
                            <span className="text-[10px] text-slate-500 font-mono">{latest.timeString}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedStaffNip(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Lightbox for viewing photo submission */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-sky-100">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
              <div className="min-w-0 pr-2">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                  {viewingPhoto.checklistId.replace(/_/g, ' ').toUpperCase()}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                  {viewingPhoto.staffName} · {viewingPhoto.timeString}
                </p>
              </div>
              <button
                onClick={() => setViewingPhoto(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition cursor-pointer shrink-0"
              >
                <X size={17} />
              </button>
            </div>
            
            <div className="p-2 sm:p-3 bg-black flex items-center justify-center max-h-[62vh] overflow-hidden">
              <img
                src={viewingPhoto.photoUrl}
                alt="Foto Bukti"
                className="max-h-[58vh] w-auto object-contain rounded-lg"
              />
            </div>

            {viewingPhoto.notes && (
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-700">
                <span className="font-bold text-sky-700">Catatan: </span>
                {viewingPhoto.notes}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox for viewing store finding photo */}
      {viewingFindingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-600" />
                <span>Foto Bukti Temuan Store</span>
              </span>
              <button
                onClick={() => setViewingFindingPhoto(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={viewingFindingPhoto}
                alt="Foto Temuan Full"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const TableCheckBadge: React.FC<{ isDone: boolean }> = ({ isDone }) => {
  if (isDone) {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 shadow-2xs">
        <Check size={11} className="stroke-[3]" />
      </span>
    );
  }
  return <span className="inline-block w-2 h-2 rounded-full bg-slate-200" />;
};
