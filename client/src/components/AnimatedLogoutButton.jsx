import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const AnimatedLogoutButton = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [state, setState] = useState('default');
  const [isClicked, setIsClicked] = useState(false);
  const [btnPos, setBtnPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const handleLogout = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setBtnPos({ top: rect.top, left: rect.left });
    }
    
    setIsClicked(true);
    setState('walking1');
    
    // 1. Initial walk sequence (0ms - 500ms)
    setTimeout(() => {
      setState('walking2');
    }, 500);

    // 2. The Great Plummet (Triggered exactly at 1100ms)
    setTimeout(() => {
      setState('falling');
    }, 1100);

    // 3. Official Logout after full fall sequence
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 4500); // Extended slightly for full impact
  };

  const getBtnFigureStyle = () => {
    switch (state) {
      case 'hover': return { transform: 'translateX(2px)' };
      case 'walking1': return { transform: 'translateX(10px)' };
      case 'walking2': return { transform: 'translateX(22px)' }; // MOVE DEEPER INTO THE DOOR (RIGHT SIDE)
      case 'falling': return { opacity: 0, transform: 'scale(0)' }; 
      default: return { transform: 'none' };
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleLogout}
        onMouseEnter={() => state === 'default' && setState('hover')}
        onMouseLeave={() => state === 'hover' && setState('default')}
        className={`
          relative w-[50px] h-[44px] flex items-center justify-center overflow-hidden rounded-2xl transition-all duration-300 group
          ${isClicked ? 'pointer-events-none' : 'cursor-pointer'}
        `}
      >
        <div className="absolute inset-0 bg-[#1f2335] transition-colors group-hover:bg-[#2a2f45]" />

        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* Internal Figure (Visible before portal jump) */}
          <svg 
            className="absolute inset-0 w-8 h-8 transition-all duration-300 ease-in-out" 
            style={{ ...getBtnFigureStyle(), fill: '#4ade80' }} 
            viewBox="0 0 100 100"
          >
            <circle cx="52" cy="32" r="6"/>
            <path d="M50 60c-5 10-15 0-10-10s5-10 10-5z"/>
            <g className={`transition-all duration-300 ${state.includes('walking') ? 'animate-bounce' : ''}`}>
               <path d="M55 55l-6-9" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
               <path d="M35 45l10-5" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
               <path d="M50 70l-8-6" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
               <path d="M40 70l5-10" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
               <path d="M50 80l0-10" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
               <path d="M30 80l10-10" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
            </g>
          </svg>

          {/* Door SVG (On the right side of the container) */}
          <svg 
            className="absolute inset-0 w-8 h-8 transition-transform duration-300 origin-right"
            viewBox="0 0 100 100"
            style={{ 
              transformStyle: 'preserve-3d', 
              perspective: '100px',
              transform: state === 'hover' || isClicked ? 'rotateY(40deg)' : 'rotateY(20deg)'
            }}
          >
            <rect x="58" y="15" width="28" height="70" fill="none" stroke="#4ade80" strokeWidth="4" rx="2" />
            <circle cx="82" cy="50" r="2" fill="#4ade80" />
          </svg>
        </div>
      </button>

      {/* THE PLUMMET PORTAL (Gravity Fall - Full Screen Animation) */}
      {state === 'falling' && createPortal(
         <div className="fixed inset-0 z-[9999] pointer-events-none">
            <style>
              {`
                @keyframes gravity-plummet {
                  0% { transform: translateY(0) rotate(0deg) scale(0.6); opacity: 1; }
                  100% { transform: translateY(115vh) rotate(720deg) scale(2.8); opacity: 0; }
                }
                .animate-gravity-plummet {
                  animation: gravity-plummet 2.6s cubic-bezier(0.5, 0, 1, 0.5) forwards;
                }

                @keyframes speed-glow {
                  0% { opacity: 0; }
                  50% { opacity: 0.25; }
                  100% { opacity: 0; }
                }
                .animate-speed-glow {
                  animation: speed-glow 1s ease-in-out infinite;
                }
              `}
            </style>
            
            {/* DOOR ALIGNMENT: Launch point is now the RIGHT side of the button */}
            <div 
              className="absolute flex items-center justify-center animate-gravity-plummet"
              style={{
                left: `${btnPos.left + 14}px`, // SHIFTED TO THE RIGHT (Door Center)
                top: `${btnPos.top}px`,
                width: '50px',
                height: '44px'
              }}
            >
              <svg className="w-10 h-10" viewBox="0 0 100 100" style={{ fill: '#4ade80' }}>
                <circle cx="52" cy="32" r="6"/>
                <path d="M50 60c-5 10-15 0-10-10s5-10 10-5z"/>
                <g>
                   <path d="M55 55l-6-9" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
                   <path d="M35 45l10-5" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
                   <path d="M50 70l-8-6" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
                   <path d="M40 70l5-10" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
                   <path d="M50 80l0-10" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
                   <path d="M30 80l10-10" stroke="#4ade80" strokeWidth="4" strokeLinecap="round"/>
                </g>
              </svg>
            </div>
            
            {/* Atmospheric Speed Effect (No clipping) */}
            <div className="fixed inset-0 bg-gradient-to-b from-green-core/15 via-transparent to-green-core/25 animate-speed-glow" />
         </div>,
         document.body
      )}
    </>
  );
};

export default AnimatedLogoutButton;
