import React from "react";
import { Droplets, Thermometer, Clock } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface MoistureReadingDisplayProps {
  moistureMachine: number | null;
  moistureModel: number | null;
  temperature: number | null;
  readingTime: string | null;
  isLoading?: boolean;
}

export const MoistureReadingDisplay: React.FC<MoistureReadingDisplayProps> = ({
  moistureMachine,
  moistureModel,
  temperature,
  readingTime,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30 animate-pulse">
        <div className="h-6 bg-blue-200 dark:bg-blue-700 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-blue-100 dark:bg-blue-800/50 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "d MMM yyyy HH:mm", { locale: th });
    } catch {
      return "-";
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
        <Droplets className="w-5 h-5" />
        ค่าความชื้นและอุณหภูมิล่าสุด
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Moisture Machine */}
        <div className="bg-white/80 dark:bg-gray-800/60 rounded-lg p-4 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-2">
            <Droplets className="w-4 h-4" />
            <span className="text-xs font-medium">ความชื้น (เครื่อง)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {moistureMachine !== null ? moistureMachine.toFixed(1) : "-"}
            <span className="text-sm font-normal text-gray-500 ml-1">%</span>
          </p>
        </div>

        {/* Moisture Model */}
        <div className="bg-white/80 dark:bg-gray-800/60 rounded-lg p-4 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-cyan-600 dark:text-cyan-400 mb-2">
            <Droplets className="w-4 h-4" />
            <span className="text-xs font-medium">ความชื้น (โมเดล)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {moistureModel !== null ? moistureModel.toFixed(1) : "-"}
            <span className="text-sm font-normal text-gray-500 ml-1">%</span>
          </p>
        </div>

        {/* Temperature */}
        <div className="bg-white/80 dark:bg-gray-800/60 rounded-lg p-4 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400 mb-2">
            <Thermometer className="w-4 h-4" />
            <span className="text-xs font-medium">อุณหภูมิ</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {temperature !== null ? temperature.toFixed(1) : "-"}
            <span className="text-sm font-normal text-gray-500 ml-1">°C</span>
          </p>
        </div>

        {/* Reading Time */}
        <div className="bg-white/80 dark:bg-gray-800/60 rounded-lg p-4 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">อัพเดทล่าสุด</span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDateTime(readingTime)}
          </p>
        </div>
      </div>
    </div>
  );
};
