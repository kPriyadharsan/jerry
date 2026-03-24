import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import useAudioRecorder from '../hooks/useAudioRecorder';
import useSessionHistory from '../hooks/useSessionHistory';
import ScoreCard from '../components/ScoreCard';
import { Mic, Square, Play, Pause, Loader2, RotateCcw, Volume2, Music2 } from 'lucide-react';
import api from '../store/authStore';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/useAppStore';

/* ─── Animated Waveform Bars (music-player style) ─── */
function WaveformBars({ isPlaying, barCount = 36 }) {
  return (
    <div
      className="flex items-end gap-[3px]"
      style={{ height: 48 }}
      aria-hidden="true"
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const delay = (i * 0.045).toFixed(3);
        const baseH = 18 + Math.sin(i * 0.6) * 10;
        return (
          <div
            key={i}
            style={{
              width: 3,
              height: isPlaying ? undefined : baseH,
              minHeight: 4,
              maxHeight: 44,
              background: 'var(--accent)',
              borderRadius: 99,
              animation: isPlaying
                ? `vpBeat 0.9s ease-in-out ${delay}s infinite alternate`
                : 'none',
              opacity: isPlaying ? 1 : 0.35,
              transition: 'opacity 0.4s',
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Recording Orb with live waveform ─── */
function RecordOrb({ analyserRef, isRecording }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 300 * dpr;
    canvas.height = 300 * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const analyser = analyserRef.current;
      let amplitude = 0;
      if (analyser && isRecording) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < 24; i++) sum += data[i];
        amplitude = sum / 24 / 255;
      }

      ctx.clearRect(0, 0, 300, 300);
      const cx = 150, cy = 150;
      phaseRef.current += 0.04 + amplitude * 0.08;

      const drawLayer = (offset, opacity, radiusScale, speed) => {
        ctx.beginPath();
        const pts = 90;
        const radius = 65 + amplitude * 38 * radiusScale;
        for (let i = 0; i <= pts; i++) {
          const a = (i / pts) * Math.PI * 2;
          const wave = Math.sin(a * 5 + phaseRef.current * speed + offset) * (8 + amplitude * 28);
          const r = radius + wave;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(0, 200, 83, ${opacity})`;
        ctx.lineWidth = 1.8 + amplitude * 2.5;
        ctx.shadowBlur = opacity > 0.5 ? 14 * amplitude : 0;
        ctx.shadowColor = 'rgba(0,200,83,0.5)';
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      if (isRecording) {
        drawLayer(0, 0.85, 1, 1);
        drawLayer(Math.PI * 0.5, 0.4, 0.85, -1.1);
        drawLayer(Math.PI, 0.18, 1.15, 0.75);
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, 65, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,200,83,0.18)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    draw();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [analyserRef, isRecording]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 300, height: 300 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    />
  );
}

/* ─── Music Player ─── */
function MusicPlayer({ audioUrl, onPlayChange }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); if (onPlayChange) onPlayChange(false); };
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => {
      // duration can be Infinity for streams; fall back to 0
      const d = isFinite(audio.duration) ? audio.duration : 0;
      setDuration(d);
    };
    const onErr = () => { setIsPlaying(false); if (onPlayChange) onPlayChange(false); };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('durationchange', onMeta);
    audio.addEventListener('error', onErr);

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('durationchange', onMeta);
      audio.removeEventListener('error', onErr);
    };
  }, [audioUrl, onPlayChange]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (onPlayChange) onPlayChange(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        if (onPlayChange) onPlayChange(true);
      } catch (e) {
        console.error('Playback error:', e);
      }
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const val = Number(e.target.value);
    audio.currentTime = val;
    setCurrentTime(val);
  };

  const handleVolume = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const fmt = (s) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: 'var(--text-primary)' }}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Waveform visualization strip */}
      <div className="flex items-center justify-center px-6 pt-5 pb-3">
        <WaveformBars isPlaying={isPlaying} />
      </div>

      {/* Label */}
      <div className="flex items-center justify-between px-6 pb-2">
        <div className="flex items-center gap-2">
          <Music2 size={13} className="text-white/40" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-white/40">Your Practice Recording</span>
        </div>
        <span className="font-mono text-[11px] text-white/35">{fmt(currentTime)} / {fmt(duration)}</span>
      </div>

      {/* Progress bar */}
      <div className="px-6 pb-3 relative group">
        <div className="relative h-1.5 cursor-pointer" onClick={(e) => {
          if (!duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          const newTime = ratio * duration;
          if (audioRef.current) audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }}>
          {/* Track */}
          <div className="absolute inset-0 rounded-full bg-white/10" />
          {/* Fill */}
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-75"
            style={{ width: `${progress}%`, background: 'var(--accent)' }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
          {/* Invisible range for click precision */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.01}
            value={currentTime}
            onInput={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Seek audio"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-6 pb-5">
        {/* Volume */}
        <div className="flex items-center gap-2 w-28">
          <Volume2 size={14} className="text-white/40 shrink-0" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onInput={handleVolume}
            className="w-full accent-[var(--accent)] cursor-pointer h-1"
            aria-label="Volume"
          />
        </div>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ background: 'var(--accent)' }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying
            ? <Pause size={20} fill="white" className="text-white" />
            : <Play size={20} fill="white" className="text-white ml-0.5" />
          }
        </button>

        {/* Restart */}
        <button
          onClick={() => {
            if (audioRef.current) { audioRef.current.currentTime = 0; setCurrentTime(0); }
          }}
          className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
          aria-label="Restart"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function VoicePracticePage() {
  const { addSession, calculateDeltas, sessions } = useSessionHistory();
  const { user } = useAuthStore();
  const { fetchDashboardData } = useAppStore();

  const [timer, setTimer] = useState(0);
  const [results, setResults] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [lastBlob, setLastBlob] = useState(null);
  const [lastMimeType, setLastMimeType] = useState(null);
  const [playerPlaying, setPlayerPlaying] = useState(false);

  const handleAudioReadyRef = useRef(null);

  const {
    recorderState,
    setRecorderState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isPaused,
    resetState,
    analyserRef,
  } = useAudioRecorder((blob, mimeType) => {
    if (handleAudioReadyRef.current) handleAudioReadyRef.current(blob, mimeType);
  });

  const handleAudioReady = useCallback(async (blob, mimeType) => {
    if (!blob || blob.size === 0) {
      alert('Recording seems empty. Check your microphone.');
      setRecorderState('idle');
      return;
    }
    setLastBlob(blob);
    setLastMimeType(mimeType);
    const url = URL.createObjectURL(blob);
    setRecordedAudioUrl(url);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        try {
          const res = await api.post('/english/analyze', {
            audioData: base64,
            mimeType: (mimeType || 'audio/webm').split(';')[0],
            duration: timer,
          });
          setResults(res.data);
          addSession(res.data);
          setRecorderState('results');
          fetchDashboardData();
        } catch (err) {
          console.error('API error', err);
          setResults({
            overall: 0, fluency: 0, clarity: 0, vocabulary: 0, grammar: 0,
            feedback: 'Analysis failed. You can retry below.',
            strength: 'Analysis Error', improve: 'Check connection',
          });
          setRecorderState('results');
        }
      };
    } catch (e) {
      console.error(e);
      setRecorderState('idle');
    }
  }, [addSession, setRecorderState, timer, fetchDashboardData]);

  useEffect(() => { handleAudioReadyRef.current = handleAudioReady; }, [handleAudioReady]);

  // Cleanup blob URL on unmount or change
  useEffect(() => {
    return () => { if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl); };
  }, [recordedAudioUrl]);

  // Timer
  useEffect(() => {
    let interval;
    if (recorderState === 'recording' && !isPaused) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(interval);
      if (recorderState === 'idle') setTimer(0);
    }
    return () => clearInterval(interval);
  }, [recorderState, isPaused]);

  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // Space to start/stop
  const handleKey = useCallback((e) => {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      if (recorderState === 'idle') startRecording();
      else if (recorderState === 'recording') stopRecording();
    }
  }, [recorderState, startRecording, stopRecording]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const handleReset = () => {
    setResults(null);
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordedAudioUrl(null);
    setLastBlob(null);
    setLastMimeType(null);
    setPlayerPlaying(false);
    resetState();
  };

  const handleRetry = async () => {
    if (!lastBlob) return;
    setRecorderState('processing');
    const reader = new FileReader();
    reader.readAsDataURL(lastBlob);
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        const res = await api.post('/english/analyze', {
          audioData: base64,
          mimeType: (lastMimeType || 'audio/webm').split(';')[0],
        });
        setResults(res.data);
        addSession(res.data);
        setRecorderState('results');
      } catch {
        setResults(prev => ({ ...prev, feedback: 'Retry failed. Try a new recording.' }));
        setRecorderState('results');
      }
    };
  };

  const deltas = useMemo(() => results ? calculateDeltas(results) : null, [results, calculateDeltas]);
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  const isRecordingActive = recorderState === 'recording' && !isPaused;

  return (
    <>
      {/* Keyframe for waveform bars */}
      <style>{`
        @keyframes vpBeat {
          0%   { height: 6px; }
          100% { height: 42px; }
        }
      `}</style>

      <div
        className="w-full h-full overflow-y-auto"
        style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
      >
        <div className="max-w-[820px] mx-auto px-5 md:px-10 py-10 min-h-full flex flex-col gap-8">

          {/* ── Header ── */}
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-[26px] md:text-[30px] font-semibold tracking-tight">Voice Practice</h1>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>{today}</p>
            </div>
            <div
              className="flex items-center gap-2.5 py-1.5 px-4 rounded-full text-[13px] font-medium"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--accent)', boxShadow: '0 0 8px rgba(0,200,83,0.5)' }}
              />
              {user?.streak || 0} day streak
            </div>
          </header>

          {/* ── Record Zone ── */}
          {recorderState !== 'results' && (
            <div className="flex flex-col items-center justify-center gap-6 py-6 animate-in fade-in duration-500">

              {/* Orb */}
              <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                {/* Idle rings */}
                {recorderState === 'idle' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <div className="absolute w-[90px] h-[90px] rounded-full border border-[var(--accent-medium)] animate-ping" style={{ animationDuration: '3s' }} />
                    <div className="absolute w-[130px] h-[130px] rounded-full border border-[var(--accent-soft)] animate-ping" style={{ animationDuration: '4.2s', animationDelay: '1s' }} />
                    <div className="absolute w-[175px] h-[175px] rounded-full border border-[var(--accent-soft)] animate-ping" style={{ animationDuration: '5.5s', animationDelay: '2s' }} />
                  </div>
                )}

                <RecordOrb analyserRef={analyserRef} isRecording={isRecordingActive} />

                {/* Central button(s) */}
                <div className="z-10 flex items-center gap-4">
                  {recorderState === 'idle' && (
                    <button
                      onClick={startRecording}
                      aria-label="Start recording"
                      className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'var(--text-primary)',
                        color: 'var(--bg)',
                        boxShadow: '0 0 0 0px rgba(0,200,83,0.12)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 10px rgba(0,200,83,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 0px rgba(0,200,83,0.12)'}
                    >
                      <Mic size={32} />
                    </button>
                  )}

                  {recorderState === 'recording' && (
                    <>
                      <button
                        onClick={isPaused ? resumeRecording : pauseRecording}
                        aria-label={isPaused ? 'Resume' : 'Pause'}
                        className="w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-105"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                      >
                        {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                      </button>
                      <button
                        onClick={stopRecording}
                        aria-label="Stop recording"
                        className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 scale-105"
                        style={{ background: 'var(--danger)', color: 'white', boxShadow: '0 4px 20px rgba(255,59,48,0.35)' }}
                      >
                        <Square fill="currentColor" size={24} />
                      </button>
                    </>
                  )}

                  {recorderState === 'processing' && (
                    <div className="relative flex items-center justify-center">
                      <Loader2 size={42} className="animate-spin" style={{ color: 'var(--accent)', opacity: 0.3 }} />
                      <Loader2 size={42} className="animate-spin absolute" style={{ color: 'var(--accent)', animationDirection: 'reverse', animationDuration: '0.6s' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* State label */}
              <div className="text-center min-h-[52px]">
                {recorderState === 'idle' && (
                  <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                    Tap the mic or press <kbd className="px-1.5 py-0.5 rounded text-[11px] font-mono border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-strong)' }}>Space</kbd> to begin
                  </p>
                )}
                {recorderState === 'recording' && (
                  <div className="space-y-1">
                    <p className="font-mono text-[15px] font-bold" style={{ color: 'var(--danger)' }}>{fmt(timer)}</p>
                    <p className="text-[13px] animate-pulse" style={{ color: 'var(--text-secondary)' }}>
                      {isPaused ? '⏸ Paused' : '● Listening… speak naturally'}
                    </p>
                  </div>
                )}
                {recorderState === 'processing' && (
                  <p className="text-[14px] animate-pulse" style={{ color: 'var(--text-secondary)' }}>Analysing your speech…</p>
                )}
              </div>
            </div>
          )}

          {/* ── Results Zone ── */}
          {recorderState === 'results' && results && deltas && (
            <div className="flex-1 flex flex-col gap-6 animate-in slide-in-from-bottom-6 fade-in duration-500 pb-10">

              {/* Overall + Music Player */}
              <div
                className="w-full rounded-[20px] p-6 relative overflow-hidden shadow-lg"
                style={{ background: 'var(--text-primary)', color: 'white' }}
              >
                {/* Glow blob */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                  style={{ background: 'var(--accent)', opacity: 0.12, filter: 'blur(60px)', transform: 'translate(25%,-40%)' }}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6">
                  {/* Score block */}
                  <div className="shrink-0">
                    <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold mb-1">Overall Score</p>
                    <div className="flex items-end gap-3">
                      <p className="font-mono text-[56px] leading-none font-bold">{results.overall}</p>
                      <span
                        className="font-mono text-[16px] pb-2"
                        style={{ color: deltas.overall >= 0 ? 'var(--accent)' : 'var(--danger)' }}
                      >
                        {deltas.overall >= 0 ? `↑ +${deltas.overall}` : `↓ ${deltas.overall}`}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px self-stretch bg-white/10" />

                  {/* Music Player */}
                  {recordedAudioUrl ? (
                    <div className="flex-1 min-w-0">
                      <MusicPlayer audioUrl={recordedAudioUrl} onPlayChange={setPlayerPlaying} />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center text-white/30 text-[13px]">No recording available</div>
                  )}
                </div>
              </div>

              {/* Score Cards + AI Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <ScoreCard title="Fluency"    score={results.fluency}    delta={deltas.fluency}    delay={0}   />
                  <ScoreCard title="Clarity"    score={results.clarity}    delta={deltas.clarity}    delay={70}  />
                  <ScoreCard title="Vocabulary" score={results.vocabulary} delta={deltas.vocabulary} delay={140} />
                  <ScoreCard title="Grammar"    score={results.grammar}    delta={deltas.grammar}    delay={210} />
                </div>

                <div
                  className="md:col-span-1 rounded-[18px] p-5 flex flex-col justify-between border-l-[3px] h-full"
                  style={{ background: 'var(--bg-secondary)', borderLeftColor: 'var(--accent)' }}
                >
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--text-muted)' }}>AI Feedback</h4>
                    <p className="text-[13.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{results.feedback}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className="text-[11px] font-semibold px-3 py-1 rounded-full border"
                      style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-medium)', color: 'var(--accent)' }}
                    >
                      ↑ {results.strength}
                    </span>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-red-500">
                      ↗ {results.improve}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Trend */}
              <div
                className="w-full rounded-[18px] p-5 relative overflow-hidden"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', height: 140 }}
              >
                <h4 className="text-[12px] font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Progress Trend</h4>
                <div className="absolute bottom-5 left-5 right-5 top-12 flex items-end justify-between">
                  {sessions.length > 1 ? (
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                      <path
                        d={`M ${sessions.map((s, i) => `${(i / (sessions.length - 1)) * 100},${40 - (s.overall / 100) * 35}`).join(' L ')} L 100,40 L 0,40 Z`}
                        fill="rgba(0,200,83,0.07)"
                      />
                      <path
                        d={`M ${sessions.map((s, i) => `${(i / (sessions.length - 1)) * 100},${40 - (s.overall / 100) * 35}`).join(' L ')}`}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                      />
                      <circle
                        cx="100"
                        cy={40 - (sessions[sessions.length - 1].overall / 100) * 35}
                        r="2.5"
                        fill="var(--accent)"
                        stroke="white"
                        strokeWidth="1"
                      />
                    </svg>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] italic" style={{ color: 'var(--text-muted)' }}>
                      Log more sessions to reveal your progress curve
                    </div>
                  )}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 rounded-full text-[14px] font-semibold border transition-all duration-300 hover:brightness-90"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
                >
                  New Recording
                </button>
                {(results.overall === 0 || results.feedback.includes('failed')) && (
                  <button
                    onClick={handleRetry}
                    className="px-8 py-3 rounded-full text-[14px] font-bold transition-all duration-300 hover:brightness-110"
                    style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 0 20px rgba(0,200,83,0.3)' }}
                  >
                    Retry Analysis
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
