import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface DosageForm {
  id: number;
  name: string;
}

interface DoseSelectorProps {
  value: string;
  onChange: (dose: string) => void;
}

const commonDoses = [
  "১+০+১ (খাবারের পরে)",
  "১+১+১ (খাবারের পরে)",
  "০+০+১ (খাবারের পরে)",
  "১+০+০ (খাবারের পরে)",
  "০+১+০ (খাবারের পরে)",
  "১+১+০ (খাবারের পরে)",
  "১+০+১ (খাবারের আগে)",
  "১+১+১ (খাবারের আগে)",
  "দিনে ২ বার (সকাল ও রাত)",
  "দিনে ১ বার (রাতে)",
  "দিনে ১ বার (সকালে)",
  "প্রয়োজন অনুযায়ী",
];

const DoseSelector = ({ value, onChange }: DoseSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [dosageForms, setDosageForms] = useState<DosageForm[]>([]);

  useEffect(() => {
    const fetchDosageForms = async () => {
      const { data } = await supabase
        .from("dosage_forms")
        .select("id, name")
        .order("name")
        .limit(20);
      
      if (data) setDosageForms(data);
    };
    
    fetchDosageForms();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-left h-auto py-2 px-3"
          style={{ 
            fontSize: "14px",
            fontWeight: value ? 600 : 400,
            fontStyle: value ? "normal" : "italic",
            color: value ? "#000" : "#999",
            paddingLeft: "15px"
          }}
        >
          {value || "→ ডোজ: Select dose..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 bg-background z-50" align="start">
        <Command>
          <CommandInput placeholder="Search dose..." />
          <CommandList>
            <CommandEmpty>No dose found</CommandEmpty>
            <CommandGroup heading="Common Doses">
              {commonDoses.map((dose) => (
                <CommandItem
                  key={dose}
                  value={dose}
                  onSelect={() => {
                    onChange(`→ ডোজ: ${dose}`);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(dose) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {dose}
                </CommandItem>
              ))}
            </CommandGroup>
            {dosageForms.length > 0 && (
              <CommandGroup heading="Dosage Forms">
                {dosageForms.map((form) => (
                  <CommandItem
                    key={form.id}
                    value={form.name}
                    onSelect={() => {
                      onChange(`→ ${form.name}`);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(form.name) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {form.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DoseSelector;
