import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to verify they're an owner
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is owner
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || roleData.role !== "owner") {
      return new Response(
        JSON.stringify({ error: "Only owners can manage admin accounts" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { action, targetUserId, newPassword } = body;

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

    // Prevent owner from modifying themselves
    if (targetUserId === user.id) {
      return new Response(
        JSON.stringify({ error: "Cannot modify your own account through this endpoint" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check target user exists and is not an owner
    const { data: targetRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", targetUserId)
      .single();

    if (!targetRole) {
      return new Response(
        JSON.stringify({ error: "Target user not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (targetRole.role === "owner") {
      return new Response(
        JSON.stringify({ error: "Cannot modify owner accounts" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    switch (action) {
      case "reset_password": {
        if (!newPassword || newPassword.length < 8) {
          return new Response(
            JSON.stringify({ error: "Password must be at least 8 characters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          targetUserId,
          { password: newPassword }
        );

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the action
        await supabaseAdmin.from("activity_logs").insert({
          user_id: user.id,
          action: "admin_password_reset",
          details: { target_user_id: targetUserId },
        });

        return new Response(
          JSON.stringify({ success: true, message: "Password reset successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "disable_account": {
        // Ban the user (disable their account)
        const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
          targetUserId,
          { ban_duration: "876600h" } // ~100 years
        );

        if (banError) {
          return new Response(
            JSON.stringify({ error: banError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the action
        await supabaseAdmin.from("activity_logs").insert({
          user_id: user.id,
          action: "admin_account_disabled",
          details: { target_user_id: targetUserId },
        });

        return new Response(
          JSON.stringify({ success: true, message: "Account disabled successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "enable_account": {
        // Unban the user
        const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(
          targetUserId,
          { ban_duration: "none" }
        );

        if (unbanError) {
          return new Response(
            JSON.stringify({ error: unbanError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the action
        await supabaseAdmin.from("activity_logs").insert({
          user_id: user.id,
          action: "admin_account_enabled",
          details: { target_user_id: targetUserId },
        });

        return new Response(
          JSON.stringify({ success: true, message: "Account enabled successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_status": {
        // Get user status
        const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);

        if (getUserError) {
          return new Response(
            JSON.stringify({ error: getUserError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if user is banned by looking at the user metadata
        const userObj = userData.user as unknown as Record<string, unknown>;
        const bannedUntil = userObj.banned_until as string | null;

        return new Response(
          JSON.stringify({ 
            success: true, 
            banned: !!bannedUntil,
            banned_until: bannedUntil,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Manage admin error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
