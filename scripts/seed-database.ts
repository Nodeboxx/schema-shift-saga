import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface CSVRow {
  [key: string]: string;
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

async function seedDosageForms() {
  console.log('📦 Seeding dosage forms...');
  const csvPath = path.join(process.cwd(), 'public', 'dosage_form-2.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  No dosage forms CSV found, skipping...');
    return;
  }

  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvData);

  const dosageForms = rows.map(row => ({
    slug: row.slug || row.Slug,
    name: row.name || row.Name,
    icon_url: row.icon_url || row['Icon URL'] || null,
  }));

  const { error } = await supabase.from('dosage_forms').upsert(dosageForms, { onConflict: 'slug' });
  
  if (error) {
    console.error('❌ Error seeding dosage forms:', error);
  } else {
    console.log(`✅ Seeded ${dosageForms.length} dosage forms`);
  }
}

async function seedDrugClasses() {
  console.log('💊 Seeding drug classes...');
  const csvPath = path.join(process.cwd(), 'public', 'drug_class-2.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  No drug classes CSV found, skipping...');
    return;
  }

  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvData);

  const drugClasses = rows.map(row => ({
    slug: row.slug || row.Slug,
    name: row.name || row.Name,
  }));

  const { error } = await supabase.from('drug_classes').upsert(drugClasses, { onConflict: 'slug' });
  
  if (error) {
    console.error('❌ Error seeding drug classes:', error);
  } else {
    console.log(`✅ Seeded ${drugClasses.length} drug classes`);
  }
}

async function seedManufacturers() {
  console.log('🏭 Seeding manufacturers...');
  const csvPath = path.join(process.cwd(), 'public', 'manufacturer-2.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  No manufacturers CSV found, skipping...');
    return;
  }

  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvData);

  const manufacturers = rows.map(row => ({
    slug: row.slug || row.Slug,
    name: row.name || row.Name,
  }));

  const { error } = await supabase.from('manufacturers').upsert(manufacturers, { onConflict: 'slug' });
  
  if (error) {
    console.error('❌ Error seeding manufacturers:', error);
  } else {
    console.log(`✅ Seeded ${manufacturers.length} manufacturers`);
  }
}

async function seedGenerics() {
  console.log('🧬 Seeding generics...');
  const csvPath = path.join(process.cwd(), 'public', 'generic-2.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  No generics CSV found, skipping...');
    return;
  }

  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvData);

  // Process in batches of 500
  const batchSize = 500;
  let totalSeeded = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const generics = batch.map(row => ({
      slug: row.slug || row.Slug,
      name: row.name || row.Name,
      indication: row.indication || row.Indication || null,
      drug_class_id: row.drug_class_id || row['Drug Class ID'] || null,
    }));

    const { error } = await supabase.from('generics').upsert(generics, { onConflict: 'slug' });
    
    if (error) {
      console.error(`❌ Error seeding generics batch ${i / batchSize + 1}:`, error);
    } else {
      totalSeeded += generics.length;
      console.log(`✅ Seeded batch ${i / batchSize + 1} (${generics.length} records)`);
    }
  }

  console.log(`✅ Total generics seeded: ${totalSeeded}`);
}

async function seedMedicines() {
  console.log('💉 Seeding medicines...');
  const csvPath = path.join(process.cwd(), 'public', 'medicine-2.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  No medicines CSV found, skipping...');
    return;
  }

  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvData);

  // Process in batches of 500
  const batchSize = 500;
  let totalSeeded = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const medicines = batch.map(row => ({
      slug: row.slug || row.Slug,
      brand_name: row.brand_name || row['Brand Name'],
      generic_name: row.generic_name || row['Generic Name'] || null,
      strength: row.strength || row.Strength || null,
      manufacturer_name: row.manufacturer_name || row['Manufacturer Name'] || null,
      package_info: row.package_info || row['Package Info'] || null,
      dosage_form_id: row.dosage_form_id || row['Dosage Form ID'] || null,
      generic_id: row.generic_id || row['Generic ID'] || null,
      manufacturer_id: row.manufacturer_id || row['Manufacturer ID'] || null,
      icon_url: row.icon_url || row['Icon URL'] || null,
    }));

    const { error } = await supabase.from('medicines').upsert(medicines, { onConflict: 'slug' });
    
    if (error) {
      console.error(`❌ Error seeding medicines batch ${i / batchSize + 1}:`, error);
    } else {
      totalSeeded += medicines.length;
      console.log(`✅ Seeded batch ${i / batchSize + 1} (${medicines.length} records)`);
    }
  }

  console.log(`✅ Total medicines seeded: ${totalSeeded}`);
}

async function main() {
  console.log('🚀 Starting database seeding...\n');

  try {
    await seedDosageForms();
    await seedDrugClasses();
    await seedManufacturers();
    await seedGenerics();
    await seedMedicines();

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
