import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { VoiceInputButton } from '@/components/prescription/VoiceInputButton';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { isRecording, audioBlob, startRecording, stopRecording, clearAudio } = useAudioRecorder();

  // Process audio when recording stops
  useEffect(() => {
    if (audioBlob && !isRecording) {
      transcribeAudio(audioBlob);
    }
  }, [audioBlob, isRecording]);

  const transcribeAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      await new Promise((resolve) => {
        reader.onloadend = resolve;
      });

      const base64Audio = (reader.result as string).split(',')[1];

      // Send to transcription edge function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio, language }
      });

      if (error) throw error;

      if (data?.text) {
        // Append transcript to cursor position
        if (textareaRef.current) {
          const start = textareaRef.current.selectionStart;
          const end = textareaRef.current.selectionEnd;
          const before = value.substring(0, start);
          const after = value.substring(end);
          const newValue = before + data.text + ' ' + after;
          onChange(newValue);
          
          // Set cursor after inserted text
          setTimeout(() => {
            if (textareaRef.current) {
              const newPos = start + data.text.length + 1;
              textareaRef.current.setSelectionRange(newPos, newPos);
              textareaRef.current.focus();
            }
          }, 0);
        }
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription Failed',
        description: error instanceof Error ? error.message : 'Could not transcribe audio',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      clearAudio();
    }
  };

  const handleVoiceToggle = async (lang: 'en-US' | 'bn-BD') => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        setLanguage(lang);
        const success = await startRecording();
        if (!success) {
          toast({
            title: 'Microphone Access Required',
            description: 'Please allow microphone access to use voice input.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Recording Failed',
          description: 'Could not start recording. Please check microphone permissions.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />
      <div className="absolute top-2 right-2">
        <VoiceInputButton
          isListening={isRecording}
          isProcessing={isProcessing}
          onToggle={handleVoiceToggle}
        />
      </div>
      {(isRecording || isProcessing) && (
        <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-2">
          {isProcessing ? (
            <span className="text-xs text-muted-foreground">Processing...</span>
          ) : (
            <>
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
              <span className="text-xs text-muted-foreground">Recording...</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
