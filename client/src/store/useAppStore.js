import { create } from 'zustand';
import { dashboardService, taskService, chatService } from '../services';

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
      const data = await dashboardService.getSummary();
      
      set({
        todayScore: data.todayScore,
        streak: data.streak,
        weakArea: data.weaknesses?.[0] || 'None detected',
        weeklyScores: (data.last7DaysLogs || []).map(log => ({
          day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
          score: log.score
        })),
        pendingTasks: data.pendingTasks || [],
        completedTasks: data.completedTasks || [],
        optionalTasks: data.optionalTasks || [],
        patternInsights: data.patternInsights || 'Jerry is refining your neural path...',
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
      const success = await taskService.updateProgress(taskData);
      if (success) {
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

  loadChatHistory: async () => {
    try {
      const data = await chatService.getHistory();
      if (data && data.messages) {
        const mapped = data.messages.map((m, idx) => ({
          id: idx,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp
        }));
        set({ messages: mapped });
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  },

  sendChatMessage: async (content) => {
    const userMsg = { id: Date.now(), role: 'user', content };
    
    set((state) => ({ 
      messages: [...state.messages, userMsg],
      isTyping: true 
    }));
    
    try {
      const data = await chatService.sendMessage(content);
      
      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: data.response };
      set((state) => ({
        messages: [...state.messages, aiMsg],
        isTyping: false
      }));
    } catch {
      const errorMsg = { id: Date.now() + 1, role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain parts." };
      set((state) => ({
        messages: [...state.messages, errorMsg],
        isTyping: false
      }));
    }
  }
}));
