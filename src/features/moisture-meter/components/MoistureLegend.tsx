import React from 'react';

export const MoistureLegend: React.FC = () => {
  return (
    <div className="bg-white/70 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
      <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
        🎨 คำอธิบายสี
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Device Reading */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyan-400 rounded" />
          <span className="text-xs text-gray-700 dark:text-gray-300">
            ความชื้นจากอุปกรณ์
          </span>
        </div>

        {/* Real-time */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded" />
          <span className="text-xs text-gray-700 dark:text-gray-300">
            Real Time
          </span>
        </div>

        {/* Warning */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded" />
          <span className="text-xs text-gray-700 dark:text-gray-300">
            เฝ้าระวัง (Warning)
          </span>
        </div>

        {/* Alert */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-xs text-gray-700 dark:text-gray-300">
            เตือน (Critical)
          </span>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-400">
          สถานะเครื่อง:
        </h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              ออนไลน์
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              ต้องตรวจสอบ
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              ออฟไลน์
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
