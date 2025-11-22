import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputButtonProps {
  isListening: boolean;
  isProcessing?: boolean;
  onToggle: () => void;
  className?: string;
}

export const VoiceInputButton = ({ isListening, isProcessing, onToggle, className }: VoiceInputButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`print:hidden ${className || ''}`}
      onClick={onToggle}
      disabled={isProcessing}
      style={{
        padding: '4px 8px',
        height: 'auto',
        minWidth: 'auto',
      }}
    >
      {isProcessing ? (
        <Mic className="h-4 w-4 animate-pulse text-muted-foreground" />
      ) : isListening ? (
        <MicOff className="h-4 w-4 text-red-500 animate-pulse" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};
