import { create } from 'zustand';
import { jerryChat } from '../lib/gemini';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const useAppStore = create((set, get) => ({
  // Settings
  examMode: false,
  toggleExamMode: () => set((state) => ({ examMode: !state.examMode })),

  // Dashboard Data
  todayScore: 0,
  streak: 0,
  weakArea: 'Assessing...',
  weeklyScores: [],
  patternInsights: 'Jerry is analyzing your patterns...',
  isLoadingDashboard: false,

  fetchDashboardData: async () => {
    set({ isLoadingDashboard: true });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${SERVER_URL}/api/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      
      const data = await res.json();
      
      set({
        todayScore: data.todayScore,
        streak: data.streak,
        weakArea: data.weaknesses?.[0] || 'None detected',
        weeklyScores: data.last7DaysLogs.map(log => ({
          day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
          score: log.score
        })),
        pendingTasks: data.pendingTasks || [],
        completedTasks: data.completedTasks || [],
        optionalTasks: data.optionalTasks || [],
        isLoadingDashboard: false
      });

    } catch (err) {
      console.error('Fetch error:', err.message);
      set({ isLoadingDashboard: false });
    }
  },

  // Tasks Data
  pendingTasks: [],
  completedTasks: [],
  optionalTasks: [],
  
  submitTask: async (taskData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${SERVER_URL}/api/task`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        get().fetchDashboardData();
        return true;
      }
    } catch (err) {
      console.error('Task submission error:', err);
    }
    return false;
  },

  // Chat Data
  messages: [
    { id: 1, role: 'assistant', content: 'Hello sir! I am Jerry, your personal AI brain. How can we optimize your day?' }
  ],
  isTyping: false,

  sendChatMessage: async (content) => {
    const userMsg = { id: Date.now(), role: 'user', content };
    
    set((state) => ({ 
      messages: [...state.messages, userMsg],
      isTyping: true 
    }));
    
    try {
      const { response } = await jerryChat(content);
      
      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: response };
      set((state) => ({
        messages: [...state.messages, aiMsg],
        isTyping: false
      }));
    } catch (err) {
      const errorMsg = { id: Date.now() + 1, role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain parts." };
      set((state) => ({
        messages: [...state.messages, errorMsg],
        isTyping: false
      }));
    }
  }
}));

