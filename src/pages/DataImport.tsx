import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DataImport = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState("");
  const { toast } = useToast();

  const importData = async (dataType: string, csvData: string) => {
    const { data, error } = await supabase.functions.invoke('import-medicine-data', {
      body: { dataType, csvData }
    });

    if (error) throw error;
    return data;
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      // Import dosage forms
      setProgress("Importing dosage forms...");
      const dosageResponse = await fetch('/user-uploads://dosage_form-2.csv');
      const dosageData = await dosageResponse.text();
      await importData('dosage_forms', dosageData);

      // Import drug classes
      setProgress("Importing drug classes...");
      const drugClassResponse = await fetch('/user-uploads://drug_class-2.csv');
      const drugClassData = await drugClassResponse.text();
      await importData('drug_classes', drugClassData);

      // Import manufacturers
      setProgress("Importing manufacturers...");
      const manufacturerResponse = await fetch('/user-uploads://manufacturer-2.csv');
      const manufacturerData = await manufacturerResponse.text();
      await importData('manufacturers', manufacturerData);

      // Import generics
      setProgress("Importing generics...");
      const genericResponse = await fetch('/user-uploads://generic-2.csv');
      const genericData = await genericResponse.text();
      await importData('generics', genericData);

      // Import medicines
      setProgress("Importing medicines...");
      const medicineResponse = await fetch('/user-uploads://medicine-2.csv');
      const medicineData = await medicineResponse.text();
      await importData('medicines', medicineData);

      setProgress("Import completed!");
      toast({
        title: "Success",
        description: "All data imported successfully"
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Import Medicine Data</h1>
      <div className="space-y-4">
        <p>Click the button below to import all medicine data from CSV files.</p>
        <Button 
          onClick={handleImport} 
          disabled={importing}
          size="lg"
        >
          {importing ? "Importing..." : "Start Import"}
        </Button>
        {progress && <p className="text-sm text-muted-foreground">{progress}</p>}
      </div>
    </div>
  );
};

export default DataImport;