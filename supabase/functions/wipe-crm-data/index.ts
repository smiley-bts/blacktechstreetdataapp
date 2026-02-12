import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create user client to verify identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;

    // Verify admin using service role client
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isAdmin } = await serviceClient.rpc("is_admin", { _user_id: userId });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete in dependency order (children first)
    const tables = [
      "contact_notes",
      "contact_tags",
      "contact_overrides",
      "participant_emails",
      "event_attendance",
      "merge_history",
      "contacts",
      "participants",
    ];

    const results: Record<string, number> = {};

    for (const table of tables) {
      // Use neq on id to match all rows (workaround since .delete() requires a filter)
      const { data, error } = await serviceClient
        .from(table)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
        .select("id");

      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        return new Response(
          JSON.stringify({ error: `Failed to delete from ${table}: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      results[table] = data?.length || 0;
    }

    // Log the activity
    await serviceClient.from("activity_logs").insert({
      user_id: userId,
      action: "wipe_all_crm_data",
      details: { tables_wiped: results },
    });

    return new Response(
      JSON.stringify({ success: true, deleted: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Wipe error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
