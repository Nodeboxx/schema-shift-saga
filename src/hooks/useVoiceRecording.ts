import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecordingOptions {
  onTranscript?: (text: string) => void;
  language?: 'en-US' | 'bn-BD';
  continuous?: boolean;
}

export const useVoiceRecording = ({
  onTranscript,
  language = 'en-US',
  continuous = true,
}: UseVoiceRecordingOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const shouldRestartRef = useRef(false);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return false;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Voice recognition started');
        setIsListening(true);
        setIsProcessing(false);
        setInterimTranscript('');
        shouldRestartRef.current = true;
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final && onTranscript) {
          onTranscript(final.trim());
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Don't auto-restart on these errors
        if (event.error === 'not-allowed' || event.error === 'network' || event.error === 'no-speech') {
          shouldRestartRef.current = false;
          setIsListening(false);
          setIsProcessing(false);
          
          if (event.error === 'network') {
            console.error('Network error: Speech recognition service unavailable. Please check your internet connection.');
          }
        }
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
        
        // Only restart if we're supposed to be listening and continuous mode is on
        if (shouldRestartRef.current && continuous && recognitionRef.current) {
          try {
            setTimeout(() => {
              if (recognitionRef.current && shouldRestartRef.current) {
                recognitionRef.current.start();
              }
            }, 100);
          } catch (e) {
            console.error('Error restarting recognition:', e);
            shouldRestartRef.current = false;
            setIsListening(false);
            setIsProcessing(false);
          }
        } else {
          shouldRestartRef.current = false;
          setIsListening(false);
          setIsProcessing(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      shouldRestartRef.current = false;
      setIsListening(false);
      return false;
    }
  }, [language, continuous, onTranscript]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setIsProcessing(false);
    setInterimTranscript('');
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isProcessing,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
  };
};
