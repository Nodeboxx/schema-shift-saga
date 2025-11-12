import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DoseSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const commonDoses = [
  "1+0+0 (7 days)",
  "1+0+1 (7 days)",
  "1+1+1 (7 days)",
  "0+0+1 (7 days)",
  "1+0+0 (14 days)",
  "1+0+1 (14 days)",
  "1+1+1 (14 days)",
  "2+0+0 (7 days)",
  "0+1+0 (7 days)",
  "1+0+0 (30 days)",
  "1+0+1 (30 days)",
  "1+1+1 (30 days)",
  "2+2+2 (7 days)",
  "1/2+0+1/2 (7 days)",
  "As needed",
  "Before meals",
  "After meals",
  "At bedtime",
  "Morning only",
  "Evening only",
];

const DoseSelector = ({ value, onChange }: DoseSelectorProps) => {
  const [customMode, setCustomMode] = useState(false);

  return (
    <div style={{ paddingLeft: "15px", marginTop: "5px" }}>
      {customMode ? (
        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter custom dose..."
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "13px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Arial', sans-serif",
            }}
            onBlur={() => {
              if (!value) setCustomMode(false);
            }}
          />
        </div>
      ) : (
        <Select value={value} onValueChange={(val) => {
          if (val === "__custom__") {
            setCustomMode(true);
            onChange("");
          } else {
            onChange(val);
          }
        }}>
          <SelectTrigger 
            className="w-full h-auto py-2"
            style={{
              fontSize: "13px",
              fontWeight: value ? 600 : 400,
              color: value ? "#000" : "#999",
              fontStyle: value ? "normal" : "italic",
              border: "1px solid #ddd",
            }}
          >
            <SelectValue placeholder="→ ডোজ: Select dose..." />
          </SelectTrigger>
          <SelectContent className="bg-background max-h-[300px]">
            {commonDoses.map((dose, idx) => (
              <SelectItem key={idx} value={dose} className="cursor-pointer">
                {dose}
              </SelectItem>
            ))}
            <SelectItem value="__custom__" className="font-semibold text-primary cursor-pointer">
              ✏️ Custom dose...
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default DoseSelector;
