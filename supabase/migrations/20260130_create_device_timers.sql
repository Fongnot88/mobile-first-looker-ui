-- Create table for tracking device timers (Active Sessions)
CREATE TABLE IF NOT EXISTS "public"."device_timers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "device_code" TEXT NOT NULL,
    "mode" TEXT NOT NULL, -- 'manual' or 'auto'
    "start_time" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "duration_seconds" INTEGER, -- Duration in seconds
    "target_stop_time" TIMESTAMPTZ NOT NULL, -- Calculated stop time
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

-- Add unique constraint to prevent multiple timers for same device
CREATE UNIQUE INDEX IF NOT EXISTS "device_timers_device_code_key" ON "public"."device_timers" ("device_code");

-- Enable RLS
ALTER TABLE "public"."device_timers" ENABLE ROW LEVEL SECURITY;

-- Allow full access to authenticated users (or service role)
CREATE POLICY "Enable all for users" ON "public"."device_timers"
    FOR ALL USING (true) WITH CHECK (true);
