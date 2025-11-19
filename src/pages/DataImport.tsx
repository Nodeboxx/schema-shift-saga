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
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleExcelImport = async () => {
    if (!excelFile) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to import",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    setSummary(null);
    const startTime = Date.now();

    try {
      setStatusMessage("Reading Excel file...");
      setProgress(10);
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setStatusMessage("Downloading and caching dosage form icons...");
      setProgress(30);
      
      const result = await importService.importFromExcel(excelFile);
      
      setProgress(100);
      const totalDuration = Date.now() - startTime;

      const importSummary: ImportSummary = {
        dosageForms: result,
        drugClasses: { success: true, message: 'Skipped', imported: 0, updated: 0, skipped: 0, failed: 0, errors: [] },
        manufacturers: { success: true, message: 'Included in Excel', imported: 0, updated: 0, skipped: 0, failed: 0, errors: [] },
        generics: { success: true, message: 'Included in Excel', imported: 0, updated: 0, skipped: 0, failed: 0, errors: [] },
        medicines: { 
          success: result.success, 
          message: result.message, 
          imported: result.imported, 
          updated: result.updated, 
          skipped: result.skipped, 
          failed: result.failed, 
          errors: result.errors 
        },
        totalDuration
      };

      setSummary(importSummary);
      setStatusMessage("Excel import completed!");

      toast({
        title: result.success ? "Import successful" : "Import completed with errors",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setSummary(null);
    const startTime = Date.now();
    
    try {
      setStatusMessage("Importing dosage forms...");
      setProgress(10);
      const dosageFormCSV = await fetch('/dosage_form-2.csv').then(r => r.text());
      const dosageResult = await importService.importDosageForms(dosageFormCSV);

      setStatusMessage("Importing drug classes...");
      setProgress(25);
      const drugClassCSV = await fetch('/drug_class-2.csv').then(r => r.text());
      const drugClassResult = await importService.importDrugClasses(drugClassCSV);

      setStatusMessage("Importing manufacturers...");
      setProgress(40);
      const manufacturerCSV = await fetch('/manufacturer-2.csv').then(r => r.text());
      const manufacturerResult = await importService.importManufacturers(manufacturerCSV);

      setStatusMessage("Importing generics...");
      setProgress(60);
      const genericCSV = await fetch('/generic-2.csv').then(r => r.text());
      const genericResult = await importService.importGenerics(genericCSV);

      setStatusMessage("Importing medicines...");
      setProgress(75);
      const medicineCSV = await fetch('/medicine-2.csv').then(r => r.text());
      const medicineResult = await importService.importMedicines(medicineCSV);

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
          description: "Some records failed to import. Check the summary below.",
          variant: "default"
        });
      } else {
        toast({
          title: "Import successful",
          description: `Successfully imported all data in ${(totalDuration / 1000).toFixed(1)}s`,
        });
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive"
      });
      setStatusMessage("Import failed!");
    } finally {
      setImporting(false);
    }
  };

  const ResultCard = ({ title, result }: { title: string; result: ImportResult }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {result.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive shrink-0" />
          )}
        </div>
        <CardDescription className="text-xs">{result.message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Imported: <span className="font-semibold text-green-600">{result.imported}</span></div>
          <div>Skipped: <span className="font-semibold text-yellow-600">{result.skipped}</span></div>
          <div>Failed: <span className="font-semibold text-destructive">{result.failed}</span></div>
          <div>Updated: <span className="font-semibold text-blue-600">{result.updated}</span></div>
        </div>
        
        {result.errors.length > 0 && (
          <Alert variant="destructive" className="py-2 mt-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              {result.errors.length <= 3 ? (
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {result.errors.map((err, idx) => (
                    <li key={idx}>
                      Row {err.row}, {err.field}: {err.reason}
                    </li>
                  ))}
                </ul>
              ) : (
                `${result.errors.length} errors occurred. First few: ${result.errors.slice(0, 3).map(e => `Row ${e.row}`).join(', ')}`
              )}
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
            <CardTitle>Excel Import (Recommended)</CardTitle>
            <CardDescription>
              Import complete medicine database from Excel file including company names, generic names, brand names, strengths, and dosage form icons.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="excel-file" className="block text-sm font-medium mb-2">
                Select Excel File (.xlsx)
              </label>
              <input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  cursor-pointer border border-input rounded-md p-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Expected columns: image, Quantity, Company Name, Brand Name, Generic Name
              </p>
            </div>

            <Button
              onClick={handleExcelImport}
              disabled={importing || !excelFile}
              size="lg"
              className="w-full"
            >
              {importing ? "Importing..." : "Import from Excel"}
            </Button>

            {importing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">{statusMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV Import (Legacy)</CardTitle>
            <CardDescription>
              Import all medicine data from separate CSV files.
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
              variant="outline"
              className="w-full"
            >
              {importing ? "Importing..." : "Import from CSV Files"}
            </Button>
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
