import { useState } from "react";
import { Play, Loader2, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import mqtt from "mqtt";

interface MoistureControlPanelProps {
    deviceCode?: string;
}

export function MoistureControlPanel({ deviceCode }: MoistureControlPanelProps) {
    const [mode, setMode] = useState<'manual' | 'auto'>('auto');
    const [interval, setInterval] = useState('5');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleStartManual = async () => {
        setIsLoading(true);
        try {
            console.log('[MoistureControlPanel] Starting manual run for:', deviceCode);
            const { data, error } = await supabase.functions.invoke('run_manual', {
                body: {
                    command: 'run_manual',
                    moisture: 15.0, // Default test value
                    correction: 3.0, // Default test value
                    deviceCode: deviceCode
                }
            });

            if (error) throw error;

            console.log('[MoistureControlPanel] Result:', data);

            if (data.ok) {
                toast({
                    title: "ส่งคำสั่งสำเร็จ",
                    description: `เครื่อง ${deviceCode || 'test'} เริ่มทำงานแล้ว`,
                    variant: "default",
                });
            } else {
                throw new Error(data.message || 'Unknown error');
            }

        } catch (error) {
            console.error('[MoistureControlPanel] Error:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: error instanceof Error ? error.message : "ไม่สามารถส่งคำสั่งได้",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestConnection = () => {
        setIsLoading(true);
        const protocol = 'wss';
        const host = 'mqttserver.riceflow.app';
        const port = 8083; // Standard WS port
        const path = '/mqtt';
        const url = `${protocol}://${host}:${port}${path}`;

        console.log(`[MQTT Test] Connecting to ${url}...`);

        const client = mqtt.connect(url, {
            connectTimeout: 5000,
            clientId: `test_client_${Math.random().toString(16).substr(2, 8)}`,
        });

        client.on('connect', () => {
            console.log('[MQTT Test] Connected!');
            toast({
                title: "เชื่อมต่อสำเร็จ! (Direct)",
                description: "สามารถใช้งานแบบ Direct Connection ได้",
                variant: "default",
            });
            client.end();
            setIsLoading(false);
        });

        client.on('error', (err) => {
            console.error('[MQTT Test] Error:', err);
            // Try fallback port or protocol if needed, but for now just fail
            toast({
                title: "เชื่อมต่อไม่ได้",
                description: `Error: ${err.message}`,
                variant: "destructive",
            });
            client.end();
            setIsLoading(false);
        });

        client.on('offline', () => {
            // If manual close, ignore. If timeout/fail:
            console.log('[MQTT Test] Offline/Timeout');
        });
    };

    return (
        <div className="grid grid-cols-2 gap-2 mt-4">
            {/* Left Column: Toggle Mode */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-1 border border-gray-200 dark:border-gray-700 h-8 sm:h-9 items-center">
                <button
                    onClick={() => setMode('manual')}
                    className={cn(
                        "flex-1 text-xs font-medium py-1 rounded-sm transition-all h-full flex items-center justify-center",
                        mode === 'manual'
                            ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                >
                    Manual
                </button>
                <button
                    onClick={() => setMode('auto')}
                    className={cn(
                        "flex-1 text-xs font-medium py-1 rounded-sm transition-all h-full flex items-center justify-center",
                        mode === 'auto'
                            ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                >
                    Auto
                </button>
            </div>

            {/* Right Column: Controls */}
            <div>
                {mode === 'auto' ? (
                    <Select value={interval} onValueChange={setInterval}>
                        <SelectTrigger className="h-8 sm:h-9 text-xs border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                            <SelectValue placeholder="เลือกเวลา" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 นาที</SelectItem>
                            <SelectItem value="10">10 นาที</SelectItem>
                            <SelectItem value="15">15 นาที</SelectItem>
                            <SelectItem value="30">30 นาที</SelectItem>
                        </SelectContent>
                    </Select>
                ) : (
                    <Button
                        variant="default"
                        className="w-full h-8 sm:h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                        onClick={handleStartManual}
                        disabled={isLoading}
                    >
                        <div className="flex items-center justify-center">
                            {isLoading ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                                <Play className="w-3 h-3 mr-1 fill-current" />
                            )}
                            {isLoading ? "กำลังส่ง..." : "เริ่มต้นทันที"}
                        </div>
                    </Button>
                )}
            </div>

            {/* Connection Test (Debug/Alternative) */}
            <div className="col-span-2 flex justify-center mt-2">
                <button
                    onClick={handleTestConnection}
                    disabled={isLoading}
                    className="text-[10px] text-gray-400 underline hover:text-gray-600 flex items-center"
                >
                    <Wifi className="w-3 h-3 mr-1" />
                    ทดสอบการเชื่อมต่อแบบ Direct (ไม่ต้องใช้ Server)
                </button>
            </div>
        </div>
    );
}
