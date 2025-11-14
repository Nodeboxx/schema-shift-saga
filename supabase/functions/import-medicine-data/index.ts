import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVRow {
  [key: string]: string;
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { dataType, csvData } = await req.json();
    const rows = parseCSV(csvData);

    let result;

    switch (dataType) {
      case 'dosage_forms':
        const dosageForms = rows.map(row => ({
          id: parseInt(row['dosage form id']),
          name: row['dosage form name'],
          slug: row['slug']
        }));
        result = await supabaseClient.from('dosage_forms').upsert(dosageForms, { onConflict: 'id' });
        break;

      case 'drug_classes':
        const drugClasses = rows.map(row => ({
          id: parseInt(row['drug class id']),
          name: row['drug class name'],
          slug: row['slug']
        }));
        result = await supabaseClient.from('drug_classes').upsert(drugClasses, { onConflict: 'id' });
        break;

      case 'manufacturers':
        const manufacturers = rows.map(row => ({
          id: parseInt(row['manufacturer id']),
          name: row['manufacturer name'],
          slug: row['slug']
        }));
        result = await supabaseClient.from('manufacturers').upsert(manufacturers, { onConflict: 'id' });
        break;

      case 'generics':
        const generics = rows.map(row => ({
          id: parseInt(row['generic id']),
          name: row['generic name'],
          slug: row['slug'],
          drug_class_id: row['drug class'] ? parseInt(row['drug class']) : null,
          indication: row['indication'] || null
        }));
        // Process in batches of 500
        for (let i = 0; i < generics.length; i += 500) {
          const batch = generics.slice(i, i + 500);
          await supabaseClient.from('generics').upsert(batch, { onConflict: 'id' });
        }
        result = { data: generics, error: null };
        break;

      case 'medicines':
        const medicines = rows.map(row => {
          // Extract numeric ID from various ID formats
          const brandId = parseInt(row['brand id']);
          return {
            id: brandId,
            brand_name: row['brand name'],
            slug: row['slug'],
            strength: row['strength'] || null,
            package_info: row['package container'] || null,
            generic_id: null, // Will need to map from generic name
            dosage_form_id: null, // Will need to map from dosage form name
            manufacturer_id: null // Will need to map from manufacturer name
          };
        });
        
        // Process in batches of 500
        for (let i = 0; i < medicines.length; i += 500) {
          const batch = medicines.slice(i, i + 500);
          await supabaseClient.from('medicines').upsert(batch, { onConflict: 'id' });
        }
        result = { data: medicines, error: null };
        break;

      default:
        throw new Error('Invalid data type');
    }

    if (result?.error) throw result.error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Imported ${rows.length} ${dataType} records`,
        count: rows.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});