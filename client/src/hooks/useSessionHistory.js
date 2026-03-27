import { useState, useEffect, useCallback } from 'react';
import { englishService } from '../services';
import { useAuthStore } from '../store/authStore';

export default function useSessionHistory() {
  const [sessions, setSessions] = useState([]);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await englishService.getHistory();
      if (data && data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to fetch sessions history', err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, [fetchHistory]);

  const addSession = useCallback((sessionData) => {
    const newSession = {
      date: new Date().toISOString().split('T')[0],
      ...sessionData
    };
    setSessions(prev => [...prev, newSession]);
  }, []);

  const getLastSession = useCallback(() => {
    if (sessions.length < 2) return sessions[sessions.length - 1] || null;
    return sessions[sessions.length - 2];
  }, [sessions]);

  const getLatestSession = useCallback(() => {
    if (sessions.length === 0) return null;
    return sessions[sessions.length - 1];
  }, [sessions]);

  const calculateDeltas = useCallback((currentScore) => {
    const lastSession = getLastSession();
    if (!lastSession) {
      return { overall: 0, fluency: 0, clarity: 0, vocabulary: 0, grammar: 0 };
    }

    return {
      overall: currentScore.overall - (lastSession.overall || 0),
      fluency: currentScore.fluency - (lastSession.fluency || 0),
      clarity: currentScore.clarity - (lastSession.clarity || 0),
      vocabulary: currentScore.vocabulary - (lastSession.vocabulary || 0),
      grammar: currentScore.grammar - (lastSession.grammar || 0),
    };
  }, [getLastSession]);

  return {
    sessions,
    addSession,
    getLastSession,
    getLatestSession,
    calculateDeltas,
    fetchHistory
  };
}
