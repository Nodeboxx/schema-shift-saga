import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PatientInfoBarProps {
  patientInfo: {
    patientDate: string;
    patientName: string;
    patientAge: string;
    patientAgeYears?: string;
    patientAgeMonths?: string;
    patientAgeDays?: string;
    patientSex: string;
    patientWeight: string;
    patientWeightKg?: string;
    patientWeightGrams?: string;
  };
  setPatientInfo: (info: any) => void;
}

const PatientInfoBar = ({ patientInfo, setPatientInfo }: PatientInfoBarProps) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const handleEdit = (field: string, value: string) => {
    setPatientInfo({ ...patientInfo, [field]: value });
  };

  const handleAgeChange = (field: string, value: string) => {
    const updates = { ...patientInfo, [field]: value };
    
    const years = field === "patientAgeYears" ? value : (updates.patientAgeYears || "0");
    const months = field === "patientAgeMonths" ? value : (updates.patientAgeMonths || "0");
    const days = field === "patientAgeDays" ? value : (updates.patientAgeDays || "0");
    
    const parts = [];
    if (years !== "0") parts.push(`${years}y`);
    if (months !== "0") parts.push(`${months}m`);
    if (days !== "0") parts.push(`${days}d`);
    
    updates.patientAge = parts.join(' ') || '0y';
    setPatientInfo(updates);
  };

  const handleWeightChange = (field: string, value: string) => {
    const updates = { ...patientInfo, [field]: value };
    
    const kg = field === "patientWeightKg" ? value : (updates.patientWeightKg || "0");
    const grams = field === "patientWeightGrams" ? value : (updates.patientWeightGrams || "0");
    
    const parts = [];
    if (kg !== "0") parts.push(`${kg}kg`);
    if (grams !== "0") parts.push(`${grams}g`);
    
    updates.patientWeight = parts.join(' ') || '0kg';
    setPatientInfo(updates);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "dd/MM/yyyy");
      setPatientInfo({ ...patientInfo, patientDate: formattedDate });
      setDatePickerOpen(false);
    }
  };

  // Parse the current date string to Date object
  const parseDate = (dateStr: string): Date => {
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
      }
    } catch (e) {
      // ignore
    }
    return new Date();
  };

  const currentDate = parseDate(patientInfo.patientDate);

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "12px",
      fontWeight: 600,
      padding: "6px 10px",
      borderBottom: "1px solid #eee",
      gap: "8px",
      width: "100%",
      boxSizing: "border-box",
    }}>
      <span style={{ display: "flex", gap: "3px", alignItems: "center", fontSize: "11px", whiteSpace: "nowrap" }} className="no-print">
        Date:{" "}
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-6 px-1.5 text-xs font-semibold border-gray-300 hover:bg-gray-50",
                !patientInfo.patientDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              {patientInfo.patientDate || "Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 z-[9999]" align="start">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={handleDateSelect}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </span>
      
      <span className="print:inline hidden" style={{ fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
        Date: {patientInfo.patientDate}
      </span>
      
      <span style={{ display: "flex", gap: "3px", alignItems: "center", fontSize: "11px", flex: 1, minWidth: 0 }}>
        Name:{" "}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("patientName", e.currentTarget.textContent || "")}
          style={{ minWidth: "100px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {patientInfo.patientName}
        </div>
      </span>
      
      <span style={{ display: "flex", gap: "2px", alignItems: "center", fontSize: "11px", whiteSpace: "nowrap" }} className="no-print">
        Age:{" "}
        <Select value={patientInfo.patientAgeYears || "0"} onValueChange={(v) => handleAgeChange("patientAgeYears", v)}>
          <SelectTrigger className="h-6 w-12 text-[10px] bg-white px-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="pointer-events-auto bg-white z-[9999] max-h-60">
            {Array.from({ length: 121 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>{i}y</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={patientInfo.patientAgeMonths || "0"} onValueChange={(v) => handleAgeChange("patientAgeMonths", v)}>
          <SelectTrigger className="h-6 w-12 text-[10px] bg-white px-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="pointer-events-auto bg-white z-[9999]">
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>{i}m</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={patientInfo.patientAgeDays || "0"} onValueChange={(v) => handleAgeChange("patientAgeDays", v)}>
          <SelectTrigger className="h-6 w-12 text-[10px] bg-white px-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="pointer-events-auto bg-white z-[9999]">
            {Array.from({ length: 31 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>{i}d</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </span>
      
      <span className="print:inline hidden" style={{ fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
        Age: {patientInfo.patientAge}
      </span>
      
      <span style={{ display: "flex", gap: "2px", alignItems: "center", fontSize: "11px", whiteSpace: "nowrap" }} className="no-print">
        Sex:{" "}
        <Select value={patientInfo.patientSex || ""} onValueChange={(v) => handleEdit("patientSex", v)}>
          <SelectTrigger className="h-6 w-16 text-[10px] bg-white px-1">
            <SelectValue placeholder="Sex" />
          </SelectTrigger>
          <SelectContent className="pointer-events-auto bg-white z-[9999]">
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
      </span>
      
      <span className="print:inline hidden" style={{ fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
        Sex: {patientInfo.patientSex}
      </span>
      
      <span style={{ display: "flex", gap: "2px", alignItems: "center", fontSize: "11px", whiteSpace: "nowrap" }} className="no-print">
        Wt:{" "}
        <Select value={patientInfo.patientWeightKg || "0"} onValueChange={(v) => handleWeightChange("patientWeightKg", v)}>
          <SelectTrigger className="h-6 w-14 text-[10px] bg-white px-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="pointer-events-auto bg-white z-[9999] max-h-60">
            {Array.from({ length: 201 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>{i}kg</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={patientInfo.patientWeightGrams || "0"} onValueChange={(v) => handleWeightChange("patientWeightGrams", v)}>
          <SelectTrigger className="h-6 w-14 text-[10px] bg-white px-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="pointer-events-auto bg-white z-[9999] max-h-60">
            {Array.from({ length: 1000 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>{i}g</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </span>
      
      <span className="print:inline hidden" style={{ fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
        Weight: {patientInfo.patientWeight}
      </span>
    </div>
  );
};

export default PatientInfoBar;
