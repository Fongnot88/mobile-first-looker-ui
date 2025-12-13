
// Follow Supabase Edge Function format
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This function will require service role to execute arbitrary SQL
serve(async (req) => {
  try {
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get query from request
    const { query } = await req.json();
    
    if (!query) {
      return new Response(JSON.stringify({ 
        error: "Missing query parameter" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Only allow SELECT queries for security
    if (!query.trim().toLowerCase().startsWith('select')) {
      return new Response(JSON.stringify({ 
        error: "Only SELECT queries are allowed" 
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Execute the query
    const { data, error } = await supabase.rpc('execute_raw_query', { sql_query: query });
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Return the results
    return new Response(JSON.stringify({ data }), {
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
