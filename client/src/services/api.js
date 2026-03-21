import axios from 'axios';

// Configure Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Use environment variable or default
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardService = {
  // GET /dashboard
  getDashboardData: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

export const taskService = {
  // POST /task
  createTask: async (taskData) => {
    try {
      const response = await api.post('/task', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }
};

export const chatService = {
  // POST /chat
  sendMessage: async (message) => {
    try {
      const response = await api.post('/chat', { message });
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }
};

export default api;
