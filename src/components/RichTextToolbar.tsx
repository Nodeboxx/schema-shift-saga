import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Highlighter,
  Type,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RichTextToolbarProps {
  onCommand: (command: string, value?: string) => void;
  className?: string;
}

const RichTextToolbar = ({ onCommand, className }: RichTextToolbarProps) => {
  const [fontSize, setFontSize] = useState("13px");
  const [fontFamily, setFontFamily] = useState("inherit");
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffff00");

  const handleFontSize = (value: string) => {
    setFontSize(value);
    onCommand("fontSize", value);
  };

  const handleFontFamily = (value: string) => {
    setFontFamily(value);
    onCommand("fontName", value);
  };

  const handleColor = (color: string) => {
    setTextColor(color);
    onCommand("foreColor", color);
  };

  const handleHighlight = (color: string) => {
    setBgColor(color);
    onCommand("hiliteColor", color);
  };

  return (
    <div className={`flex flex-wrap items-center gap-1 p-2 bg-muted/30 rounded-md border ${className}`}>
      <Select value={fontFamily} onValueChange={handleFontFamily}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Arial">Arial</SelectItem>
          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          <SelectItem value="Georgia">Georgia</SelectItem>
          <SelectItem value="Courier New">Courier New</SelectItem>
          <SelectItem value="Verdana">Verdana</SelectItem>
          <SelectItem value="Kalpurush">Kalpurush (Bengali)</SelectItem>
        </SelectContent>
      </Select>

      <Select value={fontSize} onValueChange={handleFontSize}>
        <SelectTrigger className="w-[80px] h-8 text-xs">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10px">10px</SelectItem>
          <SelectItem value="12px">12px</SelectItem>
          <SelectItem value="13px">13px</SelectItem>
          <SelectItem value="14px">14px</SelectItem>
          <SelectItem value="16px">16px</SelectItem>
          <SelectItem value="18px">18px</SelectItem>
          <SelectItem value="20px">20px</SelectItem>
          <SelectItem value="24px">24px</SelectItem>
        </SelectContent>
      </Select>

      <div className="h-6 w-px bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onCommand("bold")}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onCommand("italic")}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onCommand("underline")}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Text Color">
            <Type className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-6 gap-2">
            {["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#808080", "#800000", "#008000", "#000080", "#808000"].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => handleColor(color)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Highlight">
            <Highlighter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-6 gap-2">
            {["#FFFF00", "#FF6B6B", "#4ECDC4", "#95E1D3", "#F38181", "#FFA07A", "#FFD93D", "#6BCF7F", "#C7CEEA", "#FFDAB9", "#E0BBE4", "#FFFFFF"].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => handleHighlight(color)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="h-6 w-px bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onCommand("justifyLeft")}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onCommand("justifyCenter")}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onCommand("justifyRight")}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onCommand("justifyFull")}
        title="Justify"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onCommand("insertUnorderedList")}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onCommand("insertOrderedList")}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => onCommand("formatBlock", "h1")}
        title="Heading 1"
      >
        H1
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => onCommand("formatBlock", "h2")}
        title="Heading 2"
      >
        H2
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={() => onCommand("formatBlock", "p")}
        title="Paragraph"
      >
        P
      </Button>
    </div>
  );
};

export default RichTextToolbar;
