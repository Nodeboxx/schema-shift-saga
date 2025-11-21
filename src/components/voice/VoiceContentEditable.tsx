import { useRef, useState, useEffect } from 'react';
import { VoiceInputButton } from '@/components/prescription/VoiceInputButton';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceContentEditableProps {
  value: string;
  onBlur: (value: string) => void;
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;
  onInput?: (e: React.FormEvent<HTMLDivElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const VoiceContentEditable = ({
  value,
  onBlur,
  style,
  className,
  placeholder,
  onInput,
  onKeyDown,
}: VoiceContentEditableProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
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
        // Insert transcribed text into content editable
        if (contentRef.current) {
          const selection = window.getSelection();
          const range = selection?.getRangeAt(0);
          
          if (range && contentRef.current.contains(range.commonAncestorContainer)) {
            const textNode = document.createTextNode(data.text + ' ');
            range.deleteContents();
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection?.removeAllRanges();
            selection?.addRange(range);
          } else {
            contentRef.current.textContent += data.text + ' ';
          }
          
          // Trigger blur to save
          contentRef.current.dispatchEvent(new Event('blur', { bubbles: true }));
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
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onBlur(e.currentTarget.innerHTML)}
        onInput={onInput}
        onKeyDown={onKeyDown}
        dangerouslySetInnerHTML={{ __html: value }}
        style={style}
        className={className}
      />
      <div
        className="no-print"
        style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          zIndex: 10,
        }}
      >
        <VoiceInputButton
          isListening={isRecording}
          isProcessing={isProcessing}
          onToggle={handleVoiceToggle}
        />
      </div>
      {(isRecording || isProcessing) && (
        <div
          className="no-print"
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '8px',
            color: '#666',
          }}
        >
          {isProcessing ? (
            <span>Processing...</span>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '2px',
                      height: `${Math.random() * 8 + 3}px`,
                      background: '#0056b3',
                      borderRadius: '1px',
                      animation: 'pulse 0.8s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <span>Recording...</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
