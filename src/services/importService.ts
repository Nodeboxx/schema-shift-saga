import { supabase } from "@/integrations/supabase/client";
import { ImportResult, ImportError, ValidationResult } from "@/types/import";

interface CSVRow {
  [key: string]: string;
}

export class ImportService {
  private parseCSV(csvText: string): CSVRow[] {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const rows: CSVRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
    
    return rows;
  }

  private deduplicateByKey<T extends Record<string, any>>(
    items: T[],
    key: keyof T
  ): { unique: T[], duplicates: number } {
    const seen = new Set<any>();
    const unique: T[] = [];
    let duplicates = 0;

    for (const item of items) {
      const value = item[key];
      if (!seen.has(value)) {
        seen.add(value);
        unique.push(item);
      } else {
        duplicates++;
      }
    }

    return { unique, duplicates };
  }

  async importDosageForms(csvText: string): Promise<ImportResult> {
    const startTime = Date.now();
    const errors: ImportError[] = [];
    
    try {
      const rows = this.parseCSV(csvText);
      const dosageForms = rows.map((row, index) => ({
        id: parseInt(row['dosage form id']),
        name: row['dosage form name'],
        slug: row['slug'],
        _rowIndex: index
      }));
      
      // Validate and deduplicate
      const validForms = dosageForms.filter((item, index) => {
        if (isNaN(item.id) || !item.name || !item.slug) {
          errors.push({
            row: item._rowIndex,
            field: 'id/name/slug',
            value: `${item.id}/${item.name}/${item.slug}`,
            reason: 'Missing required field'
          });
          return false;
        }
        return true;
      });

      const { unique, duplicates } = this.deduplicateByKey(validForms, 'slug');
      
      // Import in batches
      let imported = 0;
      for (let i = 0; i < unique.length; i += 100) {
        const batch = unique.slice(i, i + 100).map(({ _rowIndex, ...item }) => item);
        const { error } = await supabase
          .from('dosage_forms')
          .upsert(batch, { onConflict: 'id' });
        
        if (error) {
          errors.push({
            row: i,
            field: 'batch',
            value: `batch ${i / 100 + 1}`,
            reason: error.message
          });
        } else {
          imported += batch.length;
        }
      }
      
      return {
        success: errors.length === 0,
        message: `Imported ${imported} dosage forms`,
        imported,
        updated: 0,
        skipped: duplicates + (dosageForms.length - validForms.length),
        failed: errors.length,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        imported: 0,
        updated: 0,
        skipped: 0,
        failed: 1,
        errors: [{ row: 0, field: 'general', value: '', reason: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  }

  async importDrugClasses(csvText: string): Promise<ImportResult> {
    const errors: ImportError[] = [];
    
    try {
      const rows = this.parseCSV(csvText);
      const drugClasses = rows.map((row, index) => ({
        id: parseInt(row['drug class id']),
        name: row['drug class name'],
        slug: row['slug'],
        _rowIndex: index
      }));
      
      const validClasses = drugClasses.filter((item) => {
        if (isNaN(item.id) || !item.name || !item.slug) {
          errors.push({
            row: item._rowIndex,
            field: 'id/name/slug',
            value: `${item.id}/${item.name}/${item.slug}`,
            reason: 'Missing required field'
          });
          return false;
        }
        return true;
      });

      const { unique, duplicates } = this.deduplicateByKey(validClasses, 'slug');
      
      let imported = 0;
      for (let i = 0; i < unique.length; i += 100) {
        const batch = unique.slice(i, i + 100).map(({ _rowIndex, ...item }) => item);
        const { error } = await supabase
          .from('drug_classes')
          .upsert(batch, { onConflict: 'id' });
        
        if (error) {
          errors.push({
            row: i,
            field: 'batch',
            value: `batch ${i / 100 + 1}`,
            reason: error.message
          });
        } else {
          imported += batch.length;
        }
      }
      
      return {
        success: errors.length === 0,
        message: `Imported ${imported} drug classes`,
        imported,
        updated: 0,
        skipped: duplicates + (drugClasses.length - validClasses.length),
        failed: errors.length,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        imported: 0,
        updated: 0,
        skipped: 0,
        failed: 1,
        errors: [{ row: 0, field: 'general', value: '', reason: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  }

  async importManufacturers(csvText: string): Promise<ImportResult> {
    const errors: ImportError[] = [];
    
    try {
      const rows = this.parseCSV(csvText);
      const manufacturers = rows.map((row, index) => ({
        id: parseInt(row['manufacturer id']),
        name: row['manufacturer name'],
        slug: row['slug'],
        _rowIndex: index
      }));
      
      const validManufacturers = manufacturers.filter((item) => {
        if (isNaN(item.id) || !item.name || !item.slug) {
          errors.push({
            row: item._rowIndex,
            field: 'id/name/slug',
            value: `${item.id}/${item.name}/${item.slug}`,
            reason: 'Missing required field'
          });
          return false;
        }
        return true;
      });

      const { unique, duplicates } = this.deduplicateByKey(validManufacturers, 'slug');
      
      let imported = 0;
      for (let i = 0; i < unique.length; i += 100) {
        const batch = unique.slice(i, i + 100).map(({ _rowIndex, ...item }) => item);
        const { error } = await supabase
          .from('manufacturers')
          .upsert(batch, { onConflict: 'id' });
        
        if (error) {
          errors.push({
            row: i,
            field: 'batch',
            value: `batch ${i / 100 + 1}`,
            reason: error.message
          });
        } else {
          imported += batch.length;
        }
      }
      
      return {
        success: errors.length === 0,
        message: `Imported ${imported} manufacturers`,
        imported,
        updated: 0,
        skipped: duplicates + (manufacturers.length - validManufacturers.length),
        failed: errors.length,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        imported: 0,
        updated: 0,
        skipped: 0,
        failed: 1,
        errors: [{ row: 0, field: 'general', value: '', reason: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  }

  async importGenerics(csvText: string): Promise<ImportResult> {
    const errors: ImportError[] = [];
    
    try {
      const rows = this.parseCSV(csvText);
      
      // Get drug classes to map names to IDs
      const { data: drugClasses } = await supabase.from('drug_classes').select('id, name');
      const drugClassMap = new Map(drugClasses?.map(d => [d.name.toLowerCase().trim(), d.id]) || []);
      
      const generics = rows.map((row, index) => {
        const id = parseInt(row['generic id']);
        const drugClassName = row['drug class']?.toLowerCase().trim() || '';
        const drugClassId = drugClassName ? drugClassMap.get(drugClassName) : null;
        
        return {
          id,
          name: row['generic name'],
          slug: row['slug'],
          drug_class_id: drugClassId || null,
          indication: row['indication'] || null,
          _rowIndex: index
        };
      });
      
      const validGenerics = generics.filter((item) => {
        if (isNaN(item.id) || !item.name || !item.slug) {
          errors.push({
            row: item._rowIndex,
            field: 'id/name/slug',
            value: `${item.id}/${item.name}/${item.slug}`,
            reason: 'Missing required field'
          });
          return false;
        }
        return true;
      });

      const { unique, duplicates } = this.deduplicateByKey(validGenerics, 'slug');
      
      let imported = 0;
      for (let i = 0; i < unique.length; i += 100) {
        const batch = unique.slice(i, i + 100).map(({ _rowIndex, ...item }) => item);
        const { error } = await supabase
          .from('generics')
          .upsert(batch, { onConflict: 'id' });
        
        if (error) {
          errors.push({
            row: i,
            field: 'batch',
            value: `batch ${i / 100 + 1}`,
            reason: error.message
          });
        } else {
          imported += batch.length;
        }
      }
      
      return {
        success: errors.length === 0,
        message: `Imported ${imported} generics`,
        imported,
        updated: 0,
        skipped: duplicates + (generics.length - validGenerics.length),
        failed: errors.length,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        imported: 0,
        updated: 0,
        skipped: 0,
        failed: 1,
        errors: [{ row: 0, field: 'general', value: '', reason: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  }

  async importMedicines(csvText: string): Promise<ImportResult> {
    const errors: ImportError[] = [];
    
    try {
      const rows = this.parseCSV(csvText);
      
      // Fetch reference data
      const { data: generics } = await supabase.from('generics').select('id, name');
      const { data: dosageForms } = await supabase.from('dosage_forms').select('id, name');
      const { data: manufacturers } = await supabase.from('manufacturers').select('id, name');
      
      const genericMap = new Map(generics?.map(g => [g.name.toLowerCase().trim(), g.id]) || []);
      const dosageMap = new Map(dosageForms?.map(d => [d.name.toLowerCase().trim(), d.id]) || []);
      const manufacturerMap = new Map(manufacturers?.map(m => [m.name.toLowerCase().trim(), m.id]) || []);
      
      const medicines = rows.map((row, index) => {
        const genericName = row['generic']?.toLowerCase().trim() || '';
        const dosageFormName = row['dosage form']?.toLowerCase().trim() || '';
        const manufacturerName = row['manufacturer']?.toLowerCase().trim() || '';
        
        return {
          id: parseInt(row['brand id']),
          brand_name: row['brand name'],
          slug: row['slug'],
          strength: row['strength'] || null,
          package_info: row['package container'] || null,
          generic_id: genericMap.get(genericName) || null,
          dosage_form_id: dosageMap.get(dosageFormName) || null,
          manufacturer_id: manufacturerMap.get(manufacturerName) || null,
          _rowIndex: index,
          _genericName: genericName
        };
      });
      
      // Validate: must have brand name, slug, and generic_id
      const validMedicines = medicines.filter((item) => {
        if (isNaN(item.id)) {
          errors.push({
            row: item._rowIndex,
            field: 'id',
            value: String(item.id),
            reason: 'Invalid ID'
          });
          return false;
        }
        if (!item.brand_name || !item.slug) {
          errors.push({
            row: item._rowIndex,
            field: 'brand_name/slug',
            value: `${item.brand_name}/${item.slug}`,
            reason: 'Missing brand name or slug'
          });
          return false;
        }
        if (!item.generic_id) {
          errors.push({
            row: item._rowIndex,
            field: 'generic',
            value: item._genericName,
            reason: `Generic "${item._genericName}" not found in database`
          });
          return false;
        }
        return true;
      });

      // Deduplicate by slug
      const { unique, duplicates } = this.deduplicateByKey(validMedicines, 'slug');
      
      let imported = 0;
      for (let i = 0; i < unique.length; i += 100) {
        const batch = unique.slice(i, i + 100).map(({ _rowIndex, _genericName, ...item }) => item);
        const { error } = await supabase
          .from('medicines')
          .upsert(batch, { onConflict: 'id' });
        
        if (error) {
          errors.push({
            row: i,
            field: 'batch',
            value: `batch ${i / 100 + 1}`,
            reason: error.message
          });
        } else {
          imported += batch.length;
        }
      }
      
      return {
        success: errors.length === 0,
        message: `Imported ${imported} medicines`,
        imported,
        updated: 0,
        skipped: duplicates + (medicines.length - validMedicines.length),
        failed: errors.length,
        errors
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        imported: 0,
        updated: 0,
        skipped: 0,
        failed: 1,
        errors: [{ row: 0, field: 'general', value: '', reason: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  }
}

export const importService = new ImportService();
