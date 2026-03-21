import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { isAuthenticated, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0D0D0D] flex flex-col items-center justify-center gap-4">
        <div className="relative">
             <div className="w-16 h-16 rounded-full border-4 border-green-500/20" />
             <div className="w-16 h-16 rounded-full border-4 border-green-500 border-t-transparent animate-spin absolute inset-0" />
        </div>
        <p className="text-white/50 animate-pulse text-sm">Syncing Jerry Brain...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
