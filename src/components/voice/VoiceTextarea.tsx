import { useEffect, useRef, useState, useId } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { VoiceInputButton } from '@/components/prescription/VoiceInputButton';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useVoiceRecordingContext } from '@/contexts/VoiceRecordingContext';

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
  const componentId = useId();
  const [language, setLanguage] = useState<'en-US' | 'bn-BD'>('en-US');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { isRecording, audioBlob, startRecording, stopRecording, clearAudio } = useAudioRecorder();
  const { requestRecording, releaseRecording } = useVoiceRecordingContext();

  // Process audio when recording stops
  useEffect(() => {
    if (audioBlob && !isRecording) {
      console.log('[VoiceTextarea] 🎵 Audio blob ready, starting transcription...');
      transcribeAudio(audioBlob);
    }
  }, [audioBlob, isRecording]);

  // Cleanup: release recording lock when component unmounts or stops recording
  useEffect(() => {
    if (!isRecording) {
      releaseRecording(componentId);
    }
    return () => {
      releaseRecording(componentId);
    };
  }, [isRecording, componentId, releaseRecording]);

  const transcribeAudio = async (blob: Blob) => {
    setIsProcessing(true);
    console.log('[VoiceTextarea] 🔄 Starting transcription process...');
    console.log('[VoiceTextarea] 📊 Blob info - size:', blob.size, 'type:', blob.type);
    
    try {
      // Convert blob to base64
      console.log('[VoiceTextarea] 📝 Converting blob to base64...');
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      await new Promise((resolve) => {
        reader.onloadend = resolve;
      });

      const base64Audio = (reader.result as string).split(',')[1];
      console.log('[VoiceTextarea] ✅ Base64 conversion complete, length:', base64Audio.length);

      // Send to transcription edge function
      console.log('[VoiceTextarea] 🚀 Sending to transcribe-audio edge function, language:', language);
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio, language }
      });

      console.log('[VoiceTextarea] 📥 Response received from edge function');
      console.log('[VoiceTextarea] Response data:', data);
      console.log('[VoiceTextarea] Response error:', error);

      if (error) {
        console.error('[VoiceTextarea] ❌ Edge function error:', error);
        throw error;
      }

      if (data?.text) {
        console.log('[VoiceTextarea] 🎉 Transcription successful:', data.text);
        // Append transcript to cursor position
        if (textareaRef.current) {
          const start = textareaRef.current.selectionStart;
          const end = textareaRef.current.selectionEnd;
          const before = value.substring(0, start);
          const after = value.substring(end);
          const newValue = before + data.text + ' ' + after;
          console.log('[VoiceTextarea] 📝 Inserting text at position', start, 'to', end);
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
      } else {
        console.warn('[VoiceTextarea] ⚠️ No text in response data');
      }
    } catch (error) {
      console.error('[VoiceTextarea] ❌ Transcription error:', error);
      toast({
        title: 'Transcription Failed',
        description: error instanceof Error ? error.message : 'Could not transcribe audio',
        variant: 'destructive',
      });
    } finally {
      console.log('[VoiceTextarea] 🏁 Transcription process complete');
      setIsProcessing(false);
      clearAudio();
    }
  };

  const handleVoiceToggle = async (lang: 'en-US' | 'bn-BD') => {
    if (isRecording) {
      console.log('[VoiceTextarea] 🛑 User clicked to stop recording, component:', componentId);
      stopRecording();
      releaseRecording(componentId);
    } else {
      console.log('[VoiceTextarea] 🎤 User clicked to start recording, language:', lang, 'component:', componentId);
      
      // Check if another recorder is already active
      if (!requestRecording(componentId)) {
        toast({
          title: 'Another Recording Active',
          description: 'Please stop the other recording before starting a new one.',
          variant: 'destructive',
        });
        return;
      }
      
      try {
        setLanguage(lang);
        console.log('[VoiceTextarea] 🌐 Language set to:', lang);
        const success = await startRecording();
        if (!success) {
          console.error('[VoiceTextarea] ❌ Failed to start recording');
          releaseRecording(componentId);
          toast({
            title: 'Microphone Access Required',
            description: 'Please allow microphone access to use voice input.',
            variant: 'destructive',
          });
        } else {
          console.log('[VoiceTextarea] ✅ Recording started successfully');
        }
      } catch (error) {
        console.error('[VoiceTextarea] ❌ Exception during recording start:', error);
        releaseRecording(componentId);
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
