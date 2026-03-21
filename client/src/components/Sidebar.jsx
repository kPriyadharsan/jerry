import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, CheckSquare, BarChart2, Settings, Brain, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '../store/authStore';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/', icon: <MessageSquare size={20} />, label: 'Chat' },
    { to: '/tasks', icon: <CheckSquare size={20} />, label: 'Daily Tasks' },
    { to: '/dashboard', icon: <BarChart2 size={20} />, label: 'Dashboard' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-bg-primary/85 backdrop-blur-lg border-r border-green-core/10 h-screen flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-green-core/10 text-text-primary">
        <Brain className="text-green-core" size={28} />
        <h1 className="text-xl font-display font-bold tracking-tight">Jerry AI</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 text-text-secondary">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200',
                isActive ? 'bg-green-core/10 text-green-deep font-semibold' : 'hover:bg-green-subtle hover:text-green-deep'
              )
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-green-core/10 flex items-center justify-between group">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-green-core flex items-center justify-center text-black-spore font-bold shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="text-sm overflow-hidden">
            <p className="text-text-primary font-semibold truncate">{user?.name || 'User'}</p>
            <p className="text-text-muted text-xs truncate capitalize">{user?.goal || 'Pro Setup'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-text-muted hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}

