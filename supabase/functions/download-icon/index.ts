import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { iconUrl, filename } = await req.json();

    if (!iconUrl || !filename) {
      return new Response(
        JSON.stringify({ error: 'iconUrl and filename are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Downloading icon from: ${iconUrl}`);

    // Download the image
    const response = await fetch(iconUrl);
    if (!response.ok) {
      console.error(`Failed to download icon: ${response.status}`);
      return new Response(
        JSON.stringify({ error: `Failed to download icon: ${response.status}`, originalUrl: iconUrl }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageBlob = await response.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Convert to base64
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer))
    );

    console.log(`Successfully downloaded icon: ${filename}`);

    return new Response(
      JSON.stringify({
        success: true,
        filename,
        data: `data:image/png;base64,${base64Image}`,
        size: imageBuffer.byteLength
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error downloading icon:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
