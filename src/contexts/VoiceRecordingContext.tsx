import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

interface VoiceRecordingContextType {
  activeRecorderId: string | null;
  requestRecording: (id: string, stopCallback: () => void) => boolean;
  releaseRecording: (id: string) => void;
}

const VoiceRecordingContext = createContext<VoiceRecordingContextType | undefined>(undefined);

export const VoiceRecordingProvider = ({ children }: { children: ReactNode }) => {
  const [activeRecorderId, setActiveRecorderId] = useState<string | null>(null);
  const stopCallbackRef = useRef<(() => void) | null>(null);

  const requestRecording = useCallback((id: string, stopCallback: () => void) => {
    if (activeRecorderId && activeRecorderId !== id) {
      console.log('[VoiceRecordingContext] ❌ Another recorder active:', activeRecorderId, '- stopping it before starting', id);
      // Stop the current active recorder
      if (stopCallbackRef.current) {
        stopCallbackRef.current();
      }
    }
    console.log('[VoiceRecordingContext] ✅ Recording request granted for', id);
    setActiveRecorderId(id);
    stopCallbackRef.current = stopCallback;
    return true;
  }, [activeRecorderId]);

  const releaseRecording = useCallback((id: string) => {
    if (activeRecorderId === id) {
      console.log('[VoiceRecordingContext] 🔓 Recording released for', id);
      setActiveRecorderId(null);
      stopCallbackRef.current = null;
    }
  }, [activeRecorderId]);

  return (
    <VoiceRecordingContext.Provider value={{ activeRecorderId, requestRecording, releaseRecording }}>
      {children}
    </VoiceRecordingContext.Provider>
  );
};

export const useVoiceRecordingContext = () => {
  const context = useContext(VoiceRecordingContext);
  if (!context) {
    throw new Error('useVoiceRecordingContext must be used within VoiceRecordingProvider');
  }
  return context;
};
