
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the session of the logged-in user
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // First, check if the user has admin privileges
    const { data: roles, error: rolesError } = await supabaseClient.rpc(
      'get_user_roles',
      { user_id: session.user.id }
    );

    if (rolesError) {
      throw rolesError;
    }

    const isAdmin = roles.includes('admin') || roles.includes('superadmin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin privileges required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get all users
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers();
    
    if (authError) {
      throw authError;
    }

    // For each user, check if they have the 'waiting_list' role
    const usersWithRoles = await Promise.all(
      (authUsers?.users || []).map(async (authUser) => {
        const { data: userRoles, error: userRolesError } = await supabaseClient.rpc(
          'get_user_roles',
          { user_id: authUser.id }
        );

        if (userRolesError) {
          console.error('Error fetching roles for user:', authUser.id, userRolesError);
        }
        
        return {
          id: authUser.id,
          email: authUser.email || 'unknown@example.com',
          roles: userRoles || [],
          last_sign_in_at: authUser.last_sign_in_at,
          in_waiting_list: (userRoles || []).includes('waiting_list')
        };
      })
    );

    // Filter out users who are in the waiting list
    const usersNotInWaitingList = usersWithRoles.filter(user => !user.in_waiting_list);

    // Return the filtered users
    return new Response(
      JSON.stringify({ users: usersNotInWaitingList }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
