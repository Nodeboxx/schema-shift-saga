import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Medicine {
  id: number;
  brand_name: string;
  strength: string;
  generic_name?: string;
  dosage_form?: string;
  manufacturer?: string;
}

interface MedicineAutocompleteProps {
  value: string;
  onSelect: (medicine: Medicine) => void;
}

const MedicineAutocomplete = ({ value, onSelect }: MedicineAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchMedicines = async () => {
      if (search.length < 1) {
        setMedicines([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("medicines")
          .select(`
            id,
            brand_name,
            strength,
            generics(name),
            dosage_forms(name),
            manufacturers(name)
          `)
          .ilike("brand_name", `${search}%`)
          .order("brand_name")
          .limit(20);

        if (error) throw error;

        const formatted = data?.map((med: any) => ({
          id: med.id,
          brand_name: med.brand_name,
          strength: med.strength || "",
          generic_name: med.generics?.name || "",
          dosage_form: med.dosage_forms?.name || "",
          manufacturer: med.manufacturers?.name || "",
        })) || [];

        setMedicines(formatted);
      } catch (error) {
        console.error("Error searching medicines:", error);
        setMedicines([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchMedicines, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-left h-auto py-2"
          style={{ 
            fontSize: "15px",
            fontWeight: value ? 700 : 400,
            color: value ? "#000" : "#999",
            fontStyle: value ? "normal" : "italic"
          }}
        >
          {value || "Search medicine (type to search...)"}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-background" align="start">
        <Command>
          <CommandInput 
            placeholder="Type medicine name..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching..." : search.length < 1 ? "Type to search medicines" : "No medicine found"}
            </CommandEmpty>
            {medicines.length > 0 && (
              <CommandGroup>
                {medicines.map((medicine) => (
                  <CommandItem
                    key={medicine.id}
                    value={medicine.brand_name}
                    onSelect={() => {
                      onSelect(medicine);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === medicine.brand_name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{medicine.brand_name}</div>
                      {medicine.strength && (
                        <div className="text-xs text-muted-foreground">{medicine.strength}</div>
                      )}
                      {medicine.generic_name && (
                        <div className="text-xs text-muted-foreground">{medicine.generic_name}</div>
                      )}
                    </div>
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

export default MedicineAutocomplete;
