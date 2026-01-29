import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import mqtt from "npm:mqtt";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SimulatePayload {
    deviceCode: string;
    type: 'no-rice' | 'rice';
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
            message: 'Method not allowed'
        }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    try {
        const payload: SimulatePayload = await req.json();
        console.log('[simulate_sensor] Received payload:', JSON.stringify(payload));

        if (!payload.deviceCode) {
            throw new Error('Device Code is required');
        }

        // --- MQTT Logic ---
        console.log('[simulate_sensor] Connecting to MQTT broker...');
        // Add reconnectPeriod: 0 to prevent loops, and use clean: true
        const client = mqtt.connect('mqtt://mqttserver.riceflow.app:1883', {
            username: 'myuser',
            password: 'mypass',
            reconnectPeriod: 0,
            connectTimeout: 5000
        });

        const publishPromise = new Promise((resolve, reject) => {
            client.once('connect', () => {
                console.log('[simulate_sensor] MQTT Connected');

                // Target topic: c2tech/{deviceCode}/telemetry (Assumption based on use case)
                const topic = `c2tech/${payload.deviceCode}/telemetry`;

                // User Requested Payload:
                // $time, $moisture_machine, $temperature, $device_code, $event
                // time = timestamp
                // moisture_machine = 0 or 1
                // temperature = 0 or 1
                // device_code = payload.deviceCode
                // event = test

                const isRice = payload.type === 'rice';
                const value = isRice ? 1 : 0;

                const mqttPayload = {
                    time: new Date().toISOString(),
                    moisture_machine: value,
                    temperature: value,
                    device_code: payload.deviceCode,
                    event: 'test'
                };

                const message = JSON.stringify(mqttPayload);

                console.log(`[simulate_sensor] Publishing to ${topic}:`, message);

                client.publish(topic, message, { qos: 1 }, (err) => {
                    if (err) {
                        console.error('[simulate_sensor] MQTT Publish Error:', err);
                        client.end();
                        reject(err);
                    } else {
                        console.log('[simulate_sensor] Publish Success');
                        client.end();
                        resolve({ topic, message });
                    }
                });
            });

            client.on('error', (err) => {
                console.error('[simulate_sensor] MQTT Connection Error:', err);
                client.end();
                reject(err);
            });
        });

        await publishPromise;

        return new Response(JSON.stringify({
            ok: true,
            message: `Simulated ${payload.type} for ${payload.deviceCode}`,
            data: payload
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('[simulate_sensor] Error:', error);
        return new Response(JSON.stringify({
            ok: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
