import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { importService } from "@/services/importService";
import { ImportSummary, ImportResult } from "@/types/import";

const DataImport = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setSummary(null);
    const startTime = Date.now();
    
    try {
      // Import dosage forms
      setStatusMessage("Importing dosage forms...");
      setProgress(10);
      const dosageFormCSV = await fetch('/dosage_form-2.csv').then(r => r.text());
      const dosageResult = await importService.importDosageForms(dosageFormCSV);
      console.log('Dosage forms result:', dosageResult);

      // Import drug classes
      setStatusMessage("Importing drug classes...");
      setProgress(25);
      const drugClassCSV = await fetch('/drug_class-2.csv').then(r => r.text());
      const drugClassResult = await importService.importDrugClasses(drugClassCSV);
      console.log('Drug classes result:', drugClassResult);

      // Import manufacturers
      setStatusMessage("Importing manufacturers...");
      setProgress(40);
      const manufacturerCSV = await fetch('/manufacturer-2.csv').then(r => r.text());
      const manufacturerResult = await importService.importManufacturers(manufacturerCSV);
      console.log('Manufacturers result:', manufacturerResult);

      // Import generics
      setStatusMessage("Importing generics...");
      setProgress(60);
      const genericCSV = await fetch('/generic-2.csv').then(r => r.text());
      const genericResult = await importService.importGenerics(genericCSV);
      console.log('Generics result:', genericResult);

      // Import medicines
      setStatusMessage("Importing medicines...");
      setProgress(75);
      const medicineCSV = await fetch('/medicine-2.csv').then(r => r.text());
      const medicineResult = await importService.importMedicines(medicineCSV);
      console.log('Medicines result:', medicineResult);

      setProgress(100);
      const totalDuration = Date.now() - startTime;
      
      const importSummary: ImportSummary = {
        dosageForms: dosageResult,
        drugClasses: drugClassResult,
        manufacturers: manufacturerResult,
        generics: genericResult,
        medicines: medicineResult,
        totalDuration
      };
      
      setSummary(importSummary);
      setStatusMessage("Import completed!");
      
      const hasErrors = [dosageResult, drugClassResult, manufacturerResult, genericResult, medicineResult]
        .some(r => !r.success || r.failed > 0);
      
      if (hasErrors) {
        toast({
          title: "Import completed with warnings",
          description: "Some records were skipped. Check the summary below for details.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: `All data imported successfully in ${(totalDuration / 1000).toFixed(1)}s`
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Import failed",
        variant: "destructive"
      });
      setStatusMessage("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const ResultCard = ({ title, result }: { title: string, result: ImportResult }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {result.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          {title}
        </CardTitle>
        <CardDescription className="text-xs">{result.message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Imported:</span>
          <span className="font-medium text-green-600">{result.imported}</span>
        </div>
        {result.skipped > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Skipped:</span>
            <span className="font-medium text-yellow-600">{result.skipped}</span>
          </div>
        )}
        {result.failed > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Failed:</span>
            <span className="font-medium text-red-600">{result.failed}</span>
          </div>
        )}
        {result.errors.length > 0 && result.errors.length <= 3 && (
          <div className="mt-2 space-y-1">
            {result.errors.map((error, idx) => (
              <Alert key={idx} variant="destructive" className="py-2">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  Row {error.row}: {error.reason}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
        {result.errors.length > 3 && (
          <Alert variant="destructive" className="py-2 mt-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              {result.errors.length} errors occurred. Check console for details.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Import Medicine Data</h1>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Import</CardTitle>
            <CardDescription>
              Import all medicine data from CSV files. This will import:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {summary && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Import Summary</h2>
              <span className="text-sm text-muted-foreground">
                Duration: {(summary.totalDuration / 1000).toFixed(1)}s
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultCard title="Dosage Forms" result={summary.dosageForms} />
              <ResultCard title="Drug Classes" result={summary.drugClasses} />
              <ResultCard title="Manufacturers" result={summary.manufacturers} />
              <ResultCard title="Generic Medicines" result={summary.generics} />
              <ResultCard title="Brand Medicines" result={summary.medicines} />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Total imported:</strong>{' '}
                {summary.dosageForms.imported + summary.drugClasses.imported + 
                 summary.manufacturers.imported + summary.generics.imported + 
                 summary.medicines.imported} records
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataImport;