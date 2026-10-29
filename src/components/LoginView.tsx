import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, UserCheck, ChevronRight, Eye, EyeOff, Activity, ShoppingBag, Briefcase } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginStaff, loginManager } = useApp();

  const [activeTab, setActiveTab] = useState<'USER' | 'MANAGER'>('USER');

  // Staff Login Form
  const [staffNip, setStaffNip] = useState('');
  const [staffPassword, setStaffPassword] = useState('alsutjaya');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Manager Login Form
  const [managerNip, setManagerNip] = useState('');
  const [managerPassword, setManagerPassword] = useState('manageralsut');
  const [showManagerPassword, setShowManagerPassword] = useState(false);
  const [managerError, setManagerError] = useState<string | null>(null);

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);
    if (!staffNip.trim()) {
      setStaffError('Silakan masukkan NIP Anda terlebih dahulu.');
      return;
    }
    const res = loginStaff(staffNip, staffPassword);
    if (!res.success) {
      setStaffError(res.error || 'Login gagal.');
    }
  };

  const handleManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManagerError(null);
    if (!managerNip.trim()) {
      setManagerError('Silakan masukkan NIP Manajer Anda.');
      return;
    }
    const res = loginManager(managerNip, managerPassword);
    if (!res.success) {
      setManagerError(res.error || 'Login manajer gagal.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50/40 text-slate-800 flex flex-col justify-between relative overflow-hidden">
      
      {/* Decorative Soft Sky Blue Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[260px] bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col items-center justify-center">
        
        {/* Brand Header */}
        <div className="text-center w-full space-y-2.5 mb-5">
          
          {/* Location Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-sky-200 text-sky-700 text-[11px] sm:text-xs font-semibold shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shrink-0" />
            <span className="truncate">Informa Living World Alam Sutera</span>
          </div>

          {/* Single-line Ready to Sell title */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
              Ready to <span className="text-sky-600">Sell</span>
            </h1>
          </div>

          {/* Fun friendly quote */}
          <p className="text-xs sm:text-sm text-slate-600 font-medium italic max-w-md mx-auto leading-relaxed px-2">
            "Ceritakan perjalanan jualan mu disini setiap hari, karena setiap cerita kalian akan selalu kami dengar"
          </p>

          {/* Small operational indicator */}
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Activity size={13} className="text-sky-500 shrink-0" />
            <span>Sistem operasional aktif</span>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Selamat Datang di Portal Ready to Sell</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Silahkan pilih peran dan masukkan kredensial anda untuk masuk.</p>
        </div>

        {/* Dual Tab Switcher */}
        <div className="w-full bg-sky-100/70 p-1 rounded-xl border border-sky-200/70 flex gap-1 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('USER')}
            className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'USER'
                ? 'bg-white text-sky-700 shadow-xs border border-sky-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck size={15} />
            <span>Login User</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MANAGER')}
            className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'MANAGER'
                ? 'bg-white text-slate-900 shadow-xs border border-sky-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Login Manager</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white border border-sky-100 rounded-2xl p-5 sm:p-7 shadow-xl shadow-sky-100/60 relative">
          {activeTab === 'USER' ? (
            /* Portal SMT Form */
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
                    <UserCheck size={15} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Portal SMT</h3>
                    <p className="text-[11px] text-slate-400">Masukkan NIP Anda</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200 whitespace-nowrap">
                  148 SMT Terdaftar
                </span>
              </div>

              {staffError && (
                <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {staffError}
                </div>
              )}

              <form onSubmit={handleStaffSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP
                  </label>
                  <input
                    type="text"
                    placeholder="Ketik NIP anda"
                    value={staffNip}
                    onChange={(e) => setStaffNip(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showStaffPassword ? 'text' : 'password'}
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword(!showStaffPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showStaffPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <span>Masuk</span>
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition" />
                </button>
              </form>
            </div>
          ) : (
            /* Portal Manager Form */
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center">
                    <ShieldCheck size={15} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Portal Manager</h3>
                    <p className="text-[11px] text-slate-400">Masukkan NIP Anda</p>
                  </div>
                </div>
              </div>

              {managerError && (
                <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {managerError}
                </div>
              )}

              <form onSubmit={handleManagerSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP
                  </label>
                  {/* Matching font with user NIP input (no font-mono) */}
                  <input
                    type="text"
                    value={managerNip}
                    onChange={(e) => setManagerNip(e.target.value)}
                    placeholder="Ketik NIP anda"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showManagerPassword ? 'text' : 'password'}
                      value={managerPassword}
                      onChange={(e) => setManagerPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowManagerPassword(!showManagerPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showManagerPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <ShieldCheck size={16} />
                  <span>Masuk</span>
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition" />
                </button>
              </form>
            </div>
          )}
        </div>

      </div>

      {/* Clean Footer */}
      <footer className="relative z-10 py-3 border-t border-sky-100 bg-white/70 text-center text-[11px] text-slate-400">
        <p>© 2026 Informa Living World Alam Sutera · Ready to Sell</p>
      </footer>

    </div>
  );
};
