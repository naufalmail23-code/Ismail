import React, { useState, useRef, useEffect } from 'react';
import { useApp, CORE_100_PERCENT_ITEMS } from '../context/AppContext';
import { CHECKLIST_JOURNEY, EXHIBITION_ITEMS, FLOOR_ACTIVITIES, ALL_CHECKLIST_ITEMS } from '../data/checklistConfig';
import { ChecklistConfig, PhotoSubmission, ChecklistId, StoreFinding } from '../types';
import { processImageWithWatermark } from '../utils/watermark';
import {
  Clock,
  Flame,
  Award,
  CheckCircle2,
  Camera,
  Upload,
  LogOut,
  X,
  Lock,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  UserCheck,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Check,
  Users,
  BadgePercent,
  Eye,
  Smile,
  AlertCircle,
  Search,
  Plus
} from 'lucide-react';

/**
 * Checks if a step is permitted to re-access the camera after submission.
 * ONLY 'buddy', 'closing', and 'wa_blast' (follow up) are allowed.
 */
export function canReaccessStep(stepId: ChecklistId | string): boolean {
  return stepId === 'buddy' || stepId === 'closing' || stepId === 'wa_blast';
}

export const StaffPortal: React.FC = () => {
  const {
    currentStaff,
    logout,
    currentTime,
    submitChecklistPhoto,
    isManagerViewingAsStaff,
    returnToManager,
    showLoginModal,
    dismissLoginModal,
    centerAlertMessage,
    setCenterAlertMessage,
    submitStoreFinding,
    storeFindings
  } = useApp();

  // Video / Camera Stream Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const findingFileInputRef = useRef<HTMLInputElement | null>(null);

  // Camera State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Active Checklist Target for Camera (Default to the first incomplete step)
  const [activeStepId, setActiveStepId] = useState<ChecklistId>('tools_prep');
  
  // Target Step selected during Photo Review (supports switching directly to Buddy / Closing!)
  const [reviewTargetId, setReviewTargetId] = useState<ChecklistId>('tools_prep');

  // Bottom Sheet expansion state (pull up / down)
  const [isDrawerExpanded, setIsDrawerExpanded] = useState<boolean>(false);

  // Photo captured and pending review / notes
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isCapturedFromGallery, setIsCapturedFromGallery] = useState<boolean>(false);

  // Form fields for Notes / Buddy / Closing
  const [notes, setNotes] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [productInterest, setProductInterest] = useState<string>('');
  const [nominal, setNominal] = useState<string>('');

  // Store Finding Modal State (Lapor Temuan)
  const [isFindingModalOpen, setIsFindingModalOpen] = useState<boolean>(false);
  const [findingDesc, setFindingDesc] = useState<string>('');
  const [findingZone, setFindingZone] = useState<string>('LIVING ZONE');
  const [findingPhotoUrl, setFindingPhotoUrl] = useState<string | null>(null);
  const [findingIsProcessing, setFindingIsProcessing] = useState<boolean>(false);

  // Lightbox for viewing completed submission photos
  const [viewingPhoto, setViewingPhoto] = useState<PhotoSubmission | null>(null);

  if (!currentStaff) {
    return null;
  }

  // Indonesian Date & Clock
  const dateStr = currentTime.toLocaleDateString('id-ID', {
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

  // Calculate Progress based on 6 core items (5 Selling Journey steps + Buddy!)
  const completedCoreCount = CORE_100_PERCENT_ITEMS.filter(
    (id) => (currentStaff.submissions[id] || []).length > 0
  ).length;
  const progressPercent = Math.round((completedCoreCount / CORE_100_PERCENT_ITEMS.length) * 100);

  // Status Floor logic
  let statusFloor = {
    title: 'Siap siap yuk',
    colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
    dotClass: 'bg-rose-500'
  };
  if (progressPercent >= 100) {
    statusFloor = {
      title: 'Makasih ya kontribusinya',
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      dotClass: 'bg-emerald-500'
    };
  } else if (progressPercent >= 35) {
    statusFloor = {
      title: 'Progress Floor',
      colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
      dotClass: 'bg-amber-500'
    };
  }

  // Check if floor activities (Buddy & Closing) are unlocked (after dept_prep is completed)
  const isFloorActivityUnlocked = (currentStaff.submissions['dept_prep'] || []).length > 0;

  // Active step config
  const activeConfig = ALL_CHECKLIST_ITEMS.find((c) => c.id === activeStepId) || CHECKLIST_JOURNEY[0];
  const reviewConfig = ALL_CHECKLIST_ITEMS.find((c) => c.id === reviewTargetId) || activeConfig;

  // Sequential Journey Checking:
  const isJourneyUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    const prevItem = CHECKLIST_JOURNEY[index - 1];
    return (currentStaff.submissions[prevItem.id] || []).length > 0;
  };

  // Automatically select the next uncompleted step in the Selling Journey
  useEffect(() => {
    const isCurrentDoneAndLocked =
      !canReaccessStep(activeStepId) && (currentStaff.submissions[activeStepId] || []).length > 0;

    if (isCurrentDoneAndLocked || !activeStepId) {
      const nextIncomplete = CHECKLIST_JOURNEY.find(
        (item) => (currentStaff.submissions[item.id] || []).length === 0
      );
      if (nextIncomplete) {
        setActiveStepId(nextIncomplete.id);
      } else if (isFloorActivityUnlocked) {
        setActiveStepId('buddy');
      } else {
        setActiveStepId('tools_prep');
      }
    }
  }, [currentStaff.submissions, isFloorActivityUnlocked, activeStepId]);

  // Start live camera stream automatically upon login
  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        'Kamera langsung tidak dapat diakses atau izin ditolak. Pastikan izin kamera aktif pada browser.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture photo from live stream
  const handleSnapFromVideo = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    try {
      const watermarked = await processImageWithWatermark(videoRef.current, {
        nip: currentStaff.nip,
        name: currentStaff.name,
        zone: currentStaff.zone,
        itemTitle: activeConfig.title,
        timestamp: new Date(),
        extraInfo: customerName ? `Customer: ${customerName}` : undefined
      });
      setCapturedPhotoUrl(watermarked);
      setReviewTargetId(activeStepId);
      setIsCapturedFromGallery(false);
      stopCamera();
    } catch (e: any) {
      alert('Gagal mengambil foto: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload file for WA Blast or Closing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.onload = async () => {
          const watermarked = await processImageWithWatermark(img, {
            nip: currentStaff.nip,
            name: currentStaff.name,
            zone: currentStaff.zone,
            itemTitle: activeConfig.title,
            timestamp: new Date(),
            extraInfo: 'VERIFIED SCREENSHOT'
          });
          setCapturedPhotoUrl(watermarked);
          setReviewTargetId(activeStepId);
          setIsCapturedFromGallery(true);
          stopCamera();
          setIsProcessing(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Gagal memproses file: ' + err.message);
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setNotes('');
    setCustomerName('');
    setProductInterest('');
    setNominal('');
    startCamera(facingMode);
  };

  const handleConfirmSubmit = () => {
    if (!capturedPhotoUrl) return;

    submitChecklistPhoto({
      checklistId: reviewTargetId,
      photoDataUrl: capturedPhotoUrl,
      isFromGallery: isCapturedFromGallery,
      notes,
      customerName: customerName.trim() || undefined,
      productInterest: productInterest.trim() || undefined,
      nominal: nominal ? Number(nominal.replace(/\D/g, '')) : undefined
    });

    // Auto-advance sequentially:
    if (reviewTargetId === 'wa_blast') {
      setActiveStepId('dept_prep');
    } else if (reviewTargetId === 'tools_prep') {
      setActiveStepId('grooming');
    } else if (reviewTargetId === 'grooming') {
      setActiveStepId('wa_blast');
    } else if (reviewTargetId === 'dept_prep') {
      setActiveStepId('gateway');
    } else if (reviewTargetId === 'gateway') {
      setActiveStepId('buddy');
    }

    // Reset review state
    setCapturedPhotoUrl(null);
    setNotes('');
    setCustomerName('');
    setProductInterest('');
    setNominal('');
    startCamera(facingMode);
  };

  // Handle Finding Photo Upload / Snap
  const handleFindingFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFindingIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.onload = async () => {
          const watermarked = await processImageWithWatermark(img, {
            nip: currentStaff.nip,
            name: currentStaff.name,
            zone: findingZone as any,
            itemTitle: `TEMUAN: ${findingZone}`,
            timestamp: new Date(),
            extraInfo: 'TEMUAN STORE'
          });
          setFindingPhotoUrl(watermarked);
          setFindingIsProcessing(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Gagal memproses foto temuan: ' + err.message);
      setFindingIsProcessing(false);
    }
  };

  const handleSnapFindingFromCamera = async () => {
    if (!videoRef.current) return;
    setFindingIsProcessing(true);
    try {
      const watermarked = await processImageWithWatermark(videoRef.current, {
        nip: currentStaff.nip,
        name: currentStaff.name,
        zone: findingZone as any,
        itemTitle: `TEMUAN: ${findingZone}`,
        timestamp: new Date(),
        extraInfo: 'TEMUAN STORE'
      });
      setFindingPhotoUrl(watermarked);
    } catch (e: any) {
      alert('Gagal mengambil foto: ' + e.message);
    } finally {
      setFindingIsProcessing(false);
    }
  };

  const handleSubmitFindingForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!findingDesc.trim()) {
      alert('Mohon isi Deskripsi Temuan!');
      return;
    }
    if (!findingPhotoUrl) {
      alert('Mohon sertakan Foto Bukti Temuan!');
      return;
    }

    submitStoreFinding({
      title: findingDesc.trim().slice(0, 45) + (findingDesc.trim().length > 45 ? '...' : ''),
      description: findingDesc.trim(),
      photoUrl: findingPhotoUrl,
      category: 'LAINNYA',
      categoryLabel: 'Temuan Store',
      zone: findingZone
    });

    // Reset finding form
    setIsFindingModalOpen(false);
    setFindingDesc('');
    setFindingPhotoUrl(null);
  };

  const isCurrentStepLockedFromCamera =
    !canReaccessStep(activeStepId) && (currentStaff.submissions[activeStepId] || []).length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-hidden select-none">
      
      {/* Hidden file input for gallery upload (WA Blast & Closing) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Hidden file input for store finding */}
      <input
        ref={findingFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFindingFileUpload}
        className="hidden"
      />

      {/* Manager Direct Return Banner */}
      {isManagerViewingAsStaff && (
        <div className="sticky top-0 z-40 bg-sky-600 text-white px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs font-semibold shadow-md border-b border-sky-700 gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck size={14} className="text-sky-200 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">
              Mode Manajer: {currentStaff.name} ({currentStaff.nip})
            </span>
          </div>
          <button
            onClick={returnToManager}
            className="px-2 py-0.5 rounded bg-white text-sky-800 font-bold hover:bg-sky-50 transition cursor-pointer flex items-center gap-1 shrink-0 text-[10px] sm:text-[11px] shadow-xs whitespace-nowrap"
          >
            <ArrowLeft size={12} />
            <span>Portal Manager</span>
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <header className="z-30 bg-white border-b border-sky-100 px-3 sm:px-5 h-12 sm:h-13 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <UserCheck size={14} />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight whitespace-nowrap">
              Ready to Sell
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-600 border border-sky-200 shrink-0 whitespace-nowrap">
              Informa Alam Sutera
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Lapor Temuan Store Button (Logo only, no text) */}
          <button
            type="button"
            onClick={() => setIsFindingModalOpen(true)}
            className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center transition cursor-pointer shadow-2xs"
            title="Lapor Temuan Store"
          >
            <AlertCircle size={15} />
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-50/70 border border-sky-100 text-[11px] text-sky-700 font-mono whitespace-nowrap">
            <Clock size={11} className="text-sky-500" />
            <span>{timeStr}</span>
          </div>

          {isManagerViewingAsStaff ? (
            <button
              onClick={returnToManager}
              className="flex items-center gap-1 px-2 py-1 rounded bg-sky-500 text-white text-[11px] font-bold transition hover:bg-sky-600 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <ArrowLeft size={12} />
              <span>Kembali</span>
            </button>
          ) : (
            <button
              onClick={logout}
              className="flex items-center gap-1 px-2 py-1 rounded border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-[11px] font-semibold transition cursor-pointer whitespace-nowrap"
            >
              <LogOut size={12} />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </header>

      {/* Header Bio & Stats: Cerah Biru Muda & Putih */}
      <div className="z-20 bg-white border-b border-sky-100 px-3 sm:px-5 py-2.5 shadow-2xs">
        <div className="max-w-3xl mx-auto space-y-2">
          
          {/* Top Row: User Info (Left) & Enlarged Poin + Streak (Right) */}
          <div className="flex items-center justify-between gap-2.5">
            
            {/* User Bio: Full Name Displayed without Ellipsis Clipping */}
            <div className="min-w-0 flex-1 pr-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-700 border border-sky-200 uppercase tracking-wide whitespace-nowrap">
                  {currentStaff.zone.replace(' ZONE', '')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {currentStaff.nip}
                </span>
              </div>
              
              {/* Full Name Displayed */}
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug break-words mt-0.5 line-clamp-2">
                {currentStaff.name}
              </h2>
            </div>

            {/* Badges: Total Poin & Streak Dibuat Lebih Besar & Menonjol */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Total Poin Gede */}
              <div className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-1.5 shrink-0 shadow-2xs">
                <Award size={16} className="text-sky-600 shrink-0" />
                <div className="text-right">
                  <div className="text-[8px] sm:text-[9px] text-sky-600 font-extrabold uppercase leading-none">Poin</div>
                  <div className="text-sm sm:text-base font-black text-slate-900 font-mono leading-none mt-0.5">
                    {currentStaff.points}
                  </div>
                </div>
              </div>

              {/* TikTok-style Streak Gede (Mati jika belum komplit 100% hari ini) */}
              <div
                className={`px-2 sm:px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 transition shadow-2xs ${
                  currentStaff.streakActive
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
              >
                <Flame
                  size={16}
                  className={
                    currentStaff.streakActive
                      ? 'text-amber-500 fill-amber-500 animate-pulse'
                      : 'text-slate-400'
                  }
                />
                <div className="text-right">
                  <div className="text-[8px] sm:text-[9px] opacity-75 font-extrabold uppercase leading-none">Streak</div>
                  <div className="text-sm sm:text-base font-black font-mono leading-none mt-0.5">
                    {currentStaff.streakDays}{currentStaff.streakActive ? '🔥' : '⚪'}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Underneath: Progress Status Floor & Progress Bar */}
          <div className="pt-1.5 border-t border-sky-50 space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              {/* Status Floor Badge */}
              <div className={`px-2 py-0.5 rounded-md border flex items-center gap-1.5 shrink-0 ${statusFloor.colorClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusFloor.dotClass} animate-pulse shrink-0`} />
                <span className="text-[10px] sm:text-[11px] font-bold leading-none whitespace-nowrap">{statusFloor.title}</span>
              </div>

              {/* Progress Percentage */}
              <div className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-600 flex items-center gap-1">
                <span className="text-slate-400 font-sans text-[10px]">Progress:</span>
                <span className={progressPercent >= 100 ? 'text-emerald-600 font-black' : 'text-sky-700 font-black'}>
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  progressPercent >= 100
                    ? 'bg-emerald-500'
                    : progressPercent >= 40
                    ? 'bg-sky-500'
                    : 'bg-rose-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Main Scanner Section (Direct Camera Viewfinder in Bright Theme) */}
      <div className="flex-1 relative flex flex-col items-center justify-center bg-sky-50/40 p-2 sm:p-3 min-h-[340px]">
        
        {capturedPhotoUrl ? (
          /* Captured Photo Review & Immediate Option to Select Buddy / Closing */
          <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-xl border-2 border-sky-200 overflow-hidden flex flex-col max-h-[78vh]">
            
            {/* Photo preview container */}
            <div className="relative h-48 sm:h-56 bg-slate-900 flex items-center justify-center overflow-hidden">
              <img
                src={capturedPhotoUrl}
                alt="Captured Review"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                {reviewConfig.title}
              </div>
            </div>

            {/* Interactive Review Box */}
            <div className="p-3 sm:p-3.5 space-y-2.5 bg-white overflow-y-auto">
              
              {/* Direct Buddy / Closing selector right after taking photo - only shown in Buddy & Closing phase */}
              {isFloorActivityUnlocked && (reviewTargetId === 'buddy' || reviewTargetId === 'closing') && (
                <div className="bg-sky-50/80 p-2 rounded-xl border border-sky-100">
                  <div className="text-[10px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Pilih Kategori Foto Ini:</span>
                    <span className="text-[8px] text-sky-600 font-semibold">(Bisa langsung ganti)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReviewTargetId('buddy')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        reviewTargetId === 'buddy'
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-sky-50'
                      }`}
                    >
                      <Users size={13} />
                      <span>👥 Buddy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewTargetId('closing')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        reviewTargetId === 'closing'
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-sky-50'
                      }`}
                    >
                      <BadgePercent size={13} />
                      <span>💰 Closing</span>
                    </button>
                  </div>
                </div>
              )}

              {/* If Buddy Customer: Customer Name & Product Interest */}
              {reviewTargetId === 'buddy' && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-700 font-semibold mb-0.5">Nama Customer</label>
                    <input
                      type="text"
                      placeholder="Bpk / Ibu..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-700 font-semibold mb-0.5">Produk Diminati</label>
                    <input
                      type="text"
                      placeholder="Sofa, Meja..."
                      value={productInterest}
                      onChange={(e) => setProductInterest(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* If Closing Sales: Nominal Only (Nomor SPK Removed) */}
              {reviewTargetId === 'closing' && (
                <div className="text-xs">
                  <label className="block text-[10px] text-slate-700 font-semibold mb-0.5">Nominal Transaksi (Rp)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 15.000.000"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>
              )}

              {/* Kotak Catatan / Keterangan */}
              <div>
                <label className="block text-[10px] text-slate-700 font-semibold mb-0.5">
                  Catatan/Kendala
                </label>
                <input
                  type="text"
                  placeholder="Ketik catatan aktivitas atau kendala..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer whitespace-nowrap"
                >
                  Foto Ulang
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isProcessing}
                  className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Check size={15} />
                  <span>Kirim & Simpan</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Live Stream Scanner View Inside Framed Viewport */
          <div className="relative w-full max-w-sm sm:max-w-md aspect-[3/4] sm:aspect-[4/5] max-h-[54vh] sm:max-h-[60vh] bg-black rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-sky-200 flex items-center justify-center">
            
            {/* Live Camera Viewfinder */}
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* QRIS-Style Scanner Framing Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-3 sm:p-4">
              
              {/* Top Banner: Active Step Indicator */}
              <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-sky-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 tracking-wide">
                  Tahap: <span className="text-sky-600 font-extrabold">{activeConfig.title}</span>
                </span>
              </div>

              {/* Center Framing Corner Brackets */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 border border-white/20 rounded-2xl flex items-center justify-center">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-sky-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-sky-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-sky-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-sky-400 rounded-br-lg" />
                
                {/* Informa watermark preview HUD */}
                <div className="text-center space-y-0.5 opacity-70">
                  <div className="text-[8px] sm:text-[9px] font-black text-sky-300 drop-shadow-sm">INFORMA ALAM SUTERA</div>
                  <div className="text-[7px] sm:text-[8px] text-white font-mono drop-shadow-sm">{timeStr}</div>
                </div>
              </div>

              {/* Shutter & Quick Switch Controls Area */}
              <div className="pointer-events-auto w-full max-w-sm flex flex-col items-center gap-1.5 pb-1">
                
                {/* Quick Floor Switch (Buddy / Closing) right in camera without drawer - only shown in Buddy & Closing phase */}
                {isFloorActivityUnlocked && (activeStepId === 'buddy' || activeStepId === 'closing') && (
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-0.5 rounded-full border border-white/20">
                    <button
                      type="button"
                      onClick={() => setActiveStepId('buddy')}
                      className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold transition cursor-pointer ${
                        activeStepId === 'buddy'
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'text-white hover:text-sky-300'
                      }`}
                    >
                      👥 Buddy
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStepId('closing')}
                      className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold transition cursor-pointer ${
                        activeStepId === 'closing'
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'text-white hover:text-sky-300'
                      }`}
                    >
                      💰 Closing
                    </button>
                  </div>
                )}

                <div className="w-full flex items-center justify-around">
                  {/* Flip Camera Button */}
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center border border-slate-200 transition cursor-pointer shadow-md"
                    title="Balik Kamera Depan / Belakang"
                  >
                    <RefreshCw size={15} />
                  </button>

                  {/* Big QRIS Shutter Button */}
                  {isCurrentStepLockedFromCamera ? (
                    <div className="px-3 py-1.5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold border border-slate-700 flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>Sudah Selesai</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSnapFromVideo}
                      disabled={isProcessing}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-4 border-sky-500 hover:scale-105 active:scale-95 transition flex items-center justify-center cursor-pointer shadow-xl shadow-sky-500/25"
                      title="Ambil Foto Sekarang"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sky-500 flex items-center justify-center text-white">
                        <Camera size={20} />
                      </div>
                    </button>
                  )}

                  {/* Gallery Button: ONLY available for WA Blast & Closing */}
                  {activeConfig.allowsGallery ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center border border-emerald-400 transition cursor-pointer shadow-md"
                      title="Upload Screenshot dari Galeri"
                    >
                      <Upload size={15} />
                    </button>
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10" />
                  )}
                </div>

              </div>
            </div>

            {/* Error notice if camera denied */}
            {cameraError && (
              <div className="absolute bottom-20 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] text-center max-w-xs shadow-lg">
                {cameraError}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Pull-Up Bottom Sheet / Drawer: Bright Theme */}
      <div
        className={`z-30 bg-white border-t border-sky-100 transition-all duration-300 flex flex-col shadow-lg ${
          isDrawerExpanded ? 'h-[64vh]' : 'h-22 sm:h-24'
        }`}
      >
        {/* Pull Bar / Drag Handle Header */}
        <div
          onClick={() => setIsDrawerExpanded(!isDrawerExpanded)}
          className="py-1.5 sm:py-2 px-3 sm:px-4 flex items-center justify-between cursor-pointer hover:bg-sky-50/50 border-b border-sky-100"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-1 bg-slate-300 rounded-full mx-auto" />
            <span className="text-[11px] sm:text-xs font-extrabold text-slate-800">
              {isDrawerExpanded ? 'Tutup Daftar Checklist' : 'Tarik ke Atas: Daftar Checklist'}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
              {completedCoreCount}/6 Selesai
            </span>
          </div>
          
          <button className="text-slate-500 hover:text-slate-800">
            {isDrawerExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {/* Horizontal Quick-Scroll Steps Preview (When Drawer is minimized) */}
        {!isDrawerExpanded ? (
          <div className="flex-1 px-3 py-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {CHECKLIST_JOURNEY.map((item, idx) => {
              const subs = currentStaff.submissions[item.id] || [];
              const isDone = subs.length > 0;
              const isUnlocked = isJourneyUnlocked(idx);
              const isCurrent = activeStepId === item.id;
              const canReaccess = canReaccessStep(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isDone && !canReaccess) {
                      setViewingPhoto(subs[0]);
                    } else if (isUnlocked) {
                      setActiveStepId(item.id);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-sky-500 text-white border-sky-400 ring-2 ring-sky-300/40 shadow-xs'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isUnlocked
                      ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                      : 'bg-slate-50/50 text-slate-400 border-slate-100 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 size={12} className="text-emerald-600" />
                  ) : (
                    <span>{idx + 1}.</span>
                  )}
                  <span>{item.title}</span>
                  {isDone && !canReaccess && (
                    <Eye size={11} className="text-emerald-600 opacity-70 ml-0.5" />
                  )}
                </button>
              );
            })}

            {/* Quick Buddy Pill */}
            {isFloorActivityUnlocked && (
              <button
                onClick={() => setActiveStepId('buddy')}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition shrink-0 cursor-pointer ${
                  activeStepId === 'buddy'
                    ? 'bg-sky-500 text-white border-sky-400 shadow-xs'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/60'
                }`}
              >
                <span>Buddy ({currentStaff.submissions['buddy']?.length || 0}x)</span>
              </button>
            )}

            {/* Quick Closing Pill */}
            {isFloorActivityUnlocked && (
              <button
                onClick={() => setActiveStepId('closing')}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition shrink-0 cursor-pointer ${
                  activeStepId === 'closing'
                    ? 'bg-sky-500 text-white border-sky-400 shadow-xs'
                    : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100/60'
                }`}
              >
                <span>Closing ({currentStaff.submissions['closing']?.length || 0}x)</span>
              </button>
            )}

            {/* Lapor Temuan Card Button in Quick Scroll */}
            <button
              onClick={() => setIsFindingModalOpen(true)}
              className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition shrink-0 cursor-pointer"
            >
              <AlertCircle size={12} className="text-amber-600" />
              <span>Lapor Temuan</span>
            </button>
          </div>
        ) : (
          /* Full Expanded Drawer Content */
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            
            {/* Lapor Temuan Button in Drawer (No description, just Lapor Temuan) */}
            <button
              type="button"
              onClick={() => {
                setIsDrawerExpanded(false);
                setIsFindingModalOpen(true);
              }}
              className="w-full py-2.5 px-3.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition flex items-center justify-between shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-600 shrink-0" />
                <span>Lapor Temuan</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                Buka &rarr;
              </span>
            </button>

            {/* 1. Selling Journey Steps */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
                <h4 className="text-[11px] sm:text-xs font-extrabold text-sky-700 uppercase tracking-wide">
                  Selling Journey
                </h4>
                <span className="text-[9px] font-bold text-slate-400">Pilih untuk aktifkan kamera</span>
              </div>

              <div className="space-y-1.5">
                {CHECKLIST_JOURNEY.map((item, idx) => {
                  const subs = currentStaff.submissions[item.id] || [];
                  const isDone = subs.length > 0;
                  const isUnlocked = isJourneyUnlocked(idx);
                  const isCurrent = activeStepId === item.id;
                  const latestSub = subs[subs.length - 1];
                  const canReaccess = canReaccessStep(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isDone && !canReaccess) {
                          setViewingPhoto(latestSub);
                        } else if (isUnlocked) {
                          setActiveStepId(item.id);
                          setIsDrawerExpanded(false);
                        }
                      }}
                      className={`p-2 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                        isCurrent
                          ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300/40 shadow-xs'
                          : isDone
                          ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50'
                          : isUnlocked
                          ? 'bg-slate-50 border-slate-200 hover:bg-sky-50/60'
                          : 'bg-slate-50/40 border-slate-100 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md font-bold text-[10px] flex items-center justify-center shrink-0 ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : isUnlocked
                              ? 'bg-sky-500 text-white'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isDone ? <Check size={12} /> : idx + 1}
                        </div>

                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-900 text-xs truncate">{item.title}</h5>
                          {isDone && latestSub && (
                            <p className="text-[9px] text-emerald-700 flex items-center gap-1 mt-0.5">
                              <span>Selesai · {latestSub.timeString}</span>
                              <span className="text-sky-600 font-semibold ml-1">(Lihat Foto)</span>
                            </p>
                          )}
                          {!isUnlocked && (
                            <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Lock size={9} />
                              <span>Selesaikan step sebelumnya</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500 text-white shadow-2xs">
                            Aktif
                          </span>
                        ) : isDone && !canReaccess ? (
                          <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                            <span>Tuntas ✓</span>
                          </span>
                        ) : isDone && canReaccess ? (
                          <span className="text-[9px] font-semibold text-sky-700 bg-sky-100/60 px-1.5 py-0.5 rounded border border-sky-200">
                            Tambah Lagi +
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-[9px] text-sky-600 font-bold">Pilih</span>
                        ) : (
                          <Lock size={12} className="text-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Floor Activities: Buddy & Closing */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
                <h4 className="text-[11px] sm:text-xs font-extrabold text-amber-700 uppercase tracking-wide">
                  Buddy & Closing
                </h4>
                <span className="text-[9px] font-bold text-slate-400">Terbuka setelah Progress Dept</span>
              </div>

              {!isFloorActivityUnlocked ? (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-[11px] text-slate-500">
                  Selesaikan <strong>Progress Departemen</strong> untuk membuka Buddy & Closing.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {FLOOR_ACTIVITIES.map((act) => {
                    const subs = currentStaff.submissions[act.id] || [];
                    const isCurrent = activeStepId === act.id;

                    return (
                      <div
                        key={act.id}
                        onClick={() => {
                          setActiveStepId(act.id);
                          setIsDrawerExpanded(false);
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300/40 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-sky-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-extrabold text-slate-900 text-xs">{act.title}</h5>
                          <span className="text-[9px] text-sky-700 font-mono font-bold bg-sky-100 px-1 py-0.2 rounded">
                            {subs.length}x
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500">
                          {act.allowsGallery ? 'Bisa Galeri/Kamera' : 'Wajib Kamera'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Area Pameran */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
                <h4 className="text-[11px] sm:text-xs font-extrabold text-sky-700 uppercase tracking-wide">
                  Area Pameran
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {EXHIBITION_ITEMS.map((exh) => {
                  const subs = currentStaff.submissions[exh.id] || [];
                  const isDone = subs.length > 0;
                  const isCurrent = activeStepId === exh.id;

                  return (
                    <button
                      key={exh.id}
                      onClick={() => {
                        if (isDone) {
                          setViewingPhoto(subs[0]);
                        } else {
                          setActiveStepId(exh.id);
                          setIsDrawerExpanded(false);
                        }
                      }}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        isCurrent
                          ? 'bg-sky-50 border-sky-500 shadow-xs ring-2 ring-sky-300/40'
                          : isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-sky-50/50'
                      }`}
                    >
                      <div className="text-[10px] font-bold truncate">{exh.title}</div>
                      <div className="text-[8px] mt-0.5 text-slate-500">
                        {isDone ? 'Selesai ✓ (Lihat)' : 'Update'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Center Screen Pop-Up Modal: Ucapan Semangat Beraktivitas Pas User Login */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white border-2 border-sky-400 rounded-3xl p-5 sm:p-6 max-w-sm w-full text-center shadow-2xl space-y-3 relative">
            <div className="w-13 h-13 mx-auto rounded-full bg-sky-50 text-sky-500 border border-sky-200 flex items-center justify-center animate-bounce">
              <Sparkles size={26} />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 inline-block">
                Informa Alam Sutera
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight pt-1">
                Halo, {currentStaff.name}!
              </h3>
            </div>

            <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-100 text-slate-700 text-xs sm:text-sm leading-relaxed font-semibold">
              <p className="text-sky-700 font-bold mb-1">
                Semangat beraktivitas di Informa Alam Sutera!
              </p>
              <p className="text-slate-600 font-normal text-[11px] leading-relaxed">
                Ceritakan perjalanan jualan mu disini setiap hari, karena setiap cerita kalian akan selalu kami dengar.
              </p>
            </div>

            <button
              onClick={dismissLoginModal}
              className="mt-2 w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md shadow-sky-500/20"
            >
              Mulai
            </button>
          </div>
        </div>
      )}

      {/* Center Screen Alert Modal (After EVERY Checklist Submission & Grooming Compliment) */}
      {centerAlertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white border-2 border-sky-400 rounded-3xl p-5 sm:p-6 max-w-sm w-full text-center shadow-2xl space-y-3 relative">
            <div className="w-13 h-13 mx-auto rounded-full bg-sky-50 text-sky-500 border border-sky-200 flex items-center justify-center animate-bounce">
              <Smile size={26} />
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Terima Kasih!
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
              {centerAlertMessage}
            </p>

            <button
              onClick={() => setCenterAlertMessage(null)}
              className="mt-2 w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md shadow-sky-500/20"
            >
              Lanjutkan Aktivitas
            </button>
          </div>
        </div>
      )}

      {/* Store Finding Modal (Lapor Temuan Store) */}
      {isFindingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Lapor Temuan</h4>
                </div>
              </div>
              <button
                onClick={() => setIsFindingModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form: Cukup Zona & Deskripsi Temuan Saja */}
            <form onSubmit={handleSubmitFindingForm} className="p-4 overflow-y-auto space-y-3.5 text-xs">
              
              {/* Zona / Area Toko */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Zona / Area Toko *</label>
                <select
                  value={findingZone}
                  onChange={(e) => setFindingZone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-sky-500 text-xs"
                >
                  <option value="COMMERCIAL ZONE">Commercial Zone</option>
                  <option value="DINING ZONE">Dining Zone</option>
                  <option value="LIVING ZONE">Living Zone</option>
                  <option value="SLEEPING ZONE">Sleeping Zone</option>
                  <option value="AREA UMUM">Area Umum / Lorong / Kasir</option>
                </select>
              </div>

              {/* Deskripsi Temuan */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Deskripsi Temuan *</label>
                <textarea
                  placeholder="Ceritakan temuan atau kendala yang Anda temukan di toko secara lengkap..."
                  rows={4}
                  value={findingDesc}
                  onChange={(e) => setFindingDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-sky-500 leading-relaxed text-xs"
                  required
                />
              </div>

              {/* Photo Upload / Capture */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Foto Bukti Temuan *</label>
                {findingPhotoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black max-h-40 flex items-center justify-center">
                    <img src={findingPhotoUrl} alt="Foto Temuan" className="max-h-40 w-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => setFindingPhotoUrl(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleSnapFindingFromCamera}
                      disabled={findingIsProcessing}
                      className="py-2.5 px-3 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera size={15} className="text-sky-600" />
                      <span>Jepret Kamera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => findingFileInputRef.current?.click()}
                      disabled={findingIsProcessing}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload size={15} />
                      <span>Dari Galeri</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={findingIsProcessing}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check size={16} />
                  <span>Kirim & Simpan</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Lightbox for viewing completed photo submission */}
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

    </div>
  );
};
