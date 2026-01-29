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

        // A. Check Expired Timers
        const now = new Date();
        const expiredTimers = activeTimers?.filter(t => new Date(t.target_stop_time) <= now) || [];

        expiredTimers.forEach(t => stopTargets.add(t.device_code));

        // B. Check Safety Stop Targets (Devices NOT in activeTimers)
        // "Every 1 minute UNTIL start or auto mode"
        allDevices?.forEach(d => {
            if (!activeDeviceCodes.has(d.device_code)) {
                stopTargets.add(d.device_code);
            }
        });

        if (stopTargets.size === 0) {
            return new Response(JSON.stringify({ message: "No actions needed" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`[check_timers] Need to STOP ${stopTargets.size} devices:`, Array.from(stopTargets));

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

                const promises = Array.from(stopTargets).map(deviceCode => {
                    const topic = `c2tech/${deviceCode}/cmd`;
                    const payload = JSON.stringify({
                        cmd: "stop",
                        mode: "manual",
                        timestamp: new Date().toISOString()
                    });
                    return new Promise((r) => client.publish(topic, payload, { qos: 1 }, r));
                });

                await Promise.all(promises);
                console.log(`[check_timers] Sent STOP to ${stopTargets.size} devices`);
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
        if (expiredTimers.length > 0) {
            const idsToDelete = expiredTimers.map(t => t.id);
            await supabase.from('device_timers').delete().in('id', idsToDelete);
            console.log(`[check_timers] Deleted ${expiredTimers.length} expired timers`);
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
