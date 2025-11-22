import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  phoneNumber: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message }: SMSRequest = await req.json();

    console.log('Sending SMS to:', phoneNumber);

    const apiKey = Deno.env.get('BULKSMS_API_KEY');
    const senderId = Deno.env.get('BULKSMS_SENDER_ID');

    if (!apiKey || !senderId) {
      throw new Error('BulkSMS credentials not configured');
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // URL encode the message
    const encodedMessage = encodeURIComponent(message);

    // Build BulkSMS BD API URL
    const apiUrl = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${cleanNumber}&senderid=${senderId}&message=${encodedMessage}`;

    console.log('Calling BulkSMS API...');

    const response = await fetch(apiUrl, {
      method: 'GET',
    });

    const responseText = await response.text();
    console.log('BulkSMS Response:', responseText);

    // Parse response code
    const responseCode = parseInt(responseText.trim());

    // Check for success (202) or handle errors
    const errorMessages: Record<number, string> = {
      202: 'SMS Submitted Successfully',
      1001: 'Invalid Number',
      1002: 'Sender ID not correct/disabled',
      1003: 'Required fields missing',
      1005: 'Internal Error',
      1006: 'Balance Validity Not Available',
      1007: 'Balance Insufficient',
      1011: 'User ID not found',
      1012: 'Masking SMS must be sent in Bengali',
      1013: 'Sender ID not found for Gateway',
      1014: 'Sender Type Name not found',
      1015: 'No valid Gateway found',
      1016: 'Active Price Info not found',
      1017: 'Price Info not found',
      1018: 'Account is disabled',
      1019: 'Sender type price disabled',
      1020: 'Account parent not found',
      1021: 'Parent price not found',
      1031: 'Account Not Verified',
      1032: 'IP Not whitelisted',
    };

    if (responseCode === 202) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'SMS sent successfully',
          code: responseCode
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      const errorMessage = errorMessages[responseCode] || 'Unknown error occurred';
      console.error('SMS Error:', errorMessage, 'Code:', responseCode);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          code: responseCode 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
  } catch (error: any) {
    console.error('Error in send-sms function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
