import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin accounts to create - passwords are stored securely in environment secrets
const ADMIN_ACCOUNTS = [
  {
    email: "tyrance@blacktechstreet.com",
    passwordEnvKey: "ADMIN_PASSWORD_TYRANCE",
    username: "tyrance",
    display_name: "Tyrance Billingsley II",
    role: "admin" as const,
  },
  {
    email: "josephine@blacktechstreet.com",
    passwordEnvKey: "ADMIN_PASSWORD_JOSEPHINE",
    username: "josephine",
    display_name: "Josephine Nelms",
    role: "admin" as const,
  },
  {
    email: "allen@blacktechstreet.com",
    passwordEnvKey: "ADMIN_PASSWORD_ALLEN",
    username: "allen",
    display_name: "Allen Collins",
    role: "admin" as const,
  },
  {
    email: "smiley@blacktechstreet.com",
    passwordEnvKey: "ADMIN_PASSWORD_OWNER",
    username: "smiley",
    display_name: "Smiley",
    role: "owner" as const,
  },
  {
    email: "chris@blacktechstreet.com",
    passwordEnvKey: "ADMIN_PASSWORD_CHRIS",
    username: "chris",
    display_name: "Chris",
    role: "admin" as const,
  },
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication - require service role key
    const authHeader = req.headers.get("Authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!authHeader || !authHeader.includes(serviceRoleKey)) {
      console.error("Unauthorized setup-admins call attempt");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results: { username: string; status: string; error?: string }[] = [];

    for (const account of ADMIN_ACCOUNTS) {
      try {
        // Get password from environment variable
        const password = Deno.env.get(account.passwordEnvKey);
        
        if (!password) {
          results.push({
            username: account.username,
            status: "error",
            error: `Password secret ${account.passwordEnvKey} not configured`,
          });
          continue;
        }

        // Check if user already exists by looking up profile
        const { data: existingProfile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("username", account.username)
          .single();

        if (existingProfile) {
          results.push({
            username: account.username,
            status: "exists",
          });
          continue;
        }

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: password,
          email_confirm: true,
        });

        if (authError) {
          // User might already exist in auth but not have profile
          if (authError.message.includes("already been registered")) {
            // Try to get existing user
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = users?.find(u => u.email === account.email);
            
            if (existingUser) {
              // Create profile for existing user
              await supabaseAdmin.from("profiles").upsert({
                id: existingUser.id,
                username: account.username,
                display_name: account.display_name,
                email: account.email,
              });

              // Create role
              await supabaseAdmin.from("user_roles").upsert({
                user_id: existingUser.id,
                role: account.role,
              });

              results.push({
                username: account.username,
                status: "profile_created",
              });
              continue;
            }
          }
          
          results.push({
            username: account.username,
            status: "error",
            error: authError.message,
          });
          continue;
        }

        if (!authData.user) {
          results.push({
            username: account.username,
            status: "error",
            error: "No user returned from auth creation",
          });
          continue;
        }

        // Create profile
        const { error: profileError } = await supabaseAdmin.from("profiles").insert({
          id: authData.user.id,
          username: account.username,
          display_name: account.display_name,
          email: account.email,
        });

        if (profileError) {
          results.push({
            username: account.username,
            status: "error",
            error: `Profile: ${profileError.message}`,
          });
          continue;
        }

        // Create role
        const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
          user_id: authData.user.id,
          role: account.role,
        });

        if (roleError) {
          results.push({
            username: account.username,
            status: "error",
            error: `Role: ${roleError.message}`,
          });
          continue;
        }

        results.push({
          username: account.username,
          status: "created",
        });
      } catch (err) {
        results.push({
          username: account.username,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Setup admins error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
