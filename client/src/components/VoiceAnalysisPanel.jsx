import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Bookmark, ChevronRight, Star, Zap } from 'lucide-react';

/* ─── Severity badge colours ──────────────────────────────────────── */
const SEVERITY_STYLES = {
  critical: { bg: 'rgba(255,59,48,0.12)', border: 'rgba(255,59,48,0.35)', text: '#ff3b30' },
  moderate: { bg: 'rgba(255,159,10,0.12)', border: 'rgba(255,159,10,0.35)', text: '#ff9f0a' },
  minor:    { bg: 'rgba(0,200,83,0.10)',   border: 'rgba(0,200,83,0.25)',   text: 'var(--accent)' },
};

function SeverityBadge({ severity }) {
  const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.minor;
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      {severity}
    </span>
  );
}

/* ─── Single mistake card ────────────────────────────────────────── */
function MistakeCard({ mistake, index }) {
  const s = SEVERITY_STYLES[mistake.severity] || SEVERITY_STYLES.minor;
  return (
    <div
      className="rounded-[14px] p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-left-4"
      style={{
        background: 'var(--bg)',
        border: `1px solid ${s.border}`,
        animationDelay: `${index * 60}ms`,
        animationFillMode: 'both',
        animationDuration: '400ms',
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} style={{ color: s.text }} />
          <SeverityBadge severity={mistake.severity} />
          {mistake.timestamp && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
              ⏱ {mistake.timestamp}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
          📌 {mistake.grammarRule}
        </span>
      </div>

      {/* Wrong → Correct */}
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex items-start gap-2">
          <span className="text-[12px] font-bold mt-0.5" style={{ color: '#ff3b30', minWidth: 14 }}>✗</span>
          <span
            className="text-[13.5px] font-medium px-2 py-0.5 rounded"
            style={{ background: 'rgba(255,59,48,0.08)', color: '#ff3b30', textDecoration: 'line-through', textDecorationColor: 'rgba(255,59,48,0.5)' }}
          >
            {mistake.wrongPhrase}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[12px] font-bold mt-0.5" style={{ color: 'var(--accent)', minWidth: 14 }}>✓</span>
          <span
            className="text-[13.5px] font-semibold px-2 py-0.5 rounded"
            style={{ background: 'rgba(0,200,83,0.08)', color: 'var(--accent)' }}
          >
            {mistake.correctPhrase}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Topic card ──────────────────────────────────────────────────── */
function TopicCard({ topic, index, isPrimary, onSelect }) {
  return (
    <button
      onClick={() => onSelect(topic)}
      className="w-full text-left rounded-[14px] p-4 flex items-center justify-between gap-3 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] group animate-in fade-in slide-in-from-right-4"
      style={{
        background: isPrimary ? 'var(--bg)' : 'var(--bg)',
        border: isPrimary
          ? '1.5px solid var(--accent)'
          : '1px solid var(--border)',
        boxShadow: isPrimary ? '0 0 18px rgba(0,200,83,0.15)' : 'none',
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'both',
        animationDuration: '400ms',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {isPrimary ? (
          <Star size={16} fill="currentColor" style={{ color: 'var(--accent)', flexShrink: 0 }} />
        ) : (
          <Bookmark size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        )}
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {topic.name}
          </p>
          {topic.reason && (
            <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              {topic.reason}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
        >
          {topic.category}
        </span>
        <ChevronRight
          size={15}
          style={{ color: 'var(--text-muted)' }}
          className="group-hover:translate-x-0.5 transition-transform"
        />
      </div>
    </button>
  );
}

/* ─── Score Chip ─────────────────────────────────────────────────── */
function ScoreChip({ label, value, accent }) {
  const color = accent
    ? 'var(--accent)'
    : value >= 70 ? 'var(--accent)' : value >= 40 ? '#ff9f0a' : '#ff3b30';
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-[22px] font-bold leading-none" style={{ color }}>
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Main Export ────────────────────────────────────────────────── */
export default function VoiceAnalysisPanel({
  topic = 'General Practice',
  duration = 0,
  score = 0,
  mistakes = [],
  nextTopics = [],
  transcription = '',
  onNewRecording,
}) {
  const navigate = useNavigate();

  const fmt = (s) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const criticalCount = mistakes.filter(m => m.severity === 'critical').length;
  const moderateCount = mistakes.filter(m => m.severity === 'moderate').length;

  const handleTopicSelect = (t) => {
    // Navigate to voice practice page with topic pre-selected
    navigate('/voice-practice', { state: { selectedTopic: t } });
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-10">

      {/* ── Header strip ── */}
      <div
        className="rounded-[20px] p-5 relative overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'var(--accent)', opacity: 0.07, filter: 'blur(50px)', transform: 'translate(30%,-40%)' }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>
                Voice Practice — Analysis
              </p>
              <h2 className="text-[17px] font-semibold" style={{ color: 'var(--text-primary)' }}>{topic}</h2>
            </div>
            <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
              <span>⏱ {fmt(duration)}</span>
              <span className="w-1 h-1 rounded-full bg-current opacity-40" />
              <span>{mistakes.length} mistake{mistakes.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Score chips */}
          <div className="flex items-center gap-6">
            <ScoreChip label="Grammar" value={score} />
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff3b30]" />
                <span className="text-[11px] font-semibold" style={{ color: '#ff3b30' }}>
                  {criticalCount} critical
                </span>
              </div>
            )}
            {moderateCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff9f0a]" />
                <span className="text-[11px] font-semibold" style={{ color: '#ff9f0a' }}>
                  {moderateCount} moderate
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Transcription (collapsible) ── */}
      {transcription && (
        <details
          className="group rounded-[16px] overflow-hidden"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <summary
            className="flex items-center justify-between px-4 py-3 cursor-pointer select-none list-none"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span className="text-[12px] font-semibold uppercase tracking-widest">What you said</span>
            <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
          </summary>
          <div className="px-4 pb-4">
            <p className="text-[13px] leading-relaxed italic" style={{ color: 'var(--text-muted)' }}>
              "{transcription}"
            </p>
          </div>
        </details>
      )}

      {/* ── Grammar Mistakes ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} style={{ color: '#ff3b30' }} />
          <h3 className="text-[12px] font-bold uppercase tracking-widest" style={{ color: '#ff3b30' }}>
            Grammar Mistakes
          </h3>
        </div>

        {mistakes.length === 0 ? (
          <div
            className="rounded-[14px] p-5 flex items-center gap-3"
            style={{ background: 'rgba(0,200,83,0.07)', border: '1px solid rgba(0,200,83,0.25)' }}
          >
            <CheckCircle2 size={20} style={{ color: 'var(--accent)' }} />
            <div>
              <p className="text-[14px] font-semibold" style={{ color: 'var(--accent)' }}>No mistakes detected! 🎉</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Excellent grammar in this session.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mistakes.map((m, i) => (
              <MistakeCard key={i} mistake={m} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── Next Topic Suggestions ── */}
      {nextTopics.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: 'var(--accent)' }} />
            <h3 className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              🔥 Next Recommended Topics
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            {nextTopics.map((t, i) => (
              <TopicCard
                key={t.id}
                topic={t}
                index={i}
                isPrimary={i === 0}
                onSelect={handleTopicSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onNewRecording}
          className="px-8 py-3 rounded-full text-[14px] font-semibold border transition-all duration-300 hover:brightness-90"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
        >
          ↩ New Recording
        </button>
      </div>
    </div>
  );
}
