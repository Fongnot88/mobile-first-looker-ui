
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const SUPABASE_URL = "https://tlnkyztazcsqybjigrpw.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Edge function started: check_notification_thresholds");
    
    // Parse the request body
    const requestData = await req.json();
    const checkType = requestData?.checkType || 'auto';
    
    console.log(`Notification check type: ${checkType}`);
    
    // Initialize Supabase client with SERVICE_ROLE key for admin privileges
    const supabase = createClient(
      SUPABASE_URL, 
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
        }
      }
    );
    
    console.log("Looking for notification settings that exceed thresholds...");
    
    // Get all active notification settings
    const { data: settings, error: settingsError } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("enabled", true)
      .or("min_enabled.eq.true,max_enabled.eq.true");
    
    if (settingsError) {
      console.error("Error fetching notification settings:", settingsError);
      throw new Error("Failed to fetch notification settings");
    }
    
    console.log(`Found ${settings?.length || 0} active notification settings`);
    
    let notificationCount = 0;
    
    // Process each notification setting
    for (const setting of settings || []) {
      // Get recent measurements for this device and parameter
      const { data: analyses, error: analysesError } = await supabase
        .from("rice_quality_analysis")
        .select("*")
        .eq("device_code", setting.device_code)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (analysesError) {
        console.error(`Error fetching analyses for ${setting.device_code}:`, analysesError);
        continue;
      }
      
      if (!analyses || analyses.length === 0) {
        console.log(`No recent analyses found for device ${setting.device_code}`);
        continue;
      }
      
      const analysis = analyses[0];
      
      // Get the actual value from the analysis based on rice_type_id
      const value = analysis[setting.rice_type_id];
      
      if (value === null || value === undefined) {
        console.log(`No value found for ${setting.rice_type_id} in analysis ID ${analysis.id}`);
        continue;
      }
      
      console.log(`Checking ${setting.rice_type_id} value ${value} against thresholds: min=${setting.min_threshold}, max=${setting.max_threshold}`);
      
      // Check minimum threshold
      if (setting.min_enabled && value < setting.min_threshold) {
        const message = `ค่า "${setting.rice_type_name}" (${value}) ต่ำกว่าเกณฑ์ที่กำหนดไว้ (${setting.min_threshold})`;
        console.log(`MIN THRESHOLD BREACH: ${message}`);
        
        // Check if notification already exists for this user
        const { data: existingNotification, error: existingError } = await supabase
          .from("notifications")
          .select("*")
          .eq("device_code", setting.device_code)
          .eq("rice_type_id", setting.rice_type_id)
          .eq("threshold_type", "min")
          .eq("user_id", setting.user_id) // 🔒 CRITICAL: Filter by user_id
          .order("timestamp", { ascending: false })
          .limit(1);
        
        if (existingError) {
          console.error("Error checking existing notification:", existingError);
        } else if (existingNotification && existingNotification.length > 0) {
          // Update existing notification (with user verification)
          const { error: updateError } = await supabase
            .from("notifications")
            .update({
              value: value,
              notification_message: message,
              notification_count: (existingNotification[0].notification_count || 1) + 1,
              timestamp: new Date().toISOString(),
              analysis_id: analysis.id
            })
            .eq("id", existingNotification[0].id)
            .eq("user_id", setting.user_id); // 🔒 CRITICAL: Ensure user ownership
          
          if (updateError) {
            console.error("Error updating notification:", updateError);
          } else {
            console.log(`Updated existing min notification ID ${existingNotification[0].id}`);
            notificationCount++;
          }
        } else {
          // Create new notification
          const { error: insertError } = await supabase
            .from("notifications")
            .insert({
              device_code: setting.device_code,
              rice_type_id: setting.rice_type_id,
              threshold_type: "min",
              value: value,
              notification_message: message,
              timestamp: new Date().toISOString(),
              analysis_id: analysis.id,
              user_id: setting.user_id
            });
          
          if (insertError) {
            console.error("Error creating notification:", insertError);
          } else {
            console.log(`Created new min notification for ${setting.rice_type_id}`);
            notificationCount++;
          }
        }
      }
      
      // Check maximum threshold
      if (setting.max_enabled && value > setting.max_threshold) {
        const message = `ค่า "${setting.rice_type_name}" (${value}) สูงกว่าเกณฑ์ที่กำหนดไว้ (${setting.max_threshold})`;
        console.log(`MAX THRESHOLD BREACH: ${message}`);
        
        // Check if notification already exists for this user
        const { data: existingNotification, error: existingError } = await supabase
          .from("notifications")
          .select("*")
          .eq("device_code", setting.device_code)
          .eq("rice_type_id", setting.rice_type_id)
          .eq("threshold_type", "max")
          .eq("user_id", setting.user_id) // 🔒 CRITICAL: Filter by user_id
          .order("timestamp", { ascending: false })
          .limit(1);
        
        if (existingError) {
          console.error("Error checking existing notification:", existingError);
        } else if (existingNotification && existingNotification.length > 0) {
          // Update existing notification (with user verification)
          const { error: updateError } = await supabase
            .from("notifications")
            .update({
              value: value,
              notification_message: message,
              notification_count: (existingNotification[0].notification_count || 1) + 1,
              timestamp: new Date().toISOString(),
              analysis_id: analysis.id
            })
            .eq("id", existingNotification[0].id)
            .eq("user_id", setting.user_id); // 🔒 CRITICAL: Ensure user ownership
          
          if (updateError) {
            console.error("Error updating notification:", updateError);
          } else {
            console.log(`Updated existing max notification ID ${existingNotification[0].id}`);
            notificationCount++;
          }
        } else {
          // Create new notification
          const { error: insertError } = await supabase
            .from("notifications")
            .insert({
              device_code: setting.device_code,
              rice_type_id: setting.rice_type_id,
              threshold_type: "max",
              value: value,
              notification_message: message,
              timestamp: new Date().toISOString(),
              analysis_id: analysis.id,
              user_id: setting.user_id
            });
          
          if (insertError) {
            console.error("Error creating notification:", insertError);
          } else {
            console.log(`Created new max notification for ${setting.rice_type_id}`);
            notificationCount++;
          }
        }
      }
    }
    
    console.log(`Notification check completed: ${notificationCount} notifications created/updated`);
    
    // Return success response
    return new Response(JSON.stringify({ 
      message: `Notification check completed successfully. Created/updated ${notificationCount} notifications.`,
      success: true,
      notificationCount: notificationCount,
      checkType: checkType,
      time: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error),
      time: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
