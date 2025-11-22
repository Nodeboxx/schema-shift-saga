import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[Edge Function] 📨 Request received')
    const { audio, language } = await req.json()
    console.log('[Edge Function] 📊 Request params - language:', language, 'audio length:', audio?.length)
    
    if (!audio) {
      console.error('[Edge Function] ❌ No audio data in request')
      throw new Error('No audio data provided')
    }

    console.log('[Edge Function] 🤖 Processing audio transcription with Lovable AI, language:', language)

    // Prepare prompt based on language
    const languagePrompt = language === 'bn-BD' 
      ? 'Listen carefully to this Bengali/Bangla audio recording and transcribe exactly what is being said in Bengali script (বাংলা). Only return the transcribed Bengali text, nothing else. Do not translate to English.' 
      : 'Listen to this English audio and transcribe exactly what is being said. Return only the transcribed English text, nothing else.'
    
    console.log('[Edge Function] 📝 Using prompt:', languagePrompt)

    // Send to Lovable AI Gateway (using google/gemini-2.5-flash)
    console.log('[Edge Function] 🚀 Sending request to Lovable AI Gateway...')
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: languagePrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:audio/webm;base64,${audio}`
                }
              }
            ]
          }
        ]
      }),
    })
    console.log('[Edge Function] 📥 Response received from AI Gateway, status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Edge Function] ❌ AI Gateway error:', errorText)
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.')
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to your workspace.')
      }
      
      throw new Error(`Lovable AI error: ${errorText}`)
    }

    console.log('[Edge Function] 📖 Parsing AI response...')
    const result = await response.json()
    console.log('[Edge Function] 📋 Full AI response:', JSON.stringify(result, null, 2))
    const transcribedText = result.choices?.[0]?.message?.content || ''
    console.log('[Edge Function] ✅ Transcription successful:', transcribedText)
    console.log('[Edge Function] 📏 Transcription length:', transcribedText.length, 'characters')

    return new Response(
      JSON.stringify({ text: transcribedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Transcription error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
