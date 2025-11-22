import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface VoiceRecordingContextType {
  activeRecorderId: string | null;
  requestRecording: (id: string) => boolean;
  releaseRecording: (id: string) => void;
}

const VoiceRecordingContext = createContext<VoiceRecordingContextType | undefined>(undefined);

export const VoiceRecordingProvider = ({ children }: { children: ReactNode }) => {
  const [activeRecorderId, setActiveRecorderId] = useState<string | null>(null);

  const requestRecording = useCallback((id: string) => {
    if (activeRecorderId && activeRecorderId !== id) {
      console.log('[VoiceRecordingContext] ❌ Recording request denied for', id, '- already active:', activeRecorderId);
      return false;
    }
    console.log('[VoiceRecordingContext] ✅ Recording request granted for', id);
    setActiveRecorderId(id);
    return true;
  }, [activeRecorderId]);

  const releaseRecording = useCallback((id: string) => {
    if (activeRecorderId === id) {
      console.log('[VoiceRecordingContext] 🔓 Recording released for', id);
      setActiveRecorderId(null);
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
