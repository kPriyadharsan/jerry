import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ToggleLeft, ToggleRight, ShieldAlert, Monitor, Bell, Database } from 'lucide-react';

export default function Settings() {
  const { examMode, toggleExamMode } = useAppStore();

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto relative z-0">
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-green-core/5 rounded-[60%_40%_55%_45%/45%_55%_40%_60%] blur-[120px] animate-blob pointer-events-none -z-10" />
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-text-primary">
            System Preferences
          </h1>

          <p className="text-text-muted mt-2">Configure Jerry AI and modify data access points.</p>
        </div>

        <div className="bg-bg-glass backdrop-blur-md rounded-lg border border-green-core/20 shadow-card overflow-hidden divide-y divide-green-core/10">
          
          {/* Exam Mode Toggle */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <ShieldAlert className={examMode ? 'text-red-500' : 'text-text-muted'} size={24} />
                Strict Exam Mode
              </h3>
              <p className="text-text-secondary mt-1 max-w-xl text-sm leading-relaxed">
                When enabled, Jerry will block access to entertainment sites, disable non-technical chat features, and enforce Pomodoro intervals mapped to your test durations.
              </p>
            </div>
            <button 
              onClick={toggleExamMode}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-pill font-semibold transition-all duration-200 min-w-[140px] justify-center ${
                examMode 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)]' 
                  : 'bg-bg-secondary hover:bg-green-subtle text-text-secondary border border-green-core/20'
              }`}
            >
              {examMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              {examMode ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-50 cursor-not-allowed">
            <div>
              <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <Monitor className="text-text-muted" size={24} />
                Appearance
              </h3>
              <p className="text-text-secondary mt-1 max-w-xl text-sm leading-relaxed">
                Toggle between light and dark themes (currently locked to deep focus mode).
              </p>
            </div>
            <button disabled className="px-6 py-2.5 rounded-pill bg-bg-secondary border border-green-core/10 text-text-muted font-semibold">Dark Mode</button>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-50 cursor-not-allowed">
            <div>
              <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <Database className="text-text-muted" size={24} />
                Data Syncing
              </h3>
              <p className="text-text-secondary mt-1 max-w-xl text-sm leading-relaxed">
                Manage backend database connections for saving task progress and analytics to MongoDB.
              </p>
            </div>
            <button disabled className="px-6 py-2.5 rounded-pill bg-bg-secondary border border-green-core/10 text-text-muted font-semibold">Configure API</button>
          </div>

        </div>
      </div>
    </div>
  );
}
