import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Upload, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { ChecklistConfig, Zone } from '../types';
import { processImageWithWatermark } from '../utils/watermark';

interface CameraCaptureModalProps {
  config: ChecklistConfig;
  staffNip: string;
  staffName: string;
  staffZone: Zone;
  onClose: () => void;
  onSubmit: (params: {
    checklistId: any;
    photoDataUrl: string;
    isFromGallery: boolean;
    notes?: string;
    customerName?: string;
    productInterest?: string;
    spkNumber?: string;
    nominal?: number;
  }) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  config,
  staffNip,
  staffName,
  staffZone,
  onClose,
  onSubmit
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Form fields for Buddy or Closing
  const [customerName, setCustomerName] = useState('');
  const [productInterest, setProductInterest] = useState('');
  const [spkNumber, setSpkNumber] = useState('');
  const [nominal, setNominal] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Live HUD clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) + ' ' +
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
      console.warn('Camera access error:', err);
      setCameraError(
        'Kamera langsung tidak dapat diakses atau izin ditolak. Anda dapat menggunakan tombol shutter di bawah.'
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
    if (!config.allowsGallery) {
      startCamera(facingMode);
    }
    return () => {
      stopCamera();
    };
  }, [config.allowsGallery, facingMode]);

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleCaptureFromVideo = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    try {
      const watermarked = await processImageWithWatermark(videoRef.current, {
        nip: staffNip,
        name: staffName,
        zone: staffZone,
        itemTitle: config.title,
        timestamp: new Date(),
        extraInfo: customerName ? `Customer: ${customerName}` : undefined
      });
      setCapturedPreview(watermarked);
      stopCamera();
    } catch (e: any) {
      alert('Gagal mengambil foto: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

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
            nip: staffNip,
            name: staffName,
            zone: staffZone,
            itemTitle: config.title,
            timestamp: new Date(),
            extraInfo: config.allowsGallery ? 'VERIFIED ATTACHMENT' : customerName ? `Cust: ${customerName}` : undefined
          });
          setCapturedPreview(watermarked);
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
    setCapturedPreview(null);
    if (!config.allowsGallery) {
      startCamera(facingMode);
    }
  };

  const handleFinalSubmit = () => {
    if (!capturedPreview) return;

    if (config.id === 'closing' && !spkNumber.trim()) {
      alert('Mohon isi Nomor SPK / Bukti Transaksi!');
      return;
    }

    onSubmit({
      checklistId: config.id,
      photoDataUrl: capturedPreview,
      isFromGallery: config.allowsGallery,
      notes,
      customerName: customerName.trim() || undefined,
      productInterest: productInterest.trim() || undefined,
      spkNumber: spkNumber.trim() || undefined,
      nominal: nominal ? Number(nominal.replace(/\D/g, '')) : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-2xs">
      <div className="bg-white border border-sky-100 rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Simple Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-sky-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">{config.title}</h3>
            {config.allowsGallery ? (
              <span className="text-[11px] text-emerald-700 font-semibold">Galeri & Kamera Diizinkan</span>
            ) : (
              <span className="text-[11px] text-sky-700 font-semibold">Kamera Langsung Only</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          
          {/* Inputs for Buddy */}
          {config.id === 'buddy' && (
            <div className="space-y-2.5 bg-sky-50/50 p-3 rounded-xl border border-sky-100 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Customer</label>
                <input
                  type="text"
                  placeholder="Contoh: Bpk. Budi & Ibu Siska"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Produk Diminati</label>
                <input
                  type="text"
                  placeholder="Contoh: Sofa Living, Meja Makan"
                  value={productInterest}
                  onChange={(e) => setProductInterest(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* Inputs for Closing */}
          {config.id === 'closing' && (
            <div className="space-y-2.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor SPK *</label>
                <input
                  type="text"
                  placeholder="SPK-ALSUT-XXXX"
                  value={spkNumber}
                  onChange={(e) => setSpkNumber(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Estimasi Nominal (Rp)</label>
                <input
                  type="text"
                  placeholder="Contoh: 15.000.000"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* Camera / Preview Box */}
          <div className="relative aspect-4/3 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {capturedPreview ? (
              <div className="relative w-full h-full">
                <img
                  src={capturedPreview}
                  alt="Captured"
                  className="w-full h-full object-contain bg-black"
                />
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                  <CheckCircle2 size={13} /> Terverifikasi
                </div>
              </div>
            ) : cameraActive ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* HUD Live timestamp */}
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-slate-950/90 to-transparent text-[11px] text-white">
                  <div className="text-sky-400 font-bold">{config.title}</div>
                  <div className="text-slate-300 font-mono text-[10px]">{currentTimeStr}</div>
                </div>

                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
                  title="Ganti Kamera"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            ) : (
              <div className="p-4 text-center space-y-2 text-slate-400">
                <Camera className="mx-auto text-sky-400" size={36} />
                <p className="text-xs text-white font-medium">
                  {config.allowsGallery ? 'Upload dari Galeri / Kamera' : 'Buka Kamera Perangkat'}
                </p>
                {cameraError && (
                  <p className="text-[11px] text-amber-300 max-w-xs mx-auto">{cameraError}</p>
                )}
              </div>
            )}
          </div>

          {/* Optional Note */}
          <div>
            <input
              type="text"
              placeholder="Catatan singkat (opsional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2.5">
          {capturedPreview ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
              >
                Ulang
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isProcessing}
                className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>Simpan Foto</span>
              </button>
            </>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture={config.allowsGallery ? undefined : 'environment'}
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>

              {cameraActive ? (
                <button
                  type="button"
                  onClick={handleCaptureFromVideo}
                  disabled={isProcessing}
                  className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera size={15} />
                  <span>{isProcessing ? 'Memproses...' : 'Ambil Foto'}</span>
                </button>
              ) : config.allowsGallery ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload size={15} />
                  <span>Pilih dari Galeri / Kamera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera size={15} />
                  <span>Ambil Foto Langsung</span>
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
