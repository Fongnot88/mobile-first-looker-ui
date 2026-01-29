import { useState } from "react";
import { Play, Loader2, Square } from "lucide-react";
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

interface MoistureControlPanelProps {
    deviceCode?: string;
}

export function MoistureControlPanel({ deviceCode }: MoistureControlPanelProps) {
    const [mode, setMode] = useState<'manual' | 'auto'>(() => {
        if (typeof window !== 'undefined' && deviceCode) {
            const saved = localStorage.getItem(`moisture_mode_${deviceCode}`);
            return saved === 'manual' ? 'manual' : 'auto';
        }
        return 'auto';
    });
    const [interval, setInterval] = useState(() => {
        if (typeof window !== 'undefined' && deviceCode) {
            return localStorage.getItem(`moisture_interval_${deviceCode}`) || '5';
        }
        return '5';
    });
    const [isRunning, setIsRunning] = useState(() => {
        if (typeof window !== 'undefined' && deviceCode) {
            return localStorage.getItem(`moisture_running_${deviceCode}`) === 'true';
        }
        return false;
    });
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleModeChange = async (newMode: 'manual' | 'auto') => {
        setMode(newMode);
        if (deviceCode) {
            localStorage.setItem(`moisture_mode_${deviceCode}`, newMode);
        }

        // MQTT: Send SET_MODE command immediately
        try {
            console.log('[MoistureControlPanel] Mode change:', newMode);
            const { error: fnError } = await supabase.functions.invoke('run_manual', {
                body: {
                    command: 'set_mode',
                    mode: newMode,
                    interval: parseInt(interval),
                    deviceCode: deviceCode
                }
            });

            if (fnError) throw fnError;

            toast({
                title: "เปลี่ยนโหมดสำเร็จ",
                description: `เปลี่ยนเป็นโหมด ${newMode.toUpperCase()} เรียบร้อย`,
                variant: "default",
            });

        } catch (error) {
            console.error('[MoistureControlPanel] Mode Change Error:', error);
            toast({
                title: "แจ้งเปลี่ยนโหมดไม่สำเร็จ",
                description: "เปลี่ยนโหมดที่หน้าแอปได้ แต่ส่งคำสั่งไปเครื่องล้มเหลว",
                variant: "destructive",
            });
        }
    };

    const handleIntervalChange = async (newInterval: string) => {
        setInterval(newInterval);
        if (deviceCode) {
            localStorage.setItem(`moisture_interval_${deviceCode}`, newInterval);
        }

        try {
            console.log('[MoistureControlPanel] Set interval:', newInterval);
            const { error: fnError } = await supabase.functions.invoke('run_manual', {
                body: {
                    command: 'set_interval',
                    interval: parseInt(newInterval),
                    mode: 'auto',
                    deviceCode: deviceCode
                }
            });

            if (fnError) throw fnError;

            toast({
                title: "ตั้งค่าเวลาสำเร็จ",
                description: `ตั้งเวลา Auto เป็น ${newInterval} นาที`,
                variant: "default",
            });

        } catch (error) {
            console.error('[MoistureControlPanel] Set Interval Error:', error);
            toast({
                title: "ตั้งค่าเวลาไม่สำเร็จ",
                description: "บันทึกในเครื่องสำเร็จ แต่ส่งคำสั่งไปเครื่องล้มเหลว",
                variant: "destructive",
            });
        }
    };

    const handleToggleRun = async () => {
        setIsLoading(true);
        const newRunState = !isRunning;
        setIsRunning(newRunState); // Optimistic update

        if (deviceCode) {
            localStorage.setItem(`moisture_running_${deviceCode}`, String(newRunState));
        }

        try {
            const command = newRunState ? 'run_manual' : 'stop';
            console.log(`[MoistureControlPanel] Sending command: ${command} for:`, deviceCode);

            const { data, error } = await supabase.functions.invoke('run_manual', {
                body: {
                    command: command,
                    mode: 'manual',
                    deviceCode: deviceCode
                }
            });

            if (error) throw error;

            console.log('[MoistureControlPanel] Result:', data);

            if (data.ok) {
                toast({
                    title: newRunState ? "เริ่มทำงานสำเร็จ" : "หยุดทำงานสำเร็จ",
                    description: `เครื่อง ${deviceCode || 'test'} ${newRunState ? 'เริ่มทำงานแล้ว' : 'หยุดทำงานแล้ว'}`,
                    variant: newRunState ? "default" : "destructive",
                });
            } else {
                // Revert state if failed
                setIsRunning(!newRunState);
                if (deviceCode) {
                    localStorage.setItem(`moisture_running_${deviceCode}`, String(!newRunState));
                }
                throw new Error(data.message || 'Unknown error');
            }

        } catch (error) {
            console.error('[MoistureControlPanel] Error:', error);
            // Revert state on error
            setIsRunning(!newRunState);
            if (deviceCode) {
                localStorage.setItem(`moisture_running_${deviceCode}`, String(!newRunState));
            }

            toast({
                title: "เกิดข้อผิดพลาด",
                description: `ไม่สามารถส่งคำสั่ง ${newRunState ? 'เริ่ม' : 'หยุด'} ได้: ${(error as Error).message}`,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-2 mt-4">
            {/* Left Column: Toggle Mode */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-1 border border-gray-200 dark:border-gray-700 h-8 sm:h-9 items-center">
                <button
                    onClick={() => handleModeChange('manual')}
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
                    onClick={() => handleModeChange('auto')}
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
                    <Select value={interval} onValueChange={handleIntervalChange}>
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
                        className={cn(
                            "w-full h-8 sm:h-9 text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg border-0",
                            isRunning
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                        onClick={handleToggleRun}
                        disabled={isLoading}
                    >
                        <div className="flex items-center justify-center">
                            {isLoading ? (
                                <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            ) : isRunning ? (
                                <Square className="mr-2 h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                            ) : (
                                <Play className="mr-2 h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                            )}
                            {isLoading ? "กำลังส่ง..." : isRunning ? "หยุด" : "เริ่มต้นทันที"}
                        </div>
                    </Button>
                )}
            </div>
        </div>
    );
}
