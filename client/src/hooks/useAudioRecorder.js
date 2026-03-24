import { useState, useRef, useCallback } from 'react';

export default function useAudioRecorder(onAudioReady) {
  const [recorderState, setRecorderState] = useState('idle'); // 'idle' | 'recording' | 'processing' | 'results'
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const [isPaused, setIsPaused] = useState(false);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        setRecorderState('processing');
        const actualMimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: actualMimeType });
        if (onAudioReady) {
           onAudioReady(blob, actualMimeType);
        }
      };

      mediaRecorder.start();
      setRecorderState('recording');
      setIsPaused(false);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }, [onAudioReady]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    setIsPaused(false);
  }, []);

  const resetState = useCallback(() => {
    setRecorderState('idle');
    setIsPaused(false);
  }, []);

  return {
    recorderState,
    setRecorderState,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isPaused,
    resetState,
    analyserRef,
  };
}
