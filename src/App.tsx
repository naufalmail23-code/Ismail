/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './components/LoginView';
import { StaffPortal } from './components/StaffPortal';
import { ManagerDashboard } from './components/ManagerDashboard';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUserType, toastMessage, clearToast } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dynamic View Switcher */}
      {currentUserType === 'GUEST' && <LoginView />}
      {currentUserType === 'STAFF' && <StaffPortal />}
      {currentUserType === 'MANAGER' && <ManagerDashboard />}

      {/* Global Notification Toast (Only for Manager Dashboard) */}
      {toastMessage && currentUserType === 'MANAGER' && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md max-w-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
                : toastMessage.type === 'error'
                ? 'bg-red-950/90 border-red-500/40 text-red-100'
                : 'bg-slate-900/90 border-slate-700 text-slate-100'
            }`}
          >
            {toastMessage.type === 'success' && (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            )}
            {toastMessage.type === 'error' && (
              <AlertCircle size={18} className="text-red-400 shrink-0" />
            )}
            {toastMessage.type === 'info' && (
              <Info size={18} className="text-orange-400 shrink-0" />
            )}
            <p className="text-xs sm:text-sm font-medium">{toastMessage.text}</p>
            <button
              onClick={clearToast}
              className="p-1 text-slate-400 hover:text-white transition shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
