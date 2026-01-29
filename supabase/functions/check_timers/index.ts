import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import mqtt from "npm:mqtt";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        console.log('[check_timers] Starting timer check...');

        // 1. Get Active Timers
        const { data: activeTimers, error: timerError } = await supabase
            .from('device_timers')
            .select('*');

        if (timerError) throw timerError;

        // 2. Get All Devices (to check for Safety Stop)
        // Assuming 'device_settings' has 'device_code'
        const { data: allDevices, error: deviceError } = await supabase
            .from('device_settings')
            .select('device_code');

        if (deviceError) throw deviceError;

        const activeDeviceCodes = new Set(activeTimers?.map(t => t.device_code) || []);
        const stopTargets = new Set<string>();
        const startAutoTargets = new Set<string>();

        // A. Check Expired Timers
        const now = new Date();
        const expiredTimers = activeTimers?.filter(t => new Date(t.target_stop_time) <= now) || [];

        expiredTimers.forEach(t => {
            if (t.mode === 'pending_auto_restart') {
                startAutoTargets.add(t.device_code);
            } else {
                stopTargets.add(t.device_code);
            }
        });

        // B. Check Safety Stop Targets (Devices NOT in activeTimers)
        // "Every 1 minute UNTIL start or auto mode"
        allDevices?.forEach(d => {
            if (!activeDeviceCodes.has(d.device_code)) {
                // Only stop if NOT already in starting queue
                if (!startAutoTargets.has(d.device_code)) {
                    stopTargets.add(d.device_code);
                }
            }
        });

        if (stopTargets.size === 0 && startAutoTargets.size === 0) {
            return new Response(JSON.stringify({ message: "No actions needed" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`[check_timers] Actions: STOP=${stopTargets.size}, START_AUTO=${startAutoTargets.size}`);


        // 3. Connect to MQTT and Send STOPs
        const client = mqtt.connect('mqtt://mqttserver.riceflow.app:1883', {
            username: 'myuser',
            password: 'mypass',
            reconnectPeriod: 0,
            connectTimeout: 5000
        });

        await new Promise((resolve, reject) => {
            client.on('connect', async () => {
                console.log('[check_timers] MQTT Connected');

                // 1. Send STOP commands
                const stopPromises = Array.from(stopTargets).map(deviceCode => {
                    const topic = `c2tech/${deviceCode}/cmd`;
                    const payload = JSON.stringify({
                        cmd: "stop",
                        mode: "manual",
                        timestamp: new Date().toISOString()
                    });
                    return new Promise((r) => client.publish(topic, payload, { qos: 1 }, r));
                });

                // 2. Send START AUTO commands
                const startPromises = Array.from(startAutoTargets).map(deviceCode => {
                    const topic = `c2tech/${deviceCode}/cmd`;
                    // Auto Start Sequence: We probably just need to set mode to auto and interval?
                    // Frontend does: set_interval -> set_mode
                    // We can combine or send set_mode with interval attached (run_manual supports it)

                    const payload = JSON.stringify({
                        cmd: "set_mode",
                        mode: "auto",
                        time_interval: 300, // 5 minutes default
                        timestamp: new Date().toISOString()
                    });
                    return new Promise((r) => client.publish(topic, payload, { qos: 1 }, r));
                });

                await Promise.all([...stopPromises, ...startPromises]);
                console.log(`[check_timers] Sent STOP to ${stopTargets.size}, START to ${startAutoTargets.size} devices`);
                client.end();
                resolve(true);
            });

            client.on('error', (err) => {
                console.error('[check_timers] MQTT Error:', err);
                client.end();
                reject(err);
            });
        });

        // 4. Cleanup Expired Timers from DB
        // 4. Cleanup / Update DB

        // A. Delete Expired Manual/Stop Timers
        const manualExpired = expiredTimers.filter(t => t.mode !== 'pending_auto_restart');
        if (manualExpired.length > 0) {
            const idsToDelete = manualExpired.map(t => t.id);
            await supabase.from('device_timers').delete().in('id', idsToDelete);
            console.log(`[check_timers] Deleted ${manualExpired.length} expired manual timers`);
        }

        // B. Update Pending Restart Timers to Active Auto
        const pendingRestart = expiredTimers.filter(t => t.mode === 'pending_auto_restart');
        if (pendingRestart.length > 0) {
            // Update them to mode='auto', active forever (10 years)
            const updates = pendingRestart.map(t => {
                const io = new Date();
                io.setFullYear(io.getFullYear() + 10);
                return supabase.from('device_timers').update({
                    mode: 'auto',
                    start_time: new Date().toISOString(),
                    duration_seconds: 0,
                    target_stop_time: io.toISOString()
                }).eq('id', t.id);
            });
            await Promise.all(updates);
            console.log(`[check_timers] Promoted ${pendingRestart.length} pending timers to Active Auto`);
        }

        return new Response(JSON.stringify({
            success: true,
            stopped_devices: Array.from(stopTargets),
            expired_cleared: expiredTimers.length
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('[check_timers] Error:', error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
