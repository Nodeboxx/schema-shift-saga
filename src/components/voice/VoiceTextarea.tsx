import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { VoiceInputButton } from '@/components/prescription/VoiceInputButton';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useToast } from '@/hooks/use-toast';

interface VoiceTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const VoiceTextarea = ({
  value,
  onChange,
  placeholder,
  className,
  rows = 4,
}: VoiceTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [language, setLanguage] = useState<'en-US' | 'bn-BD'>('en-US');
  const { toast } = useToast();

  const { isListening, isProcessing, interimTranscript, toggleListening } = useVoiceRecording({
    language,
    continuous: true,
    onTranscript: (text) => {
      // Append transcript to cursor position
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const before = value.substring(0, start);
        const after = value.substring(end);
        const newValue = before + text + ' ' + after;
        onChange(newValue);
        
        // Set cursor after inserted text
        setTimeout(() => {
          if (textareaRef.current) {
            const newPos = start + text.length + 1;
            textareaRef.current.setSelectionRange(newPos, newPos);
            textareaRef.current.focus();
          }
        }, 0);
      }
    },
  });

  const handleVoiceToggle = async (lang: 'en-US' | 'bn-BD') => {
    if (!isListening) {
      // Check browser support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({
          title: 'Not Supported',
          description: 'Voice input is only supported in Chrome, Edge, and Safari browsers.',
          variant: 'destructive',
        });
        return;
      }

      // Request microphone permission first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setLanguage(lang);
        setTimeout(() => toggleListening(), 100);
      } catch (error) {
        toast({
          title: 'Microphone Access Required',
          description: 'Please allow microphone access to use voice input.',
          variant: 'destructive',
        });
      }
    } else {
      toggleListening();
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value + (interimTranscript ? ' ' + interimTranscript : '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />
      <div className="absolute top-2 right-2">
        <VoiceInputButton
          isListening={isListening}
          isProcessing={isProcessing}
          onToggle={handleVoiceToggle}
        />
      </div>
      {isListening && (
        <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 12 + 4}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Listening...</span>
        </div>
      )}
    </div>
  );
};
