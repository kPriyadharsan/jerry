import axiosInstance from './axiosInstance';

const voiceService = {
  /** Full analysis pipeline: grammar AI + mistake DB save + topic suggestions */
  analyzeVoice: async (audioData, mimeType, duration, topic, topicId) => {
    const res = await axiosInstance.post('/voice/analyze', {
      audioData,
      mimeType,
      duration,
      topic,
      topicId,
    });
    return res.data;
  },

  /** Get recent mistake logs (for Jerry context or history view) */
  getMistakeLogs: async (limit = 10) => {
    const res = await axiosInstance.get(`/voice/mistakes?limit=${limit}`);
    return res.data;
  },

  /** Get topic practice history */
  getTopicHistory: async () => {
    const res = await axiosInstance.get('/voice/topics');
    return res.data;
  },

  /** Get recommended next topic */
  getNextTopic: async () => {
    const res = await axiosInstance.get('/voice/next-topic');
    return res.data;
  },
};

export default voiceService;
