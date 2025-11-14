import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  importDosageForms,
  importDrugClasses,
  importManufacturers,
  importGenerics,
  importMedicines
} from "@/utils/importMedicineData";

const DataImport = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const { toast } = useToast();

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    
    try {
      // Import dosage forms
      setStatusMessage("Importing dosage forms...");
      setProgress(10);
      const dosageFormCSV = await fetch('/dosage_form-2.csv').then(r => r.text());
      const dosageCount = await importDosageForms(dosageFormCSV);
      console.log(`Imported ${dosageCount} dosage forms`);

      // Import drug classes
      setStatusMessage("Importing drug classes...");
      setProgress(25);
      const drugClassCSV = await fetch('/drug_class-2.csv').then(r => r.text());
      const drugClassCount = await importDrugClasses(drugClassCSV);
      console.log(`Imported ${drugClassCount} drug classes`);

      // Import manufacturers
      setStatusMessage("Importing manufacturers...");
      setProgress(40);
      const manufacturerCSV = await fetch('/manufacturer-2.csv').then(r => r.text());
      const manufacturerCount = await importManufacturers(manufacturerCSV);
      console.log(`Imported ${manufacturerCount} manufacturers`);

      // Import generics
      setStatusMessage("Importing generics...");
      setProgress(60);
      const genericCSV = await fetch('/generic-2.csv').then(r => r.text());
      const genericCount = await importGenerics(genericCSV);
      console.log(`Imported ${genericCount} generics`);

      // Import medicines
      setStatusMessage("Importing medicines...");
      setProgress(75);
      const medicineCSV = await fetch('/medicine-2.csv').then(r => r.text());
      const medicineCount = await importMedicines(medicineCSV);
      console.log(`Imported ${medicineCount} medicines`);

      setProgress(100);
      setStatusMessage("Import completed!");
      toast({
        title: "Success",
        description: `Imported all data: ${dosageCount} dosage forms, ${drugClassCount} drug classes, ${manufacturerCount} manufacturers, ${genericCount} generics, ${medicineCount} medicines`
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Import failed",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Import Medicine Data</h1>
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Click the button below to import all medicine data from CSV files. This will import:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Dosage Forms</li>
          <li>Drug Classes</li>
          <li>Manufacturers</li>
          <li>Generic Medicines</li>
          <li>Brand Medicines</li>
        </ul>
        
        <Button 
          onClick={handleImport} 
          disabled={importing}
          size="lg"
          className="w-full"
        >
          {importing ? "Importing..." : "Start Import"}
        </Button>
        
        {importing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">{statusMessage}</p>
          </div>
        )}
        
        {progress === 100 && !importing && (
          <p className="text-sm text-center text-green-600 font-medium">{statusMessage}</p>
        )}
      </div>
    </div>
  );
};

export default DataImport;