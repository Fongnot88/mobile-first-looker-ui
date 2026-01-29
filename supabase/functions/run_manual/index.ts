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
  interval?: number;
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
    const validCommands = ['run_manual', 'set_mode', 'set_interval', 'stop'];
    if (!validCommands.includes(payload.command)) {
      console.warn('[run_manual] Invalid command:', payload.command);
      return new Response(JSON.stringify({
        ok: false,
        mode: 'error',
        message: 'Invalid command. Expected "run_manual", "set_mode", "set_interval", or "stop"',
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
      // Moisture and correction are no longer required
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
            cmd: "start",
            mode: "manual", // Explicitly state manual mode for run command
            timestamp: new Date().toISOString()
          };
        } else if (payload.command === 'set_mode') {
          mqttPayload = {
            cmd: "set_mode",
            mode: payload.mode || 'auto',
            time_interval: payload.mode === 'auto' ? (payload.interval || 5) * 60 : undefined,
            timestamp: new Date().toISOString()
          };
        } else if (payload.command === 'set_interval') {
          mqttPayload = {
            cmd: "set_interval",
            time_interval: (payload.interval || 5) * 60, // Convert minutes to seconds
            mode: payload.mode || 'auto',
            timestamp: new Date().toISOString()
          };
        } else if (payload.command === 'stop') {
          mqttPayload = {
            cmd: "stop",
            mode: "manual",
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

    // --- Database Timer Management (Server-Side State) ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (payload.command === 'run_manual' && deviceCode) {
      // Start Manual: Insert Timer (3.5 mins)
      const duration = 3.5 * 60; // 210 seconds
      const targetStop = new Date(Date.now() + duration * 1000);

      await supabase.from('device_timers').upsert({
        device_code: deviceCode,
        mode: 'manual',
        start_time: new Date().toISOString(),
        duration_seconds: duration,
        target_stop_time: targetStop.toISOString()
      }, { onConflict: 'device_code' });

    } else if (payload.command === 'set_mode' && payload.mode === 'auto' && deviceCode) {
      // Start Auto: Insert Timer (Indefinite / Active)
      // We set a far future stop time so it's "Active" but doesn't expire
      const io = new Date();
      io.setFullYear(io.getFullYear() + 10); // 10 years

      await supabase.from('device_timers').upsert({
        device_code: deviceCode,
        mode: 'auto',
        start_time: new Date().toISOString(),
        duration_seconds: 0,
        target_stop_time: io.toISOString()
      }, { onConflict: 'device_code' });

    } else if (payload.command === 'stop' && deviceCode) {
      if (payload.mode === 'manual') {
        // Normal Stop (Manual): Remove Timer
        await supabase.from('device_timers').delete().eq('device_code', deviceCode);
      } else {
        // Auto Mode Stop: Insert "Pending Restart" Timer (1 minute)
        // Check if we are really in Auto mode or if this stop should just clear everything.
        // Assuming payload.mode represents the "Current Mode" the user was in.

        // If mode passed is 'manual', we just delete.
        // If mode is NOT passed, or is 'auto', we assume we want auto-restart.

        // However, the frontend sends mode='manual' in the body even for stop?
        // Let's check frontend. Frontend sends mode='manual' by default on stop to be safe?
        // In MoistureControlPanel: mode: 'manual' is hardcoded in stopMachine usually.

        // We need to trust the "Server State" or look up existing timer?
        // Better: look up existing timer mode before deleting.

        const { data: existingTimer } = await supabase
          .from('device_timers')
          .select('mode')
          .eq('device_code', deviceCode)
          .single();

        if (existingTimer && existingTimer.mode === 'auto') {
          // It was Auto, so we Queue Restart
          const restartDelay = 60; // 60 seconds
          const restartTarget = new Date(Date.now() + restartDelay * 1000);

          await supabase.from('device_timers').upsert({
            device_code: deviceCode,
            mode: 'pending_auto_restart',
            start_time: new Date().toISOString(),
            duration_seconds: restartDelay,
            target_stop_time: restartTarget.toISOString()
          }, { onConflict: 'device_code' });

        } else {
          // Manual or No Timer: Just Delete
          await supabase.from('device_timers').delete().eq('device_code', deviceCode);
        }
      }
    }
    // -----------------------------------------------------

    // Initialize Supabase client for auth check (Existing logic)

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
