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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
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
