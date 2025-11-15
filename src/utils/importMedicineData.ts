import { supabase } from "@/integrations/supabase/client";

interface CSVRow {
  [key: string]: string;
}

function parseCSV(csvText: string): CSVRow[] {
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

export async function importDosageForms(csvText: string) {
  const rows = parseCSV(csvText);
  const dosageForms = rows.map(row => ({
    id: parseInt(row['dosage form id']),
    name: row['dosage form name'],
    slug: row['slug']
  }));
  
  for (let i = 0; i < dosageForms.length; i += 100) {
    const batch = dosageForms.slice(i, i + 100);
    const { error } = await supabase
      .from('dosage_forms')
      .upsert(batch, { onConflict: 'id' });
    if (error) throw error;
  }
  
  return dosageForms.length;
}

export async function importDrugClasses(csvText: string) {
  const rows = parseCSV(csvText);
  const drugClasses = rows.map(row => ({
    id: parseInt(row['drug class id']),
    name: row['drug class name'],
    slug: row['slug']
  }));
  
  for (let i = 0; i < drugClasses.length; i += 100) {
    const batch = drugClasses.slice(i, i + 100);
    const { error } = await supabase
      .from('drug_classes')
      .upsert(batch, { onConflict: 'id' });
    if (error) throw error;
  }
  
  return drugClasses.length;
}

export async function importManufacturers(csvText: string) {
  const rows = parseCSV(csvText);
  const manufacturers = rows.map(row => ({
    id: parseInt(row['manufacturer id']),
    name: row['manufacturer name'],
    slug: row['slug']
  }));
  
  for (let i = 0; i < manufacturers.length; i += 100) {
    const batch = manufacturers.slice(i, i + 100);
    const { error } = await supabase
      .from('manufacturers')
      .upsert(batch, { onConflict: 'id' });
    if (error) throw error;
  }
  
  return manufacturers.length;
}

export async function importGenerics(csvText: string) {
  const rows = parseCSV(csvText);
  const generics = rows
    .map(row => {
      const id = parseInt(row['generic id']);
      const drugClassId = row['drug class'] ? parseInt(row['drug class']) : null;
      return {
        id,
        name: row['generic name'],
        slug: row['slug'],
        drug_class_id: isNaN(drugClassId as number) ? null : drugClassId,
        indication: row['indication'] || null
      };
    })
    .filter(item => !isNaN(item.id) && item.name && item.slug); // Filter out invalid rows
  
  for (let i = 0; i < generics.length; i += 100) {
    const batch = generics.slice(i, i + 100);
    const { error } = await supabase
      .from('generics')
      .upsert(batch, { onConflict: 'id' });
    if (error) throw error;
  }
  
  return generics.length;
}

export async function importMedicines(csvText: string) {
  const rows = parseCSV(csvText);
  
  // First, get all generic names, dosage forms, and manufacturers to create ID maps
  const { data: generics } = await supabase.from('generics').select('id, name');
  const { data: dosageForms } = await supabase.from('dosage_forms').select('id, name');
  const { data: manufacturers } = await supabase.from('manufacturers').select('id, name');
  
  const genericMap = new Map(generics?.map(g => [g.name.toLowerCase(), g.id]) || []);
  const dosageMap = new Map(dosageForms?.map(d => [d.name.toLowerCase(), d.id]) || []);
  const manufacturerMap = new Map(manufacturers?.map(m => [m.name.toLowerCase(), m.id]) || []);
  
  const medicines = rows
    .map(row => {
      const genericName = row['generic']?.toLowerCase() || '';
      const dosageFormName = row['dosage form']?.toLowerCase() || '';
      const manufacturerName = row['manufacturer']?.toLowerCase() || '';
      
      return {
        id: parseInt(row['brand id']),
        brand_name: row['brand name'],
        slug: row['slug'],
        strength: row['strength'] || null,
        package_info: row['package container'] || null,
        generic_id: genericMap.get(genericName) || null,
        dosage_form_id: dosageMap.get(dosageFormName) || null,
        manufacturer_id: manufacturerMap.get(manufacturerName) || null
      };
    })
    .filter(item => !isNaN(item.id) && item.brand_name && item.slug); // Filter out invalid rows
  
  for (let i = 0; i < medicines.length; i += 100) {
    const batch = medicines.slice(i, i + 100);
    const { error } = await supabase
      .from('medicines')
      .upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Error at batch ${i}:`, error);
      throw error;
    }
  }
  
  return medicines.length;
}