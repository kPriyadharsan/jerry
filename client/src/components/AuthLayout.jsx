import React from 'react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative z-0 overflow-hidden">
      {/* Signature Organic Accents */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-black-spore/[0.05] rounded-[60%_40%_55%_45%/45%_55%_40%_60%] animate-blob pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-green-core/[0.05] rounded-[40%_60%_45%_55%/55%_45%_60%_40%] animate-blob pointer-events-none -z-10 blur-[80px]" />

      <div className="w-full max-w-md bg-bg-glass backdrop-blur-md rounded-lg border border-green-core/20 shadow-card p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-core/20 rounded-pill flex items-center justify-center mx-auto mb-6 border border-green-core/30 shadow-glow animate-pulse">
             <div className="w-10 h-10 rounded-full bg-green-core shadow-[0_0_20px_rgba(76,221,30,0.6)]" />
          </div>
          <h1 className="text-3xl font-display font-bold text-black-spore mb-2 tracking-tight">{title}</h1>
          <p className="text-text-muted text-sm font-medium">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
