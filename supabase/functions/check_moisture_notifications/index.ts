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
    console.log("=== Edge function started: check_moisture_notifications ===");
    
    // Parse the request body
    let requestData = {};
    try {
      requestData = await req.json();
    } catch {
      // Empty body is okay
    }
    
    const checkType = (requestData as any)?.checkType || 'auto';
    const deviceCodeFilter = (requestData as any)?.deviceCode;
    
    console.log(`Notification check type: ${checkType}, device filter: ${deviceCodeFilter || 'all'}`);
    
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
    
    console.log("Fetching active moisture notification settings...");
    
    // Get all active moisture notification settings
    let settingsQuery = supabase
      .from("moisture_notification_settings")
      .select("*")
      .eq("enabled", true);
    
    if (deviceCodeFilter) {
      settingsQuery = settingsQuery.eq("device_code", deviceCodeFilter);
    }
    
    const { data: settings, error: settingsError } = await settingsQuery;
    
    if (settingsError) {
      console.error("Error fetching moisture notification settings:", settingsError);
      throw new Error("Failed to fetch moisture notification settings");
    }
    
    console.log(`Found ${settings?.length || 0} active moisture notification settings`);
    
    let notificationCount = 0;
    const processedDevices: string[] = [];
    
    // Process each notification setting
    for (const setting of settings || []) {
      console.log(`\n--- Processing device: ${setting.device_code} for user: ${setting.user_id} ---`);
      
      // Get the latest moisture reading for this device
      const { data: readings, error: readingsError } = await supabase
        .from("moisture_meter_readings")
        .select("*")
        .eq("device_code", setting.device_code)
        .order("reading_time", { ascending: false })
        .limit(1);
      
      if (readingsError) {
        console.error(`Error fetching readings for ${setting.device_code}:`, readingsError);
        continue;
      }
      
      if (!readings || readings.length === 0) {
        console.log(`No readings found for device ${setting.device_code}`);
        continue;
      }
      
      const reading = readings[0];
      console.log(`Latest reading: moisture=${reading.moisture_machine}, temp=${reading.temperature}, time=${reading.reading_time}`);
      
      // Check moisture thresholds
      if (setting.moisture_enabled && reading.moisture_machine !== null) {
        const moistureValue = parseFloat(reading.moisture_machine);
        
        // Check minimum moisture threshold
        if (setting.moisture_min_enabled && moistureValue < setting.moisture_min_threshold) {
          const result = await createOrUpdateNotification(
            supabase,
            setting,
            reading,
            'moisture_min',
            moistureValue,
            setting.moisture_min_threshold,
            `ค่าความชื้น (${moistureValue.toFixed(1)}%) ต่ำกว่าเกณฑ์ที่กำหนด (${setting.moisture_min_threshold}%)`
          );
          if (result) notificationCount++;
        }
        
        // Check maximum moisture threshold
        if (setting.moisture_max_enabled && moistureValue > setting.moisture_max_threshold) {
          const result = await createOrUpdateNotification(
            supabase,
            setting,
            reading,
            'moisture_max',
            moistureValue,
            setting.moisture_max_threshold,
            `ค่าความชื้น (${moistureValue.toFixed(1)}%) สูงกว่าเกณฑ์ที่กำหนด (${setting.moisture_max_threshold}%)`
          );
          if (result) notificationCount++;
        }
      }
      
      // Check temperature thresholds
      if (setting.temperature_enabled && reading.temperature !== null) {
        const tempValue = parseFloat(reading.temperature);
        
        // Check minimum temperature threshold
        if (setting.temperature_min_enabled && tempValue < setting.temperature_min_threshold) {
          const result = await createOrUpdateNotification(
            supabase,
            setting,
            reading,
            'temperature_min',
            tempValue,
            setting.temperature_min_threshold,
            `อุณหภูมิ (${tempValue.toFixed(1)}°C) ต่ำกว่าเกณฑ์ที่กำหนด (${setting.temperature_min_threshold}°C)`
          );
          if (result) notificationCount++;
        }
        
        // Check maximum temperature threshold
        if (setting.temperature_max_enabled && tempValue > setting.temperature_max_threshold) {
          const result = await createOrUpdateNotification(
            supabase,
            setting,
            reading,
            'temperature_max',
            tempValue,
            setting.temperature_max_threshold,
            `อุณหภูมิ (${tempValue.toFixed(1)}°C) สูงกว่าเกณฑ์ที่กำหนด (${setting.temperature_max_threshold}°C)`
          );
          if (result) notificationCount++;
        }
      }
      
      processedDevices.push(setting.device_code);
    }
    
    console.log(`\n=== Moisture notification check completed ===`);
    console.log(`Processed ${processedDevices.length} devices, created/updated ${notificationCount} notifications`);
    
    // Return success response
    return new Response(JSON.stringify({ 
      message: `Moisture notification check completed. Created/updated ${notificationCount} notifications.`,
      success: true,
      notificationCount: notificationCount,
      processedDevices: processedDevices,
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

// Helper function to create or update notification
async function createOrUpdateNotification(
  supabase: any,
  setting: any,
  reading: any,
  thresholdType: string,
  value: number,
  threshold: number,
  message: string
): Promise<boolean> {
  console.log(`${thresholdType.toUpperCase()} THRESHOLD BREACH: ${message}`);
  
  // Prepare settings snapshot
  const settingsSnapshot = {
    moisture_min_threshold: setting.moisture_min_threshold,
    moisture_max_threshold: setting.moisture_max_threshold,
    temperature_min_threshold: setting.temperature_min_threshold,
    temperature_max_threshold: setting.temperature_max_threshold,
    moisture_enabled: setting.moisture_enabled,
    temperature_enabled: setting.temperature_enabled
  };
  
  try {
    // Check if notification already exists for this user and threshold type
    const { data: existingNotification, error: existingError } = await supabase
      .from("moisture_notifications")
      .select("*")
      .eq("device_code", setting.device_code)
      .eq("threshold_type", thresholdType)
      .eq("user_id", setting.user_id)
      .order("timestamp", { ascending: false })
      .limit(1);
    
    if (existingError) {
      console.error("Error checking existing notification:", existingError);
      return false;
    }
    
    // Check if we should update existing or create new (within 1 hour window)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const shouldUpdate = existingNotification && 
                         existingNotification.length > 0 && 
                         existingNotification[0].timestamp > oneHourAgo;
    
    if (shouldUpdate) {
      // Update existing notification
      const { error: updateError } = await supabase
        .from("moisture_notifications")
        .update({
          value: value,
          notification_message: message,
          notification_count: (existingNotification[0].notification_count || 1) + 1,
          timestamp: new Date().toISOString(),
          reading_id: reading.id,
          settings_snapshot: settingsSnapshot,
          read: false // Mark as unread again
        })
        .eq("id", existingNotification[0].id)
        .eq("user_id", setting.user_id);
      
      if (updateError) {
        console.error("Error updating notification:", updateError);
        return false;
      }
      
      console.log(`Updated existing notification ID ${existingNotification[0].id} (count: ${existingNotification[0].notification_count + 1})`);
      return true;
    } else {
      // Create new notification
      const { error: insertError } = await supabase
        .from("moisture_notifications")
        .insert({
          device_code: setting.device_code,
          threshold_type: thresholdType,
          value: value,
          notification_message: message,
          timestamp: new Date().toISOString(),
          reading_id: reading.id,
          user_id: setting.user_id,
          settings_snapshot: settingsSnapshot,
          notification_count: 1,
          read: false
        });
      
      if (insertError) {
        console.error("Error creating notification:", insertError);
        return false;
      }
      
      console.log(`Created new notification for ${thresholdType}`);
      return true;
    }
  } catch (err) {
    console.error("Error in createOrUpdateNotification:", err);
    return false;
  }
}
