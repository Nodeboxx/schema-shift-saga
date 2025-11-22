import { useRef, useState } from 'react';
import RichTextToolbar from '@/components/RichTextToolbar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Upload, Code, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface RichHTMLEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichHTMLEditor = ({
  label,
  value,
  onChange,
  placeholder,
  minHeight = '150px'
}: RichHTMLEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isCodeView, setIsCodeView] = useState(false);
  const { toast } = useToast();

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('council-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('council-logos')
        .getPublicUrl(filePath);

      // Insert image at cursor position
      if (editorRef.current) {
        editorRef.current.focus();
        const img = document.createElement('img');
        img.src = data.publicUrl;
        img.style.maxWidth = '200px';
        img.style.height = 'auto';
        img.style.display = 'inline-block';
        img.style.margin = '5px';
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(img);
          range.setStartAfter(img);
          range.setEndAfter(img);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          editorRef.current.appendChild(img);
        }

        onChange(editorRef.current.innerHTML);
      }

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Could not upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCodeView(!isCodeView)}
            className="h-8"
          >
            {isCodeView ? (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Visual
              </>
            ) : (
              <>
                <Code className="w-3 h-3 mr-1" />
                HTML
              </>
            )}
          </Button>
          {!isCodeView && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-8"
            >
              <Upload className="w-3 h-3 mr-1" />
              {uploading ? 'Uploading...' : 'Insert Image'}
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {isCodeView ? (
        <div className="border rounded-lg overflow-hidden bg-background">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-sm p-4 min-h-[150px] resize-y border-0 focus-visible:ring-0"
            style={{ minHeight }}
            placeholder={placeholder}
          />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-background">
          <RichTextToolbar onCommand={handleCommand} className="border-b" />
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onChange(e.currentTarget.innerHTML)}
            onInput={(e) => onChange(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: value }}
            className="p-4 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px]"
            style={{ minHeight }}
            data-placeholder={placeholder}
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {isCodeView 
          ? 'Edit HTML code directly. Switch to Visual mode to use formatting tools.'
          : 'Use the toolbar to format text, add images, and style your content. Switch to HTML mode to edit code.'}
      </p>
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          cursor: text;
        }
      `}</style>
    </div>
  );
};