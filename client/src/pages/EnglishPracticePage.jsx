import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import useAudioRecorder from '../hooks/useAudioRecorder';
import useSessionHistory from '../hooks/useSessionHistory';
import WaveformCanvas from '../components/WaveformCanvas';
import ScoreCard from '../components/ScoreCard';
import { Mic, Square, ArrowUp, Loader2, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../store/authStore';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/useAppStore';

const MOCK_AI_RESPONSE = {
  fluency: 82,
  clarity: 76,
  vocabulary: 68,
  grammar: 79,
  overall: 76,
  feedback: "Your pacing was consistent and sentence structure came through clearly. Focus on expanding your use of discourse markers.",
  strength: "Natural sentence rhythm",
  improve: "Vary discourse markers"
};

export default function EnglishPracticePage() {
  const { addSession, calculateDeltas, sessions } = useSessionHistory();
  const { user } = useAuthStore();
  const { fetchDashboardData } = useAppStore();
  const [timer, setTimer] = useState(0);
  const [results, setResults] = useState(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [lastBlob, setLastBlob] = useState(null);
  const [lastMimeType, setLastMimeType] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const audioRef = useRef(null);

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
    analyserRef
  } = useAudioRecorder((blob, mimeType) => {
    if (handleAudioReadyRef.current) handleAudioReadyRef.current(blob, mimeType);
  });

  const handleAudioReady = useCallback(async (blob, mimeType) => {
    if (!blob || blob.size === 0) {
      alert("Recording seems empty. Please check your microphone.");
      setRecorderState('idle');
      return;
    }
    
    setLastBlob(blob);
    setLastMimeType(mimeType);

    // Create local URL for playback
    const url = URL.createObjectURL(blob);
    setRecordedAudioUrl(url);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        try {
          const res = await api.post('/english/analyze', {
            audioData: base64data,
            mimeType: (mimeType || 'audio/webm').split(';')[0],
            duration: timer
          });
          setResults(res.data);
          addSession(res.data);
          setRecorderState('results');
          fetchDashboardData(); // Sync the rest of the app
        } catch (error) {
          console.error("API error", error);
          setRecorderState('results'); // Show the results zone with an error state
          setResults({
            overall: 0, fluency: 0, clarity: 0, vocabulary: 0, grammar: 0,
            feedback: "Analysis failed. You can try to retry specifically this recording below.",
            strength: "Analysis Error",
            improve: "Check connection"
          });
        }
      };
    } catch (e) {
      console.error(e);
      setRecorderState('idle');
    }
  }, [addSession, setRecorderState]);

  const handleRetryAnalysis = async () => {
    if (!lastBlob) return;
    setRecorderState('processing');
    
    const reader = new FileReader();
    reader.readAsDataURL(lastBlob);
    reader.onloadend = async () => {
      const base64data = reader.result.split(',')[1];
      try {
        const res = await api.post('/english/analyze', {
          audioData: base64data,
          mimeType: (lastMimeType || 'audio/webm').split(';')[0]
        });
        setResults(res.data);
        addSession(res.data);
        setRecorderState('results');
      } catch (error) {
        console.error("Retry failed", error);
        setRecorderState('results');
        setResults({
          overall: 0, fluency: 0, clarity: 0, vocabulary: 0, grammar: 0,
          feedback: "Retry failed. Jerry is still having trouble. Maybe try a new recording?",
          strength: "Still failing",
          improve: "Try new sample"
        });
      }
    };
  };

  useEffect(() => {
    handleAudioReadyRef.current = handleAudioReady;
  }, [handleAudioReady]);

  // Timer logic
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

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleKeyPress = useCallback((e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (recorderState === 'idle') startRecording();
      else if (recorderState === 'recording') stopRecording();
    }
  }, [recorderState, startRecording, stopRecording]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleTryAgain = () => {
    setResults(null);
    setRecordedAudioUrl(null);
    setLastBlob(null);
    setLastMimeType(null);
    setIsPlaying(false);
    setPlaybackTime(0);
    setPlaybackDuration(0);
    resetState();
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      const handleTimeUpdate = () => setPlaybackTime(audio.currentTime);
      const handleLoadedMetadata = () => setPlaybackDuration(audio.duration);

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [recordedAudioUrl]);

  const handleSeek = (e) => {
    if (!audioRef.current || !playbackDuration) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setPlaybackTime(time);
  };

  // Memory cleanup for blob URLs
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  const deltas = useMemo(() => {
    if (!results) return null;
    return calculateDeltas(results);
  }, [results, calculateDeltas]);

  // Handle analyser ref access via state to avoid "cannot access ref during render"
  const [analyser, setAnalyser] = useState(null);

  useEffect(() => {
    if (analyserRef.current && !analyser) {
      setAnalyser(analyserRef.current);
    }
  }, [analyserRef, analyser]);

  return (
    <div className="w-full h-full bg-[var(--bg)] text-[var(--text-primary)] font-sans overflow-y-auto">
      <div className="max-w-[860px] mx-auto px-5 md:px-10 py-10 min-h-full flex flex-col">

        {/* Header */}
        <header className="flex items-center justify-between pb-8">
          <div>
            <h1 className="text-[24px] md:text-[28px] font-semibold tracking-[-0.5px]">English Practice</h1>
            <p className="text-[14px] text-[var(--text-secondary)] mt-1">{today}</p>
          </div>
          <div className="flex items-center gap-3 bg-[var(--bg-secondary)] py-1.5 px-4 rounded-full text-[13px] font-medium transition-all">
            <div className="w-[7px] h-[7px] bg-[var(--accent)] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,200,83,0.5)]" />
            <span>{user?.streak || 0} day streak</span>
          </div>
        </header>

        {/* Record Zone */}
        {recorderState !== 'results' && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500 min-h-[400px]">
            <div className="relative w-[320px] h-[320px] flex items-center justify-center">

              {/* Idle Rings */}
              {recorderState === 'idle' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                  <div className="absolute w-[100px] h-[100px] rounded-full border border-[var(--accent-medium)] animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute w-[140px] h-[140px] rounded-full border border-[var(--accent-soft)] animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                  <div className="absolute w-[180px] h-[180px] rounded-full border border-[var(--accent-soft)] animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
                </div>
              )}

              {/* Waveform */}
              <WaveformCanvas
                analyser={analyser}
                isRecording={recorderState === 'recording' && !isPaused}
              />

              {/* Central Button */}
              <div className="z-10 bg-white rounded-full">
                {recorderState === 'idle' && (
                  <button
                    onClick={startRecording}
                    aria-label="Start recording"
                    className="w-[80px] h-[80px] rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center hover:scale-105 hover:shadow-[0_0_0_8px_rgba(0,200,83,0.12)] transition-all duration-300"
                  >
                    <Mic size={32} />
                  </button>
                )}

                {recorderState === 'recording' && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={isPaused ? resumeRecording : pauseRecording}
                      aria-label={isPaused ? "Resume recording" : "Pause recording"}
                      className="w-[54px] h-[54px] rounded-full bg-[var(--bg-secondary)] border border-[var(--border-strong)] text-[var(--text-primary)] flex items-center justify-center hover:scale-105 transition-all duration-300"
                    >
                      {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                    </button>
                    <button
                      onClick={stopRecording}
                      aria-label="Stop recording"
                      className="w-[80px] h-[80px] rounded-full bg-[var(--danger)] text-white flex items-center justify-center scale-105 shadow-[0_4px_16px_rgba(255,59,48,0.3)] transition-all duration-300"
                    >
                      <Square fill="currentColor" size={24} />
                    </button>
                  </div>
                )}

                {recorderState === 'processing' && (
                  <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-[var(--text-primary)] relative">
                    <Loader2 size={32} className="animate-spin text-[var(--border-strong)]" />
                    <Loader2 size={32} className="animate-spin text-[var(--text-primary)] absolute stroke-2" style={{ strokeDasharray: 30, strokeDashoffset: -10 }} />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 text-center min-h-[60px]">
              {recorderState === 'idle' && (
                <p className="text-[14px] text-[var(--text-secondary)]">Tap to start speaking</p>
              )}
              {recorderState === 'recording' && (
                <div className="space-y-2">
                  <p className="font-mono text-[13px] text-[var(--danger)]">{formatTimer(timer)}</p>
                  <p className="text-[14px] text-[var(--text-secondary)] animate-pulse">Listening... speak naturally</p>
                </div>
              )}
              {recorderState === 'processing' && (
                <p className="text-[14px] text-[var(--text-secondary)] animate-pulse inline-block bg-gradient-to-r from-[var(--text-secondary)] via-black to-[var(--text-secondary)] bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_2s_linear_infinite]">Analysing your speech...</p>
              )}
            </div>
          </div>
        )}

        {/* Results Zone */}
        {recorderState === 'results' && results && deltas && (
          <div className="flex-1 animate-in slide-in-from-bottom-6 fade-in duration-500 ease-out fill-mode-both pb-10">

            {/* Overall Score */}
            <div className="w-full bg-[var(--text-primary)] text-white rounded-[18px] p-6 mb-6 relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[var(--accent)] rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="space-y-2">
                    <p className="text-[13px] text-white/50 font-medium tracking-wide uppercase">Overall Score</p>
                    <p className="font-mono text-[48px] leading-none">{results.overall}</p>
                  </div>

                  {/* Replay & Timeline */}
                  {recordedAudioUrl && (
                    <div className="flex flex-col flex-1 ml-4 pl-6 border-l border-white/10 gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={togglePlayback}
                            className="w-[42px] h-[42px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group"
                            title="Replay your recording"
                          >
                            {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-0.5" />}
                          </button>
                          <div>
                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider leading-none mb-0.5">Your Voice</p>
                            <p className="text-[12px] text-white/70 font-medium leading-none">Practice Audio</p>
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-white/40">
                          {formatTimer(Math.floor(playbackTime))} / {formatTimer(Math.floor(playbackDuration))}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="relative w-full h-1.5 group cursor-pointer mt-1">
                        <input
                          type="range"
                          min={0}
                          max={playbackDuration || 0}
                          step={0.01}
                          value={playbackTime}
                          onInput={handleSeek}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--accent)] rounded-full relative transition-all duration-75"
                            style={{ width: `${playbackDuration ? (playbackTime / playbackDuration) * 100 : 0}%` }}
                          >
                          </div>
                        </div>
                        {/* Hover Thumb */}
                        <div 
                          className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-lg border-2 border-[var(--accent)] top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ left: `calc(${playbackDuration ? (playbackTime / playbackDuration) * 100 : 0}% - 7px)` }}
                        />
                      </div>

                      <audio ref={audioRef} src={recordedAudioUrl} hidden />
                    </div>
                  )}
                </div>

                <div className={`font-mono text-[18px] ${deltas.overall >= 0 ? 'text-[var(--accent)]' : 'text-[var(--danger)]'}`}>
                  {deltas.overall >= 0 ? `↑ +${deltas.overall}` : `↓ ${deltas.overall}`}
                </div>
              </div>
            </div>

            {/* 2x2 Grid + Feedback Sidebar on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

              {/* Score Cards */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <ScoreCard title="Fluency" score={results.fluency} delta={deltas.fluency} delay={0} />
                <ScoreCard title="Clarity" score={results.clarity} delta={deltas.clarity} delay={70} />
                <ScoreCard title="Vocabulary" score={results.vocabulary} delta={deltas.vocabulary} delay={140} />
                <ScoreCard title="Grammar" score={results.grammar} delta={deltas.grammar} delay={210} />
              </div>

              {/* AI Feedback */}
              <div className="md:col-span-1 bg-[var(--bg-secondary)] rounded-[18px] p-5 border-l-[3px] border-l-[var(--accent)] h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] font-bold mb-3">AI Feedback</h4>
                  <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65]">
                    {results.feedback}
                  </p>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="inline-block bg-[var(--accent-soft)] border border-[var(--accent-medium)] text-[var(--accent)] text-[12px] font-medium px-3 py-1.5 rounded-full">
                    ↑ {results.strength}
                  </div>
                  <div className="inline-block bg-red-500/10 border border-red-500/20 text-red-600 text-[12px] font-medium px-3 py-1.5 rounded-full">
                    ↗ {results.improve}
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Day Sparkline (Dynamic data) */}
            <div className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[18px] p-5 mb-10 h-[140px] relative overflow-hidden flex flex-col justify-between">
              <h4 className="text-[12px] text-[var(--text-secondary)] font-medium mb-4">Latest Progress Trends</h4>
              <div className="flex-1 relative flex items-end justify-between px-2 w-full max-w-[500px] mx-auto pb-4">
                {sessions.length > 1 ? (
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <path
                      d={`M ${sessions.map((s, i) => `${(i / (sessions.length - 1)) * 100},${40 - (s.overall / 100) * 35}`).join(' L ')} L 100,40 L 0,40 Z`}
                      fill="rgba(0,200,83,0.08)"
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
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] text-[var(--text-muted)] italic">
                    Log more sessions to reveal your performance curve
                  </div>
                )}
                {/* Simplified X-axis labels based on session order */}
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className="font-mono text-[10px] text-[var(--text-muted)] z-10 translate-y-6">
                    {sessions[sessions.length - (7 - i)] ? '•' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={handleTryAgain}
                className="w-full md:w-auto bg-[var(--bg-secondary)] border border-[var(--border-strong)] text-[var(--text-primary)] rounded-full px-8 py-3 text-[14px] font-medium hover:bg-[var(--text-primary)] hover:text-white transition-colors duration-300"
              >
                New Recording
              </button>
              
              {(results.overall === 0 || results.feedback.includes("failed") || results.feedback.includes("unstable")) && (
                <button
                  onClick={handleRetryAnalysis}
                  className="w-full md:w-auto bg-[var(--accent)] text-white border border-[var(--accent)] rounded-full px-8 py-3 text-[14px] font-bold hover:brightness-110 shadow-glow transition-all duration-300"
                >
                  Retry Analysis
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
