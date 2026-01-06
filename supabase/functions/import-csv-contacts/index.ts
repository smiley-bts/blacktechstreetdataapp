import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is admin
    const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get contacts from request body
    const { contacts } = await req.json();
    
    if (!contacts || !Array.isArray(contacts)) {
      return new Response(JSON.stringify({ error: 'Invalid contacts data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get existing emails to avoid duplicates
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('email, record_id');
    
    const existingEmails = new Set(
      (existingContacts || [])
        .filter(c => c.email)
        .map(c => c.email.toLowerCase())
    );
    const existingRecordIds = new Set(
      (existingContacts || [])
        .filter(c => c.record_id)
        .map(c => c.record_id)
    );

    // Filter out duplicates
    const newContacts = contacts.filter((c: any) => {
      const emailDupe = c.email && existingEmails.has(c.email.toLowerCase());
      const recordIdDupe = c.record_id && existingRecordIds.has(c.record_id);
      return !emailDupe && !recordIdDupe;
    });

    if (newContacts.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        inserted: 0, 
        skipped: contacts.length,
        message: 'All contacts already exist in database' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert in batches of 500
    const batchSize = 500;
    let inserted = 0;
    let errors: string[] = [];

    for (let i = 0; i < newContacts.length; i += batchSize) {
      const batch = newContacts.slice(i, i + batchSize);
      
      const { error: insertError, count } = await supabase
        .from('contacts')
        .insert(batch);

      if (insertError) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`);
      } else {
        inserted += batch.length;
      }
    }

    // Log the activity
    await supabase.rpc('log_activity', {
      _action: 'bulk_import_contacts',
      _details: { 
        total: contacts.length, 
        inserted, 
        skipped: contacts.length - inserted,
        errors: errors.length > 0 ? errors : undefined
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      inserted, 
      skipped: contacts.length - inserted,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
