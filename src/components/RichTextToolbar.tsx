import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Highlighter,
  Type,
  Subscript,
  Superscript,
  Minus,
  Plus,
  AlignHorizontalSpaceAround,
  Baseline,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface RichTextToolbarProps {
  onCommand: (command: string, value?: string) => void;
  className?: string;
}

const RichTextToolbar = ({ onCommand, className }: RichTextToolbarProps) => {
  const [fontSize, setFontSize] = useState("13");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffff00");
  const [lineHeight, setLineHeight] = useState("1.5");
  const [letterSpacing, setLetterSpacing] = useState("0");

  // 30+ Professional Fonts
  const fonts = [
    "Arial",
    "Times New Roman",
    "Georgia",
    "Courier New",
    "Verdana",
    "Helvetica",
    "Palatino",
    "Garamond",
    "Bookman",
    "Comic Sans MS",
    "Trebuchet MS",
    "Arial Black",
    "Impact",
    "Lucida Sans",
    "Tahoma",
    "Century Gothic",
    "Lucida Console",
    "Monaco",
    "Consolas",
    "Calibri",
    "Cambria",
    "Candara",
    "Segoe UI",
    "Franklin Gothic Medium",
    "Copperplate",
    "Brush Script MT",
    "Lucida Handwriting",
    "Papyrus",
    "Kalpurush",
    "SolaimanLipi",
    "Noto Sans Bengali",
    "Roboto",
    "Open Sans",
    "Lato",
  ];

  // Font sizes from 1 to 300
  const generateFontSizes = () => {
    const sizes = [];
    // 1-20: every 1px
    for (let i = 1; i <= 20; i++) sizes.push(i);
    // 21-72: every 2px
    for (let i = 22; i <= 72; i += 2) sizes.push(i);
    // 76-200: every 4px
    for (let i = 76; i <= 200; i += 4) sizes.push(i);
    // 208-300: every 8px
    for (let i = 208; i <= 300; i += 8) sizes.push(i);
    return sizes;
  };

  const fontSizes = generateFontSizes();

  const handleFontSize = (value: string) => {
    setFontSize(value);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = value + 'px';
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }
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

  const applyLineHeight = (value: string) => {
    setLineHeight(value);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.lineHeight = value;
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }
  };

  const applyLetterSpacing = (value: string) => {
    setLetterSpacing(value);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.letterSpacing = value + 'px';
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }
  };

  const colors = [
    "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", 
    "#FF00FF", "#00FFFF", "#C0C0C0", "#808080", "#800000", "#808000",
    "#008000", "#800080", "#008080", "#000080", "#FFA500", "#FFC0CB",
    "#FFD700", "#E6E6FA", "#F0E68C", "#DDA0DD", "#F5DEB3", "#FA8072"
  ];

  const highlightColors = [
    "#FFFF00", "#FF6B6B", "#4ECDC4", "#95E1D3", "#F38181", "#FFA07A",
    "#FFD93D", "#6BCF7F", "#C7CEEA", "#FFDAB9", "#E0BBE4", "#B4F8C8",
    "#A0E7E5", "#FFAEBC", "#FBE7C6", "#B4F8C8", "#FFCFDF", "#FEFDCA"
  ];

  return (
    <div className={`flex flex-wrap items-center gap-1 p-3 bg-card border-b border-border shadow-sm ${className}`}>
      {/* Font Family */}
      <Select value={fontFamily} onValueChange={handleFontFamily}>
        <SelectTrigger className="w-[180px] h-9 text-sm bg-background">
          <SelectValue placeholder="Font Family" />
        </SelectTrigger>
        <SelectContent className="z-[9999] bg-background max-h-[400px]">
          {fonts.map((font) => (
            <SelectItem key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size */}
      <Select value={fontSize} onValueChange={handleFontSize}>
        <SelectTrigger className="w-[100px] h-9 text-sm bg-background">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent className="z-[9999] bg-background max-h-[400px]">
          {fontSizes.map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}px
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="h-6 w-px bg-border mx-1" />

      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("bold")}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("italic")}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("underline")}
        title="Underline (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("strikeThrough")}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("subscript")}
        title="Subscript"
      >
        <Subscript className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("superscript")}
        title="Superscript"
      >
        <Superscript className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-muted" title="Text Color">
            <div className="relative">
              <Type className="h-4 w-4" />
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: textColor }} />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 z-[9999] bg-background">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Text Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColor(color)}
                />
              ))}
            </div>
            <Input
              type="color"
              value={textColor}
              onChange={(e) => handleColor(e.target.value)}
              className="w-full h-10"
            />
          </div>
        </PopoverContent>
      </Popover>

      {/* Highlight Color */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-muted" title="Highlight">
            <div className="relative">
              <Highlighter className="h-4 w-4" />
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: bgColor }} />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 z-[9999] bg-background">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Highlight Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {highlightColors.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handleHighlight(color)}
                />
              ))}
            </div>
            <Input
              type="color"
              value={bgColor}
              onChange={(e) => handleHighlight(e.target.value)}
              className="w-full h-10"
            />
          </div>
        </PopoverContent>
      </Popover>

      <div className="h-6 w-px bg-border mx-1" />

      {/* Alignment */}
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("justifyLeft")}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("justifyCenter")}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("justifyRight")}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("justifyFull")}
        title="Justify"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      {/* Lists */}
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("insertUnorderedList")}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("insertOrderedList")}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("indent")}
        title="Increase Indent"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 hover:bg-muted"
        onClick={() => onCommand("outdent")}
        title="Decrease Indent"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      {/* Line Spacing */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-muted" title="Line Spacing">
            <AlignHorizontalSpaceAround className="h-4 w-4 mr-1" />
            <span className="text-xs">{lineHeight}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 z-[9999] bg-background">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Line Spacing</Label>
            <Slider
              value={[parseFloat(lineHeight)]}
              onValueChange={([value]) => applyLineHeight(value.toString())}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">Current: {lineHeight}</div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Letter Spacing */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 px-3 hover:bg-muted" title="Letter Spacing">
            <Baseline className="h-4 w-4 mr-1" />
            <span className="text-xs">{letterSpacing}px</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 z-[9999] bg-background">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Letter Spacing</Label>
            <Slider
              value={[parseFloat(letterSpacing)]}
              onValueChange={([value]) => applyLetterSpacing(value.toString())}
              min={-5}
              max={20}
              step={0.5}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">Current: {letterSpacing}px</div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="h-6 w-px bg-border mx-1" />

      {/* Headings */}
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-3 text-xs hover:bg-muted font-semibold"
        onClick={() => onCommand("formatBlock", "h1")}
        title="Heading 1"
      >
        H1
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-3 text-xs hover:bg-muted font-semibold"
        onClick={() => onCommand("formatBlock", "h2")}
        title="Heading 2"
      >
        H2
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-3 text-xs hover:bg-muted"
        onClick={() => onCommand("formatBlock", "p")}
        title="Paragraph"
      >
        P
      </Button>

      <div className="h-6 w-px bg-border mx-1" />

      {/* Clear Formatting */}
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-3 text-xs hover:bg-muted"
        onClick={() => onCommand("removeFormat")}
        title="Clear Formatting"
      >
        Clear
      </Button>
    </div>
  );
};

export default RichTextToolbar;
