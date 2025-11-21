import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VoiceInputButtonProps {
  isListening: boolean;
  isProcessing?: boolean;
  onToggle: (language: 'en-US' | 'bn-BD') => void;
  className?: string;
}

export const VoiceInputButton = ({ isListening, isProcessing, onToggle, className }: VoiceInputButtonProps) => {
  // If already listening, show stop button instead of dropdown
  if (isListening || isProcessing) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`print:hidden ${className || ''}`}
        onClick={() => onToggle('en-US')} // Language doesn't matter for stop
        disabled={isProcessing}
        style={{
          padding: '4px 8px',
          height: 'auto',
          minWidth: 'auto',
        }}
      >
        {isProcessing ? (
          <Mic className="h-4 w-4 animate-pulse text-muted-foreground" />
        ) : (
          <MicOff className="h-4 w-4 text-red-500 animate-pulse" />
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`print:hidden ${className || ''}`}
          style={{
            padding: '4px 8px',
            height: 'auto',
            minWidth: 'auto',
          }}
        >
          <Mic className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onToggle('en-US')}>
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle('bn-BD')}>
          🇧🇩 বাংলা
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
