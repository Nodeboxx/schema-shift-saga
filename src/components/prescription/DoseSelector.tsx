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

const tabletDoses = [
  "১+০+১ (খাবারের পরে)",
  "১+১+১ (খাবারের পরে)",
  "০+০+১ (খাবারের পরে)",
  "১+০+০ (খাবারের পরে)",
  "০+১+০ (খাবারের পরে)",
  "১+১+০ (খাবারের পরে)",
  "০+১+১ (খাবারের পরে)",
  "১+০+১ (খাবারের আগে)",
  "১+১+১ (খাবারের আগে)",
  "০+০+১ (খাবারের আগে)",
  "১+০+০ (খাবারের আগে)",
  "০+১+০ (খাবারের আগে)",
  "১+১+০ (খাবারের আগে)",
  "১/২+০+১/২ (খাবারের পরে)",
  "১/২+১/২+১/২ (খাবারের পরে)",
  "২+০+২ (খাবারের পরে)",
  "২+২+২ (খাবারের পরে)",
];

const syrupDoses = [
  "১ চা চামচ দিনে ২ বার (খাবারের পরে)",
  "১ চা চামচ দিনে ৩ বার (খাবারের পরে)",
  "২ চা চামচ দিনে ২ বার (খাবারের পরে)",
  "২ চা চামচ দিনে ৩ বার (খাবারের পরে)",
  "৫ মিলি দিনে ২ বার (খাবারের পরে)",
  "৫ মিলি দিনে ৩ বার (খাবারের পরে)",
  "১০ মিলি দিনে ২ বার (খাবারের পরে)",
  "১০ মিলি দিনে ৩ বার (খাবারের পরে)",
  "১৫ মিলি দিনে ২ বার",
  "১ চা চামচ দিনে ১ বার (রাতে)",
  "২ চা চামচ দিনে ১ বার (রাতে)",
];

const dropDoses = [
  "১ ড্রপ প্রতি চোখে দিনে ২ বার",
  "১ ড্রপ প্রতি চোখে দিনে ৩ বার",
  "১ ড্রপ প্রতি চোখে দিনে ৪ বার",
  "২ ড্রপ প্রতি চোখে দিনে ২ বার",
  "২ ড্রপ প্রতি চোখে দিনে ৩ বার",
  "১ ড্রপ প্রতি কানে দিনে ২ বার",
  "২ ড্রপ প্রতি কানে দিনে ২ বার",
  "২ ড্রপ প্রতি কানে দিনে ৩ বার",
  "১ ড্রপ প্রতি নাকে দিনে ২ বার",
  "২ ড্রপ প্রতি নাকে দিনে ২ বার",
  "২ ড্রপ প্রতি নাকে দিনে ৩ বার",
];

const injectionDoses = [
  "১ অ্যাম্পুল আই.এম দিনে ১ বার",
  "১ অ্যাম্পুল আই.এম দিনে ২ বার",
  "১ অ্যাম্পুল আই.ভি দিনে ১ বার",
  "১ অ্যাম্পুল আই.ভি দিনে ২ বার",
  "১ অ্যাম্পুল আই.ভি দিনে ৩ বার",
  "১ ভায়াল আই.ভি দিনে ১ বার",
  "১ ভায়াল আই.ভি দিনে ২ বার",
  "সাবকিউটেনিয়াস প্রয়োজন অনুযায়ী",
];

const creamDoses = [
  "আক্রান্ত স্থানে দিনে ২ বার লাগাতে হবে",
  "আক্রান্ত স্থানে দিনে ৩ বার লাগাতে হবে",
  "আক্রান্ত স্থানে দিনে ১ বার লাগাতে হবে",
  "প্রয়োজন অনুযায়ী লাগাতে হবে",
  "রাতে ঘুমানোর আগে লাগাতে হবে",
];

const inhalerDoses = [
  "২ পাফ দিনে ২ বার",
  "২ পাফ দিনে ৩ বার",
  "১ পাফ দিনে ২ বার",
  "১ পাফ দিনে ৩ বার",
  "প্রয়োজন অনুযায়ী",
];

const generalDoses = [
  "দিনে ১ বার (সকালে)",
  "দিনে ১ বার (রাতে)",
  "দিনে ২ বার (সকাল ও রাত)",
  "দিনে ৩ বার",
  "সপ্তাহে ১ বার",
  "সপ্তাহে ২ বার",
  "মাসে ১ বার",
  "প্রয়োজন অনুযায়ী",
  "খালি পেটে",
  "ঘুমানোর আগে",
];

const DoseSelector = ({ value, onChange }: DoseSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [dosageForms, setDosageForms] = useState<DosageForm[]>([]);
  const [customDose, setCustomDose] = useState("");

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
      <PopoverContent className="w-[400px] p-0 bg-background z-50" align="start">
        <Command>
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="কাস্টম ডোজ লিখুন..."
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={customDose}
              onChange={(e) => setCustomDose(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customDose.trim()) {
                  onChange(`→ ডোজ: ${customDose.trim()}`);
                  setCustomDose("");
                  setOpen(false);
                }
              }}
            />
            {customDose.trim() && (
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  onChange(`→ ডোজ: ${customDose.trim()}`);
                  setCustomDose("");
                  setOpen(false);
                }}
              >
                কাস্টম ডোজ যোগ করুন
              </Button>
            )}
          </div>
          <CommandInput placeholder="ডোজ খুঁজুন..." />
          <CommandList>
            <CommandEmpty>কোনো ডোজ পাওয়া যায়নি</CommandEmpty>
            
            <CommandGroup heading="ট্যাবলেট/ক্যাপসুল">
              {tabletDoses.map((dose) => (
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

            <CommandGroup heading="সিরাপ">
              {syrupDoses.map((dose) => (
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

            <CommandGroup heading="ড্রপ (চোখ/কান/নাক)">
              {dropDoses.map((dose) => (
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

            <CommandGroup heading="ইনজেকশন">
              {injectionDoses.map((dose) => (
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

            <CommandGroup heading="ক্রিম/অয়েন্টমেন্ট">
              {creamDoses.map((dose) => (
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

            <CommandGroup heading="ইনহেলার">
              {inhalerDoses.map((dose) => (
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

            <CommandGroup heading="সাধারণ">
              {generalDoses.map((dose) => (
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DoseSelector;
