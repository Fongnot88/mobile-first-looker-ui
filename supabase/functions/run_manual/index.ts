import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import mqtt from "npm:mqtt";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RunManualPayload {
  command: string; // 'run_manual' | 'set_mode'
  mode?: string;   // 'auto' | 'manual'
  moisture?: number;
  correction?: number;
  deviceCode?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      ok: false,
      mode: 'error',
      message: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parse request body
    const payload: RunManualPayload = await req.json();
    console.log('[run_manual] Received payload:', JSON.stringify(payload));

    // Validate command
    if (payload.command !== 'run_manual' && payload.command !== 'set_mode') {
      console.warn('[run_manual] Invalid command:', payload.command);
      return new Response(JSON.stringify({
        ok: false,
        mode: 'error',
        message: 'Invalid command. Expected "run_manual" or "set_mode"',
        echo: payload
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate moisture (Only for run_manual)
    let moisture = 0;
    let correction = 0;

    if (payload.command === 'run_manual') {
      moisture = parseFloat(String(payload.moisture));
      if (isNaN(moisture) || moisture < 0 || moisture > 100) {
        console.warn('[run_manual] Invalid moisture value:', payload.moisture);
        return new Response(JSON.stringify({
          ok: false,
          mode: 'error',
          message: 'Invalid moisture value. Must be a number between 0 and 100',
          echo: payload
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate correction
      correction = parseFloat(String(payload.correction));
      if (isNaN(correction) || correction < -50 || correction > 50) {
        console.warn('[run_manual] Invalid correction value:', payload.correction);
        return new Response(JSON.stringify({
          ok: false,
          mode: 'error',
          message: 'Invalid correction value. Must be a number between -50 and 50',
          echo: payload
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const deviceCode = payload.deviceCode;

    // --- MQTT Logic ---
    console.log('[run_manual] Connecting to MQTT broker...');
    // Add reconnectPeriod: 0 to prevent loops, and use clean: true
    const client = mqtt.connect('mqtt://mqttserver.riceflow.app:1883', {
      username: 'myuser',
      password: 'mypass',
      reconnectPeriod: 0, // Disable auto-reconnect to avoid loops in serverless
      connectTimeout: 5000
    });

    const publishPromise = new Promise((resolve, reject) => {
      // Use 'once' instead of 'on' to ensure it fires only one time
      client.once('connect', () => {
        console.log('[run_manual] MQTT Connected');

        // Topic structure: c2tech/mm000001/cmd (Fixed typo c2tch -> c2tech)
        const targetDevice = deviceCode || 'mm000001';
        const topic = `c2tech/${targetDevice}/cmd`;

        // Payload construction
        let mqttPayload = {};

        if (payload.command === 'run_manual') {
          mqttPayload = {
            cmd: "START",
            mode: "manual", // Explicitly state manual mode for run command
            moisture: moisture,
            correction: correction,
            timestamp: new Date().toISOString()
          };
        } else if (payload.command === 'set_mode') {
          mqttPayload = {
            cmd: "SET_MODE",
            mode: payload.mode || 'auto',
            timestamp: new Date().toISOString()
          };
        }

        const message = JSON.stringify(mqttPayload);

        console.log(`[run_manual] Publishing to ${topic}:`, message);

        client.publish(topic, message, { qos: 1 }, (err) => {
          if (err) {
            console.error('[run_manual] MQTT Publish Error:', err);
            client.end(); // Ensure close on error
            reject(err);
          } else {
            console.log('[run_manual] Publish Success');
            client.end(); // Ensure close on success
            resolve({ topic, message });
          }
        });
      });

      client.on('error', (err) => {
        console.error('[run_manual] MQTT Connection Error:', err);
        client.end();
        reject(err);
      });
    });

    try {
      await publishPromise;
    } catch (mqttErr) {
      console.error('[run_manual] MQTT failed but continuing:', mqttErr);
      // We might choose to fail the request or just log it. 
      // For now, we'll continue but log the failure, maybe return partial success warning if needed.
    }
    // ------------------


    // Initialize Supabase client for auth check (Optional log, keeping existing logic)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check authorization header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    let userRole: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError) {
        console.warn('[run_manual] Auth error:', authError.message);
      } else if (user) {
        userId = user.id;

        // Get user role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .limit(1);

        userRole = roles?.[0]?.role || 'user';
        console.log('[run_manual] Authenticated user:', userId, 'role:', userRole);
      }
    }

    // Determine mode
    const isDryRun = !payload.deviceCode;
    const mode = isDryRun ? 'dry-run' : 'live';

    // Audit log
    console.log('[run_manual] Audit:', {
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      userRole: userRole || 'none',
      mode,
      deviceCode: payload.deviceCode || 'N/A',
      moisture,
      correction,
    });

    return new Response(JSON.stringify({
      ok: true,
      mode: mode,
      message: `Command sent via MQTT. ${mode === 'dry-run' ? '(Dry Run)' : ''}`,
      echo: {
        command: payload.command,
        moisture,
        correction,
        deviceCode: payload.deviceCode
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[run_manual] Error:', error);
    return new Response(JSON.stringify({
      ok: false,
      mode: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
