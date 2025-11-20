import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DurationSelectorProps {
  value: string;
  onChange: (duration: string) => void;
}

const generateDurations = (unit: string, unitBengali: string) => {
  const durations = [];
  for (let i = 1; i <= 100; i++) {
    durations.push({ value: `${i} ${unitBengali}`, label: `${i} ${unitBengali}`, number: i, unit });
  }
  return durations;
};

const dayDurations = generateDurations("days", "দিন");
const weekDurations = generateDurations("weeks", "সপ্তাহ");
const monthDurations = generateDurations("months", "মাস");

const DurationSelector = ({ value, onChange }: DurationSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [customDuration, setCustomDuration] = useState("");

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
          {value || "→ সময়কাল: Select duration..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-white dark:bg-gray-800 z-[9999] shadow-lg border" align="start">
        <Command className="bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              📝 কাস্টম সময়কাল লিখুন
            </label>
            <input
              type="text"
              placeholder="যেমনঃ ৭ দিন"
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customDuration.trim()) {
                  onChange(`→ সময়কাল: ${customDuration.trim()}`);
                  setCustomDuration("");
                  setOpen(false);
                }
              }}
            />
            {customDuration.trim() && (
              <Button
                size="sm"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  onChange(`→ সময়কাল: ${customDuration.trim()}`);
                  setCustomDuration("");
                  setOpen(false);
                }}
              >
                ✓ এই সময়কাল ব্যবহার করুন
              </Button>
            )}
          </div>
          <CommandInput placeholder="সময়কাল খুঁজুন..." className="border-b" />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>কোনো সময়কাল পাওয়া যায়নি</CommandEmpty>
            
            <CommandGroup heading="📅 দিন">
              {dayDurations.map((duration) => (
                <CommandItem
                  key={duration.value}
                  value={duration.value}
                  onSelect={() => {
                    onChange(`→ সময়কাল: ${duration.value}`);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(duration.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {duration.label}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="📆 সপ্তাহ">
              {weekDurations.map((duration) => (
                <CommandItem
                  key={duration.value}
                  value={duration.value}
                  onSelect={() => {
                    onChange(`→ সময়কাল: ${duration.value}`);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(duration.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {duration.label}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="🗓️ মাস">
              {monthDurations.map((duration) => (
                <CommandItem
                  key={duration.value}
                  value={duration.value}
                  onSelect={() => {
                    onChange(`→ সময়কাল: ${duration.value}`);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(duration.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {duration.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DurationSelector;
