import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      console.log('[AudioRecorder] 🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[AudioRecorder] ✅ Microphone access granted');
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      console.log('[AudioRecorder] 📝 MediaRecorder created with mimeType: audio/webm');

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('[AudioRecorder] 📦 Audio chunk received, size:', event.data.size, 'bytes');
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        console.log('[AudioRecorder] 🛑 Recording stopped. Total chunks:', chunksRef.current.length);
        console.log('[AudioRecorder] 📊 Final blob size:', blob.size, 'bytes, type:', blob.type);
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        console.log('[AudioRecorder] 🔇 Microphone stream stopped');
      };

      mediaRecorder.start();
      console.log('[AudioRecorder] ▶️ Recording started');
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      return true;
    } catch (error) {
      console.error('[AudioRecorder] ❌ Error starting recording:', error);
      return false;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('[AudioRecorder] ⏹️ Stopping recording...');
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  const clearAudio = useCallback(() => {
    setAudioBlob(null);
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    clearAudio,
  };
};
