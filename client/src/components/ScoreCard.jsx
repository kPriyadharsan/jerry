import React, { useState, useEffect } from 'react';

const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export default function ScoreCard({ title, score, delta, delay = 0 }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Staggered entry
    const entryTimer = setTimeout(() => {
      setIsVisible(true);
      
      // Count-up animation setup
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setDisplayScore(score);
        return;
      }

      let startTime = null;
      const duration = 800; // 800ms

      const animateScore = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentDisplay = Math.floor(easeInOutQuad(progress) * score);
        setDisplayScore(currentDisplay);

        if (progress < 1) {
          requestAnimationFrame(animateScore);
        } else {
          setDisplayScore(score);
        }
      };

      requestAnimationFrame(animateScore);

    }, delay);

    return () => clearTimeout(entryTimer);
  }, [score, delay]);

  const isPositive = delta > 0;
  const isNeutral = delta === 0;
  
  const arcStrokeDasharray = `${(displayScore / 100) * 125.6} 125.6`; // 2 * pi * 20 = 125.6
  
  return (
    <div 
      className={`bg-[var(--bg-secondary)] border border-[var(--border)]/10 rounded-[var(--radius)] p-4 flex items-center justify-between transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      <div className="flex flex-col gap-1">
        <h4 className="text-[12px] text-[var(--text-secondary)] font-medium tracking-wide">— {title}</h4>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[36px] text-[var(--text-primary)] leading-none">{displayScore}</span>
          <span className={`font-mono text-[11px] font-bold ${isPositive ? 'text-[var(--accent)]' : isNeutral ? 'text-[var(--text-muted)]' : 'text-[var(--danger)]'}`}>
            {isPositive ? `↑ +${delta}` : isNeutral ? `— 0` : `↓ ${delta}`}
          </span>
        </div>
      </div>
      
      {/* Target/Arc Ring */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg width="48" height="48" viewBox="0 0 48 48" className="rotate-[-90deg]">
          {/* Background track */}
          <circle 
            cx="24" cy="24" r="20" 
            fill="none" 
            stroke="var(--bg-card)" 
            strokeWidth="2.5" 
          />
          {/* Progress arc */}
          <circle 
            cx="24" cy="24" r="20" 
            fill="none" 
            stroke="var(--accent)" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            strokeDasharray={arcStrokeDasharray}
            className="transition-all duration-[80ms] ease-linear"
          />
        </svg>
      </div>
    </div>
  );
}
