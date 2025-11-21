import { useRef, useState, useEffect } from 'react';
import { VoiceInputButton } from '@/components/prescription/VoiceInputButton';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const { isListening, isProcessing, interimTranscript, toggleListening } = useVoiceRecording({
    language,
    continuous: true,
    onTranscript: (text) => {
      if (contentRef.current) {
        // Insert text at cursor position or end
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        
        if (range && contentRef.current.contains(range.commonAncestorContainer)) {
          // Insert at cursor
          const textNode = document.createTextNode(text + ' ');
          range.deleteContents();
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection?.removeAllRanges();
          selection?.addRange(range);
        } else {
          // Append at end
          contentRef.current.textContent += text + ' ';
        }
        
        // Trigger blur to save
        contentRef.current.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    },
  });

  const handleVoiceToggle = async (lang: 'en-US' | 'bn-BD') => {
    if (!isListening) {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        toast({
          title: 'Not Supported',
          description: 'Voice input is only supported in Chrome, Edge, and Safari browsers.',
          variant: 'destructive',
        });
        return;
      }

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
          isProcessing={isProcessing}
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
          <span>Listening...</span>
        </div>
      )}
    </div>
  );
};
