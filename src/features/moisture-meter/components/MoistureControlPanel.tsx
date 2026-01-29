
import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function MoistureControlPanel() {
    const [mode, setMode] = useState<'manual' | 'auto'>('auto');
    const [interval, setInterval] = useState('5');

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
                    >
                        <div className="flex items-center justify-center">
                            <Play className="w-3 h-3 mr-1 fill-current" />
                            เริ่มต้นทันที
                        </div>
                    </Button>
                )}
            </div>
        </div>
    );
}
