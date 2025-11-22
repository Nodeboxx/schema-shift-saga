import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Medicine {
  id: number;
  brand_name: string;
  strength: string;
  icon_url?: string;
  generic_name?: string;
  manufacturer_name?: string;
  generics?: {
    name: string;
  } | null;
  manufacturers?: {
    name: string;
  } | null;
  dosage_forms?: {
    name: string;
    icon_url: string;
  } | null;
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
      if (search.length < 2) {
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
            icon_url,
            generic_name,
            manufacturer_name,
            generics (
              name
            ),
            manufacturers (
              name
            ),
            dosage_forms (
              name,
              icon_url
            )
          `)
          .ilike("brand_name", `%${search}%`)
          .order("brand_name")
          .limit(50);

        if (error) throw error;
        setMedicines(data || []);
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
          className="w-full justify-between font-normal text-left h-auto py-2 px-3"
          style={{ 
            fontSize: "15px",
            fontWeight: value ? 700 : 400,
            fontStyle: value ? "normal" : "italic",
            color: value ? "#000" : "#999"
          }}
        >
          {value || "Search medicine by name..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0 bg-background z-50" align="start">
        <Command>
          <CommandInput 
            placeholder="Type to search medicines..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching..." : search.length < 2 ? "Type at least 2 characters" : "No medicine found"}
            </CommandEmpty>
            <CommandGroup>
              {medicines.map((medicine) => (
                <CommandItem
                  key={medicine.id}
                  value={medicine.brand_name}
                  onSelect={() => {
                    onSelect(medicine);
                    setOpen(false);
                  }}
                  className="flex items-start gap-3 py-3 data-[selected='true']:bg-blue-100 data-[selected=true]:text-blue-900"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 mt-1",
                      value === medicine.brand_name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {(medicine.icon_url || medicine.dosage_forms?.icon_url) && (
                    <img 
                      src={medicine.icon_url || medicine.dosage_forms?.icon_url} 
                      alt={medicine.dosage_forms?.name || "medicine"}
                      className="w-6 h-6 shrink-0 object-contain"
                    />
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="font-bold text-sm">{medicine.brand_name}</div>
                    {(medicine.generic_name || medicine.generics?.name) && (
                      <div className="text-xs text-primary font-medium">
                        {medicine.generic_name || medicine.generics?.name}
                      </div>
                    )}
                    <div className="flex gap-2 items-center text-xs text-muted-foreground flex-wrap">
                      {medicine.strength && <span>{medicine.strength}</span>}
                      {(medicine.manufacturer_name || medicine.manufacturers?.name) && (
                        <>
                          {medicine.strength && <span>•</span>}
                          <span>{medicine.manufacturer_name || medicine.manufacturers?.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MedicineAutocomplete;
