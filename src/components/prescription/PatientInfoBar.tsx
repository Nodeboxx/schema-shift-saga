import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PatientInfoBarProps {
  patientInfo: {
    patientDate: string;
    patientName: string;
    patientAge: string;
    patientSex: string;
    patientWeight: string;
  };
  setPatientInfo: (info: any) => void;
}

const PatientInfoBar = ({ patientInfo, setPatientInfo }: PatientInfoBarProps) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const handleEdit = (field: string, value: string) => {
    setPatientInfo({ ...patientInfo, [field]: value });
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
      fontSize: "14px",
      fontWeight: 600,
      padding: "8px 15px",
      borderBottom: "1px solid #eee",
    }}>
      <span style={{ display: "flex", gap: "5px", alignItems: "center" }} className="no-print">
        Date:{" "}
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-7 px-2 text-sm font-semibold border-gray-300 hover:bg-gray-50",
                !patientInfo.patientDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {patientInfo.patientDate || "Select date"}
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
      <span style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        Name:{" "}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("patientName", e.currentTarget.textContent || "")}
          style={{ minWidth: "200px" }}
        >
          {patientInfo.patientName}
        </div>
      </span>
      <span style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        Age:{" "}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("patientAge", e.currentTarget.textContent || "")}
          style={{ minWidth: "50px" }}
        >
          {patientInfo.patientAge}
        </div>
      </span>
      <span style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        Sex:{" "}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("patientSex", e.currentTarget.textContent || "")}
          style={{ minWidth: "50px" }}
        >
          {patientInfo.patientSex}
        </div>
      </span>
      <span style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        Weight:{" "}
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => handleEdit("patientWeight", e.currentTarget.textContent || "")}
          style={{ minWidth: "50px" }}
        >
          {patientInfo.patientWeight}
        </div>
      </span>
    </div>
  );
};

export default PatientInfoBar;
