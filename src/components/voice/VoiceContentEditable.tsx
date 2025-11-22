import { useRef, useState, useId, useEffect } from 'react';
import { VoiceInputButton } from '@/components/prescription/VoiceInputButton';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useToast } from '@/hooks/use-toast';
import { useVoiceRecordingContext } from '@/contexts/VoiceRecordingContext';

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
  const componentId = useId();
  const { toast } = useToast();
  const { requestRecording, releaseRecording } = useVoiceRecordingContext();

  const { isListening, toggleListening } = useVoiceRecording({
    language: 'en-US',
    continuous: true,
    onTranscript: (text) => {
      if (contentRef.current) {
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        
        if (range && contentRef.current.contains(range.commonAncestorContainer)) {
          const textNode = document.createTextNode(text + ' ');
          range.deleteContents();
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection?.removeAllRanges();
          selection?.addRange(range);
        } else {
          contentRef.current.textContent += text + ' ';
        }
        
        contentRef.current.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    },
  });

  const handleVoiceToggle = async () => {
    if (!isListening) {
      console.log('[VoiceContentEditable] 🎤 Request to start listening in en-US, component:', componentId);

      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({
          title: 'Not Supported',
          description: 'Voice input is only supported in Chrome, Edge, and Safari browsers.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('[VoiceContentEditable] ✅ Microphone access granted, requesting global lock');
        
        // Register with global context and provide stop callback
        const wasGranted = requestRecording(componentId, () => {
          console.log('[VoiceContentEditable] 🔄 Forced stop from another recorder');
          if (isListening) {
            toggleListening();
          }
        });
        
        if (wasGranted) {
          console.log('[VoiceContentEditable] 🎙️ Starting recognition');
          toggleListening('en-US');
        } else {
          console.log('[VoiceContentEditable] ⚠️ Could not acquire recording lock');
          stream.getTracks().forEach(track => track.stop());
          toast({
            title: 'Voice Input Busy',
            description: 'Another voice input is currently active.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('[VoiceContentEditable] ❌ Microphone permission error:', error);
        releaseRecording(componentId);
        toast({
          title: 'Microphone Access Required',
          description: 'Please allow microphone access to use voice input.',
          variant: 'destructive',
        });
      }
    } else {
      console.log('[VoiceContentEditable] 🛑 Stopping listening for component:', componentId);
      toggleListening();
      releaseRecording(componentId);
    }
  };

  useEffect(() => {
    if (!isListening) {
      releaseRecording(componentId);
    }

    return () => {
      releaseRecording(componentId);
    };
  }, [isListening, componentId, releaseRecording]);

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
          isListening={isListening}
          isProcessing={false}
          onToggle={handleVoiceToggle}
        />
      </div>
      {isListening && (
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
          <span>Listening... (Click mic to stop)</span>
        </div>
      )}
    </div>
  );
};
