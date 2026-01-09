import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AttendanceRecord {
  name: string;
  email?: string;
  event: string;
}

interface SyncResult {
  matched: { name: string; email?: string; contactId: string; event: string }[];
  unmatched: { name: string; email?: string; event: string }[];
  updated: number;
  errors: string[];
}

// Normalize name for comparison
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
}

// Calculate similarity between two strings (Levenshtein-based)
function similarity(a: string, b: string): number {
  const an = normalizeName(a);
  const bn = normalizeName(b);
  
  if (an === bn) return 1;
  if (!an || !bn) return 0;
  
  // Exact substring match
  if (an.includes(bn) || bn.includes(an)) return 0.9;
  
  // Word-level matching
  const aWords = an.split(' ');
  const bWords = bn.split(' ');
  
  let matchedWords = 0;
  for (const aw of aWords) {
    for (const bw of bWords) {
      if (aw === bw || (aw.length > 2 && bw.length > 2 && (aw.includes(bw) || bw.includes(aw)))) {
        matchedWords++;
        break;
      }
    }
  }
  
  const maxWords = Math.max(aWords.length, bWords.length);
  return matchedWords / maxWords;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { attendanceRecords, dryRun = false }: { attendanceRecords: AttendanceRecord[]; dryRun?: boolean } = await req.json();
    
    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return new Response(
        JSON.stringify({ error: 'attendanceRecords array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${attendanceRecords.length} attendance records, dryRun: ${dryRun}`);

    // Fetch all contacts from database
    const { data: contacts, error: fetchError } = await supabase
      .from('contacts')
      .select('id, record_id, email, first_name, last_name, full_name, events_actually_attended');

    if (fetchError) {
      console.error('Error fetching contacts:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${contacts?.length || 0} contacts in database`);

    const result: SyncResult = {
      matched: [],
      unmatched: [],
      updated: 0,
      errors: [],
    };

    // Process each attendance record
    for (const record of attendanceRecords) {
      const name = record.name?.trim();
      const email = record.email?.trim().toLowerCase();
      const event = record.event?.trim();

      if (!name && !email) {
        result.errors.push(`Skipping record with no name or email`);
        continue;
      }

      // Try to find matching contact
      let matchedContact = null;
      let matchScore = 0;

      for (const contact of contacts || []) {
        // Email match is highest priority
        if (email && contact.email?.toLowerCase() === email) {
          matchedContact = contact;
          matchScore = 1;
          break;
        }

        // Name matching
        const contactFullName = contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
        const nameScore = similarity(name, contactFullName);
        
        if (nameScore > 0.7 && nameScore > matchScore) {
          matchedContact = contact;
          matchScore = nameScore;
        }
      }

      if (matchedContact && matchScore >= 0.7) {
        result.matched.push({
          name,
          email,
          contactId: matchedContact.record_id || matchedContact.id,
          event,
        });

        if (!dryRun) {
          // Update the contact's events_actually_attended field
          const currentEvents = matchedContact.events_actually_attended || '';
          const eventsList = currentEvents.split(',').map((e: string) => e.trim()).filter(Boolean);
          
          // Add event if not already present
          if (!eventsList.some((e: string) => e.toLowerCase() === event.toLowerCase())) {
            eventsList.push(event);
            
            const { error: updateError } = await supabase
              .from('contacts')
              .update({ 
                events_actually_attended: eventsList.join(', '),
                updated_at: new Date().toISOString(),
              })
              .eq('id', matchedContact.id);

            if (updateError) {
              console.error(`Error updating contact ${matchedContact.id}:`, updateError);
              result.errors.push(`Failed to update ${name}: ${updateError.message}`);
            } else {
              result.updated++;
              // Update local copy to prevent duplicate adds in same batch
              matchedContact.events_actually_attended = eventsList.join(', ');
            }
          }
        }
      } else {
        result.unmatched.push({ name, email, event });
      }
    }

    console.log(`Sync complete: ${result.matched.length} matched, ${result.unmatched.length} unmatched, ${result.updated} updated`);

    return new Response(
      JSON.stringify({
        success: true,
        dryRun,
        summary: {
          totalRecords: attendanceRecords.length,
          matched: result.matched.length,
          unmatched: result.unmatched.length,
          updated: result.updated,
          errors: result.errors.length,
        },
        ...result,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in sync-attendance:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
