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
    // Fixed Duration for Manual Timer (5 minutes = 300 seconds)
    const MANUAL_DURATION = 5 * 60;

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

    // Helper: Get stored manual start time
    const getStoredManualStartTime = () => {
        if (typeof window !== 'undefined' && deviceCode) {
            const stored = localStorage.getItem(`moisture_manual_start_${deviceCode}`);
            return stored ? parseInt(stored) : null;
        }
        return null;
    };

    // Timer State for Manual Mode (in seconds)
    const [manualTimeLeft, setManualTimeLeft] = useState<number | null>(() => {
        // Initialize timer from storage if running in manual mode
        if (typeof window !== 'undefined' && deviceCode) {
            const isRunningSaved = localStorage.getItem(`moisture_running_${deviceCode}`) === 'true';
            const modeSaved = localStorage.getItem(`moisture_mode_${deviceCode}`);

            if (isRunningSaved && modeSaved === 'manual') {
                const startTime = getStoredManualStartTime();
                if (startTime) {
                    const elapsed = Math.floor((Date.now() - startTime) / 1000);
                    const remaining = MANUAL_DURATION - elapsed;
                    return remaining > 0 ? remaining : 0;
                }
            }
        }
        return null;
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
            stopMachine('Auto Safety Stop');
        }
    }, [isNoRice, mode, isRunning]);


    // Effect: Manual Timer Countdown
    useEffect(() => {
        let timer: NodeJS.Timeout;

        // If time is already 0 on init, handle stop check
        if (manualTimeLeft === 0 && isRunning && mode === 'manual') {
            handleManualFinishedAutoSwitch();
            return;
        }

        if (isRunning && mode === 'manual' && manualTimeLeft !== null && manualTimeLeft > 0) {
            timer = setInterval(() => {
                setManualTimeLeft((prev) => {
                    if (prev === null || prev <= 0) return 0;
                    return prev - 1;
                });
            }, 1000);
        } else if (manualTimeLeft === 0 && isRunning && mode === 'manual') {
            // Timer finished
            handleManualFinishedAutoSwitch();
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isRunning, mode, manualTimeLeft]);

    // Helper: Handle Manual Finished -> Switch to Auto
    const handleManualFinishedAutoSwitch = async () => {
        console.log('[MoistureControlPanel] Manual Timer Finished. Switching to Auto...');

        // 1. Reset timer state locally first to stop loop
        setManualTimeLeft(null);
        localStorage.removeItem(`moisture_manual_start_${deviceCode}`); // Clear start time

        // 2. Set Mode to Auto
        setMode('auto');
        saveModeToStorage('auto');

        // 3. Start Auto Mode
        // We reuse startAuto logic but need to be careful about state updates
        await startAuto();

        toast({
            title: "จบโหมด Manual -> เริ่ม Auto",
            description: "ครบ 5 นาทีแล้ว เครื่องสลับเป็นโหมด Auto โดยอัตโนมัติ",
            className: "bg-blue-50 border-blue-200 text-blue-800",
        });
    };


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
            setManualTimeLeft(null); // Reset timer state

            // Clear Storage
            saveRunningToStorage(false);
            if (deviceCode) localStorage.removeItem(`moisture_manual_start_${deviceCode}`);

            if (reasonContext === 'Auto Safety Stop') {
                setMode('manual');
                saveModeToStorage('manual');
            }

            toast({
                title: "หยุดการทำงานสำเร็จ",
                description: reasonContext === 'Manual Timer Finished'
                    ? "ครบเวลาทำงาน 5 นาทีแล้ว (Manual)"
                    : reasonContext
                        ? `ระบบหยุดทำงานอัตโนมัติ (${reasonContext})`
                        : "สั่งหยุดเครื่องเรียบร้อยแล้ว",
                variant: reasonContext ? "default" : "default",
                className: reasonContext === 'Manual Timer Finished' ? "bg-green-50 border-green-200 text-green-800" : undefined
            });

        } catch (error) {
            console.error('[MoistureControlPanel] Stop Error:', error);
            toast({
                title: "หยุดการทำงานไม่สำเร็จ",
                description: "เกิดข้อผิดพลาดในการส่งคำสั่งหยุด",
                variant: "destructive",
            });
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

            // Start Timer Persistence
            const now = Date.now();
            if (deviceCode) localStorage.setItem(`moisture_manual_start_${deviceCode}`, now.toString());
            setManualTimeLeft(MANUAL_DURATION);

            toast({
                title: "เริ่มโหมด Manual",
                description: "เริ่มทำงาน 3 นาทีครึ่งนับถอยหลัง",
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
            // Clear Manual Timer if switching to Auto (shouldn't happen directly but good cleanup)
            if (deviceCode) localStorage.removeItem(`moisture_manual_start_${deviceCode}`);
            setManualTimeLeft(null);

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

    // Auto Restart Timer State (for Auto Mode when stopped)
    const [autoRestartTimeLeft, setAutoRestartTimeLeft] = useState<number | null>(null);

    // Initial Fetch for Server-Side Timer (Persistence)
    useEffect(() => {
        const fetchTimer = async () => {
            if (!deviceCode) return;
            const { data, error } = await supabase
                .from('device_timers' as any)
                .select('*')
                .eq('device_code', deviceCode)
                .single();

            if (error) {
                // Ignore 'PGRST116' (no rows) - logic is fine
                if (error.code !== 'PGRST116') console.error('Error fetching timer:', error);
                return;
            }

            const timerData = data as any;

            if (timerData && timerData.mode === 'pending_auto_restart') {
                const now = new Date();
                const target = new Date(timerData.target_stop_time);
                const diff = Math.ceil((target.getTime() - now.getTime()) / 1000);

                if (diff > 0) {
                    setAutoRestartTimeLeft(diff);
                } else {
                    // It expired while we were away/loading, let the interval handle trigger or wait for next check
                    setAutoRestartTimeLeft(0);
                }
            }
        };

        fetchTimer();

        // Subscribe to changes? For now, fetch on mount is enough for refresh persistence. 
        // Real-time updates might overwrite local countdown smoothness, so we trust local once started.
    }, [deviceCode]);

    // Effect: Auto Restart Countdown (Only when Stopped + Auto Mode)
    useEffect(() => {
        let restartTimer: NodeJS.Timeout;

        // If stopped in Auto mode, start countdown (regardless of NoRice - acts as Auto Retry)
        if (!isRunning && mode === 'auto') {

            // Initialize if null
            if (autoRestartTimeLeft === null) {
                setAutoRestartTimeLeft(60); // 1 minute
            }

            // Countdown
            else if (autoRestartTimeLeft > 0) {
                restartTimer = setInterval(() => {
                    setAutoRestartTimeLeft(prev => (prev ? prev - 1 : 0));
                }, 1000);
            }

            // Trigger Auto Start
            else if (autoRestartTimeLeft === 0) {
                console.log('[MoistureControlPanel] Auto Restart Triggered');
                startAuto();
                setAutoRestartTimeLeft(null); // Reset
            }

        } else {
            // Reset if conditions not met (e.g. switched to manual, or running, or NoRice)
            if (autoRestartTimeLeft !== null) setAutoRestartTimeLeft(null);
        }

        return () => {
            if (restartTimer) clearInterval(restartTimer);
        };
    }, [isRunning, mode, autoRestartTimeLeft]);


    // Handlers
    const handleToggleRun = () => {
        if (isRunning) {
            stopMachine();
            // If stopping in Auto mode, init countdown
            // Note: stopMachine is async, but we can optimistically set this
            // We need to check current mode (before update state)
            if (mode === 'auto') {
                setAutoRestartTimeLeft(60);
            }
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

    // Format Seconds to MM:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
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
                        {mode === 'manual' && manualTimeLeft !== null
                            ? `หยุดทำงาน (${formatTime(manualTimeLeft)})`
                            : "หยุดทำงาน"}
                    </>
                ) : (
                    <>
                        <Power className="mr-2 h-5 w-5" />
                        {mode === 'manual'
                            ? "เริ่มทำงาน (Manual)"
                            : (autoRestartTimeLeft !== null
                                ? `เริ่มทำงาน (Auto) - เริ่มเองใน ${autoRestartTimeLeft}s`
                                : "เริ่มทำงาน (Auto)"
                            )
                        }
                    </>
                )}
            </Button>

            {/* Helper Text */}
            <div className="text-center">
                <p className="text-[10px] text-gray-400">
                    {mode === 'manual'
                        ? (isRunning ? "ระบบ Manual กำลังทำงานนับถอยหลัง" : "")
                        : (isRunning ? "ระบบ Auto กำลังทำงาน" : "")
                    }
                </p>
            </div>
        </div>
    );
}
