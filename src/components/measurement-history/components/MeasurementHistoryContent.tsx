
import React from 'react';
import { DeviceHeader } from "@/features/device-details/components/DeviceHeader";
import { Wheat, ArrowLeft } from "lucide-react";
import HistoryHeader from "../HistoryHeader";
import HistoryChart from "../HistoryChart";
import HistoryFooter from "../HistoryFooter";
import { NotificationSettingsDialog } from "../notification-settings";
// FilteredDatabaseTable ถูกลบออกตามที่ต้องการ
import { TimeFrame } from "../MeasurementHistory";
import { DeviceHistoryTable } from "@/features/device-details/components/DeviceHistoryTable";
import { useNavigationHistory } from "@/hooks/useNavigationHistory";

interface MeasurementHistoryContentProps {
  deviceCode: string;
  symbol: string;
  name: string;
  unit?: string;
  onClose?: () => void;
  historyData: any[];
  isLoading: boolean;
  isError: boolean;
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
  averageValue: number;
  minValue: number;
  maxValue: number;
  settingsOpen: boolean;
  handleOpenChange: (open: boolean) => void;
  notificationEnabled: boolean;
}

const MeasurementHistoryContent: React.FC<MeasurementHistoryContentProps> = ({
  deviceCode,
  symbol,
  name,
  unit,
  onClose,
  historyData,
  isLoading,
  isError,
  timeFrame,
  setTimeFrame,
  averageValue,
  minValue,
  maxValue,
  settingsOpen,
  handleOpenChange,
  notificationEnabled
}) => {
  const { handleBack } = useNavigationHistory();

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          {/* Back Button - Above Device Header */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors duration-150 mb-2"
            >
              <ArrowLeft size={16} />
              ย้อนกลับ
            </button>
          )}
          
          {/* Device Header - Left aligned */}
          <DeviceHeader deviceCode={deviceCode} />
        </div>
        
        <div className="flex items-center relative">
          {/* Wheat icon group with varied sizes and positions */}
          <Wheat className="text-amber-400 absolute -top-3 -left-8" size={16} strokeWidth={2.5} />
          <Wheat className="text-amber-500 mr-1" size={20} strokeWidth={2.5} />
          <Wheat className="text-amber-600" size={18} strokeWidth={2.5} />
          <Wheat className="text-amber-700 ml-1" size={14} strokeWidth={2.5} />
          <Wheat className="text-yellow-600 absolute -bottom-2 -right-3" size={12} strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-4 dark:text-white">
        <HistoryHeader 
          name={name}
          unit={unit}
          average={averageValue}
          min={minValue}
          max={maxValue}
          onOpenSettings={() => handleOpenChange(true)}
          notificationEnabled={notificationEnabled}
          deviceCode={deviceCode}
        />
        
        <HistoryFooter 
          timeFrame={timeFrame}
          onTimeFrameChange={setTimeFrame} 
        />
        
        <div className="space-y-6">
          <HistoryChart 
            historyData={historyData} 
            dataKey={symbol}
            isLoading={isLoading}
            error={isError ? "ไม่สามารถโหลดข้อมูลได้" : null}
            unit={unit}
            timeFrame={timeFrame}
            styleOptions={{
              graphStyle: 'line',
              lineColor: '#10B981',
            }}
          />
          
          {/* ตารางประวัติข้อมูล */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 -mt-2 dark:text-white">
                      <DeviceHistoryTable deviceIds={[deviceCode]} />
          </div>
        </div>
        
        <NotificationSettingsDialog
          open={settingsOpen}
          onOpenChange={handleOpenChange}
          deviceCode={deviceCode}
          symbol={symbol}
          name={name}
        />
      </div>
      
      {/* FilteredDatabaseTable ถูกลบออกตามที่ต้องการ */}
    </>
  );
};

export default MeasurementHistoryContent;
