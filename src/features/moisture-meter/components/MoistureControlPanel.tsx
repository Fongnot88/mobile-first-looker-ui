import { useState, useEffect } from "react";
import { Play, Loader2, Square, AlertTriangle, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MoistureControlPanelProps {
    deviceCode?: string;
    currentTemperature?: number | null;
    currentMoisture?: number | null;
}

export function MoistureControlPanel({ deviceCode, currentTemperature, currentMoisture }: MoistureControlPanelProps) {
    // Mode State: 'manual' or 'auto'
    const [mode, setMode] = useState<'manual' | 'auto'>(() => {
        if (typeof window !== 'undefined' && deviceCode) {
            const saved = localStorage.getItem(`moisture_mode_${deviceCode}`);
            return saved === 'manual' ? 'manual' : 'auto';
        }
        return 'auto';
    });

    // Running State
    const [isRunning, setIsRunning] = useState(() => {
        if (typeof window !== 'undefined' && deviceCode) {
            return localStorage.getItem(`moisture_running_${deviceCode}`) === 'true';
        }
        return false;
    });

    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Check for "No Rice" condition
    const isNoRice = currentTemperature === 0 && currentMoisture === 0;

    // Fixed Interval for Auto Mode
    const FIXED_INTERVAL = '5';

    // Effect: Handle "No Rice" safety switch
    useEffect(() => {
        if (isNoRice && mode === 'auto' && isRunning) {
            console.log('[MoistureControlPanel] Safety Trigger: No Rice detected. Stopping...');
            // In a real scenario, we might want to trigger a stop command here too.
            // For now, we force UI state to manual and stop.
            stopMachine('Auto Safety Stop');
        }
    }, [isNoRice, mode, isRunning]);

    // Helper: Stop Machine (Universal)
    const stopMachine = async (reasonContext: string = '') => {
        setIsLoading(true);
        try {
            console.log(`[MoistureControlPanel] Stopping... (${reasonContext})`);
            const { error } = await supabase.functions.invoke('run_manual', {
                body: {
                    command: 'stop',
                    mode: 'manual', // Defaulting to manual on stop is safer
                    deviceCode: deviceCode
                }
            });

            if (error) throw error;

            // Update State
            setIsRunning(false);
            if (reasonContext === 'Auto Safety Stop') {
                setMode('manual');
                saveModeToStorage('manual');
            }
            saveRunningToStorage(false);

            toast({
                title: "หยุดการทำงานสำเร็จ",
                description: reasonContext ? `ระบบหยุดทำงานอัตโนมัติ (${reasonContext})` : "สั่งหยุดเครื่องเรียบร้อยแล้ว",
                variant: reasonContext ? "destructive" : "default", // Alert style if forced stop
            });

        } catch (error) {
            console.error('[MoistureControlPanel] Stop Error:', error);
            toast({
                title: "หยุดการทำงานไม่สำเร็จ",
                description: "เกิดข้อผิดพลาดในการส่งคำสั่งหยุด",
                variant: "destructive",
            });
            // Revert optimistic state if needed, but for stop we usually want to show stopped locally if possible
            // forcing false just in case? No, let user retry.
        } finally {
            setIsLoading(false);
        }
    };

    // Helper: Start Manual
    const startManual = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.functions.invoke('run_manual', {
                body: {
                    command: 'run_manual',
                    mode: 'manual',
                    deviceCode: deviceCode
                }
            });

            if (error) throw error;

            setIsRunning(true);
            saveRunningToStorage(true);
            toast({
                title: "เริ่มโหมด Manual",
                description: "เครื่องเริ่มทำงานในโหมด Manual แล้ว",
                className: "bg-emerald-50 border-emerald-200 text-emerald-800",
            });

        } catch (error) {
            console.error('[MoistureControlPanel] Start Manual Error:', error);
            toast({
                title: "เริ่มงานไม่สำเร็จ",
                description: "เกิดข้อผิดพลาดในการส่งคำสั่ง",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Helper: Start Auto
    const startAuto = async () => {
        setIsLoading(true);
        try {
            // 1. Set Interval (Fixed 5 mins)
            // Note: Sending 'auto' mode implicitly with interval
            const { error: intervalError } = await supabase.functions.invoke('run_manual', {
                body: {
                    command: 'set_interval',
                    interval: parseInt(FIXED_INTERVAL),
                    mode: 'auto',
                    deviceCode: deviceCode
                }
            });
            if (intervalError) throw intervalError;

            // 2. Set Mode & Start
            // Some backends might need explicit start command or just setting mode triggers it.
            // Based on previous logic, we used 'set_mode' which acts as start? 
            // Or 'run_manual' is only for manual?
            // Previous code: sendModeToBackend('auto') -> calls set_mode. 
            // Let's assume set_mode 'auto' starts it.
            const { error: modeError } = await supabase.functions.invoke('run_manual', {
                body: {
                    command: 'set_mode',
                    mode: 'auto',
                    interval: parseInt(FIXED_INTERVAL),
                    deviceCode: deviceCode
                }
            });
            if (modeError) throw modeError;

            setIsRunning(true);
            saveRunningToStorage(true);
            toast({
                title: "เริ่มโหมด Auto",
                description: `เครื่องเริ่มทำงานอัตโนมัติ (หยุดพัก ${FIXED_INTERVAL} นาที)`,
                className: "bg-blue-50 border-blue-200 text-blue-800",
            });

        } catch (error) {
            console.error('[MoistureControlPanel] Start Auto Error:', error);
            toast({
                title: "เริ่ม Auto ไม่สำเร็จ",
                description: "เกิดข้อผิดพลาดในการตั้งค่าหรือเริ่มทำงาน",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handlers
    const handleToggleRun = () => {
        if (isRunning) {
            stopMachine();
        } else {
            if (mode === 'manual') startManual();
            else startAuto();
        }
    };

    const handleModeSwitch = (newMode: 'manual' | 'auto') => {
        if (isRunning) return; // Prevent switch if running
        setMode(newMode);
        saveModeToStorage(newMode);
    };

    // Storage Helpers
    const saveModeToStorage = (m: string) => {
        if (typeof window !== 'undefined' && deviceCode) {
            localStorage.setItem(`moisture_mode_${deviceCode}`, m);
        }
    };
    const saveRunningToStorage = (r: boolean) => {
        if (typeof window !== 'undefined' && deviceCode) {
            localStorage.setItem(`moisture_running_${deviceCode}`, String(r));
        }
    };

    return (
        <div className="flex flex-col gap-4 p-1">
            {/* Status & Alerts */}
            {isNoRice && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold">ไม่มีข้าว - ระบบหยุดอัตโนมัติ</span>
                </div>
            )}

            {/* Mode Switcher (Segmented Control) */}
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex relative h-10 shadow-inner">
                {/* Manual Tab */}
                <button
                    onClick={() => handleModeSwitch('manual')}
                    disabled={isRunning}
                    className={cn(
                        "flex-1 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center relative z-10",
                        mode === 'manual'
                            ? "bg-white dark:bg-gray-700 text-emerald-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700",
                        isRunning && mode !== 'manual' && "opacity-50 cursor-not-allowed",
                        isRunning && mode === 'manual' && "text-emerald-700 font-bold" // Active locked state
                    )}
                >
                    Manual
                </button>

                {/* Auto Tab */}
                <button
                    onClick={() => handleModeSwitch('auto')}
                    disabled={isRunning}
                    className={cn(
                        "flex-1 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center relative z-10",
                        mode === 'auto'
                            ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700",
                        isRunning && mode !== 'auto' && "opacity-50 cursor-not-allowed",
                        isRunning && mode === 'auto' && "text-blue-700 font-bold"
                    )}
                >
                    Auto
                </button>
            </div>

            {/* Main Action Button */}
            <Button
                size="lg"
                onClick={handleToggleRun}
                disabled={isLoading}
                className={cn(
                    "w-full h-12 text-base font-semibold shadow-md transition-all duration-300",
                    // Running State (Stop Button)
                    isRunning
                        ? "bg-red-500 hover:bg-red-600 text-white hover:shadow-red-200 dark:hover:shadow-none"
                        : // Stopped State (Start Button) - Color depends on mode
                        mode === 'manual'
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-200 dark:hover:shadow-none"
                            : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-200 dark:hover:shadow-none"
                )}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : isRunning ? (
                    <>
                        <Square className="mr-2 h-5 w-5 fill-current" />
                        หยุดทำงาน
                    </>
                ) : (
                    <>
                        <Power className="mr-2 h-5 w-5" />
                        {mode === 'manual' ? "เริ่มทำงาน (Manual)" : "เริ่มทำงาน (Auto)"}
                    </>
                )}
            </Button>

            {/* Helper Text */}
            <div className="text-center">
                <p className="text-[10px] text-gray-400">
                    {isRunning
                        ? "ระบบกำลังทำงาน กดหยุดเพื่อเปลี่ยนโหมด"
                        : "เลือกโหมดที่ต้องการแล้วกดเริ่มทำงาน"}
                </p>
            </div>
        </div>
    );
}
