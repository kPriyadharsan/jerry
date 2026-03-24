import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Mic2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSessionHistory from '../hooks/useSessionHistory';
import useAudioRecorder from '../hooks/useAudioRecorder';
import api, { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/useAppStore';

const MOCK_AI_RESPONSE = {
  fluency: 84,
  clarity: 80,
  vocabulary: 72,
  grammar: 82,
  overall: 80,
};

export default function EnglishPracticeMini() {
  const { getLastSession, getLatestSession, calculateDeltas, addSession } = useSessionHistory();
  const { user } = useAuthStore();
  const { fetchDashboardData } = useAppStore();
  const [currentScore, setCurrentScore] = useState(null);

  const handleAudioReadyRef = useRef(null);

  const { recorderState, setRecorderState, startRecording, stopRecording } = useAudioRecorder((blob, mimeType) => {
    if (handleAudioReadyRef.current) handleAudioReadyRef.current(blob, mimeType);
  });

  const handleAudioReady = useCallback(async (blob, mimeType) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        try {
          const res = await api.post('/english/analyze', { 
            audioData: base64data,
            mimeType: mimeType || 'audio/webm'
          });
          setCurrentScore(res.data);
          addSession(res.data);
          setRecorderState('results');
          fetchDashboardData();
        } catch (error) {
          console.error("API error", error);
          setRecorderState('idle'); 
        }
      };
    } catch (e) {
      console.error(e);
      setRecorderState('idle');
    }
  }, [addSession, setRecorderState]);

  useEffect(() => {
    handleAudioReadyRef.current = handleAudioReady;
  }, [handleAudioReady]);

  const initialLastSession = useMemo(() => getLatestSession(), [getLatestSession]);

  const displayScore = currentScore || initialLastSession;
  const delta = currentScore 
    ? calculateDeltas(currentScore).overall 
    : (initialLastSession ? initialLastSession.overall - (getLastSession()?.overall || 0) : 0);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-4 flex flex-col justify-between" style={{ minHeight: '170px' }}>
      
      {/* Top Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[var(--text-primary)] font-medium text-[14px]">
          <Mic2 size={16} />
          <span>English Practice</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] px-2.5 py-1 rounded-[var(--radius-sm)]">
          <span className="text-[12px]">🔥 {user?.streak || 0} days</span>
        </div>
      </div>

      {/* Middle Row */}
      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-4">
          
          <div className="relative">
            {/* Context Rings */}
            {recorderState === 'idle' && (
              <div className="absolute inset-0 bg-[var(--accent-soft)] rounded-full animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
            )}
            
            {recorderState === 'idle' && (
              <button 
                onClick={startRecording}
                aria-label="Start mini recording"
                className="w-[36px] h-[36px] rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center relative hover:scale-[1.05] transition-transform"
              >
                <Mic size={16} />
              </button>
            )}

            {recorderState === 'recording' && (
              <button 
                onClick={stopRecording}
                aria-label="Stop mini recording"
                className="w-[36px] h-[36px] rounded-full bg-[var(--danger)] text-white flex items-center justify-center relative scale-[1.05] shadow-[0_2px_8px_rgba(255,59,48,0.3)] transition-transform"
              >
                <div className="absolute inset-[-4px] border border-[var(--accent)] rounded-full animate-ping" style={{ animationDuration: '1s' }} />
                <Square fill="currentColor" size={14} />
              </button>
            )}

            {recorderState === 'processing' && (
              <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                <Loader2 size={18} className="animate-spin" />
              </div>
            )}
            
            {recorderState === 'results' && (
              <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center bg-[var(--text-primary)] text-[var(--accent)]">
                <Mic size={16} />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            {recorderState === 'idle' && !currentScore && (
              <span className="text-[13px] font-medium text-[var(--text-primary)]">Record</span>
            )}
            {recorderState === 'recording' && (
              <span className="text-[13px] font-medium text-[var(--danger)] animate-pulse">Listening...</span>
            )}
            {recorderState === 'processing' && (
              <span className="text-[13px] font-medium text-[var(--text-secondary)]">Analysing...</span>
            )}
            {recorderState === 'results' && (
              <span className="text-[13px] font-medium text-[var(--accent)]">Analysis Complete</span>
            )}
          </div>

        </div>

        {/* Score Display */}
        {recorderState !== 'recording' && recorderState !== 'processing' && displayScore && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                {currentScore ? 'Overall' : 'Last'}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-[18px] text-[var(--text-primary)] leading-none">{displayScore.overall}</span>
                <span className="font-mono text-[12px] text-[var(--text-muted)]">/100</span>
              </div>
            </div>
            {delta !== 0 && (
              <span className={`font-mono text-[12px] font-bold ${delta > 0 ? 'text-[var(--accent)]' : 'text-[var(--danger)]'}`}>
                {delta > 0 ? `↑ +${delta}` : `↓ ${delta}`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div className="mt-4 border-t border-[var(--border)] pt-3">
        <Link 
          to="/english-practice" 
          className="text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1 group"
        >
          <span className="group-hover:translate-x-1 transition-transform">→</span>
          Go to Full Practice
          <span className="ml-[1px] opacity-70">↗</span>
        </Link>
      </div>

    </div>
  );
}
