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
        if (event.error === 'not-allowed') {
          console.error('Microphone permission denied');
        }
        setIsListening(false);
        setIsProcessing(false);
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
        if (isListening && continuous) {
          // Auto-restart if continuous mode
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
            setIsProcessing(false);
          }
        } else {
          setIsListening(false);
          setIsProcessing(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      return false;
    }
  }, [language, continuous, onTranscript, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      setIsProcessing(false);
      setInterimTranscript('');
    }
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
