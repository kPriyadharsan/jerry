import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, CheckSquare, BarChart2, Settings, Brain, Mic2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '../store/authStore';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const { user } = useAuthStore();

  const links = [
    { to: '/', icon: <MessageSquare size={20} />, label: 'Chat' },
    { to: '/tasks', icon: <CheckSquare size={20} />, label: 'Daily Tasks' },
    { to: '/voice-practice', icon: <Mic2 size={20} />, label: 'Voice Practice' },
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

      {/* Sidebar Footer space removed */}
    </div>
  );
}
