
import React, { Suspense, useState, useMemo, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Wheat, ArrowLeft, AlertTriangle } from "lucide-react";
import { DeviceHeader } from "./DeviceHeader";
import { MeasurementTabs } from "./MeasurementTabs";
import { DeviceCalculationSummary } from "./DeviceCalculationSummary";
import { NotificationSetting } from "../types";
import { lazy } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { MoistureDeviceDetail, MoistureSummaryStats } from "@/features/moisture-meter/components/MoistureDeviceDetail";
import { MoistureTrendChart } from "@/features/moisture-meter/components/MoistureTrendChart";
import { MoistureSnapshotBarChart } from "@/features/moisture-meter/components/moisture-snapshot-bar-chart";
import { MoistureDeviceHistoryTable } from "@/features/moisture-meter/components/MoistureDeviceHistoryTable";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { useLatestMoistureReading } from "@/features/moisture-meter/hooks/useLatestMoistureReading";
import { useMoistureHistory, MoistureTimeFrame } from "@/features/moisture-meter/hooks/useMoistureHistory";
import { useMoistureMeterSettingByDeviceCode } from "@/features/moisture-meter/hooks/useMoistureMeterSettings";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MoistureControlPanel } from "@/features/moisture-meter/components/MoistureControlPanel";

// Lazy load the DeviceHistoryTable component
const DeviceHistoryTable = lazy(() => import("./DeviceHistoryTable").then(module => ({
  default: module.DeviceHistoryTable
})));

interface DeviceMainContentProps {
  deviceCode: string;
  searchTerm: string;
  wholeGrainData: any[] | null;
  ingredientsData: any[] | null;
  impuritiesData: any[] | null;
  allData: any[] | null;
  notificationSettings: NotificationSetting[];
  isLoadingWholeGrain: boolean;
  isLoadingIngredients: boolean;
  isLoadingImpurities: boolean;
  isLoadingAllData: boolean;
  isGuest: boolean;
  onMeasurementClick: (symbol: string, name: string) => void;
  onBack?: () => void;
}

export const DeviceMainContent: React.FC<DeviceMainContentProps> = ({
  deviceCode,
  searchTerm,
  wholeGrainData,
  ingredientsData,
  impuritiesData,
  allData,
  notificationSettings,
  isLoadingWholeGrain,
  isLoadingIngredients,
  isLoadingImpurities,
  isLoadingAllData,
  isGuest,
  onMeasurementClick,
  onBack
}) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [timeFrame, setTimeFrame] = useState<MoistureTimeFrame>('24h');

  // Check if this is a moisture meter device (case-insensitive)
  const isMoistureMeter = deviceCode?.toLowerCase().startsWith('mm');

  // Fetch latest moisture reading for moisture meter devices
  const { data: latestReading, isLoading: isLoadingMoisture } = useLatestMoistureReading(
    isMoistureMeter ? deviceCode : ''
  );

  // Fetch moisture meter settings
  const { data: moistureSettings } = useMoistureMeterSettingByDeviceCode(
    isMoistureMeter ? deviceCode : ''
  );

  // Fetch moisture history for trend chart
  const { data: moistureHistory, isLoading: isLoadingHistory } = useMoistureHistory(
    isMoistureMeter ? deviceCode : '',
    { limit: 50, timeFrame }
  );

  // Calculate moisture summary stats for overview card
  const moistureSummary: MoistureSummaryStats | null = useMemo(() => {
    if (!moistureHistory || moistureHistory.length === 0) return null;

    const moistureValues = moistureHistory
      .map(reading => reading.moisture_machine ?? reading.moisture_model)
      .filter((value): value is number => value !== null && value !== undefined);

    if (moistureValues.length === 0) return null;

    const averageMoisture =
      moistureValues.reduce((sum, value) => sum + value, 0) / moistureValues.length;

    const maxMoisture = Math.max(...moistureValues);
    const minMoisture = Math.min(...moistureValues);

    const temperatureValues = moistureHistory
      .map(reading => reading.temperature)
      .filter((value): value is number => value !== null && value !== undefined);

    const averageTemperature =
      temperatureValues.length > 0
        ? temperatureValues.reduce((sum, value) => sum + value, 0) / temperatureValues.length
        : null;

    return {
      averageMoisture,
      maxMoisture,
      minMoisture,
      averageTemperature,
    };
  }, [moistureHistory]);

  // Reference for chart section
  const chartRef = useRef<HTMLDivElement>(null);

  const handleScrollToChart = () => {
    chartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-32' : 'pb-4'}>
      <div className="flex-1">
        <div className="mb-3 flex justify-between items-center">
          <div className="flex flex-col">
            {/* Back Button - Above Device Header */}
            {onBack && (
              <button
                onClick={onBack}
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

        {/* Show Moisture Device Detail and Trend Chart for MM devices */}
        {isMoistureMeter ? (
          <div className="space-y-6 mb-6">
            {/* Moisture Meter Control Panel - Relocated here */}

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm w-full max-w-sm ml-auto">
              <MoistureControlPanel
                deviceCode={deviceCode}
                currentTemperature={latestReading?.temperature ?? null}
                currentMoisture={latestReading?.moisture_machine ?? null}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                เลือกกรอบเวลา
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  { value: '5m', label: '5 นาที' },
                  { value: '15m', label: '15 นาที' },
                  { value: '30m', label: '30 นาที' },
                  { value: '1h', label: '1 ชั่วโมง' },
                  { value: '24h', label: '24 ชั่วโมง' },
                  { value: '7d', label: '7 วัน' },
                  { value: '30d', label: '30 วัน' },
                ] as { value: MoistureTimeFrame; label: string }[]).map((option) => {
                  const isActive = timeFrame === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTimeFrame(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${isActive
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
                        }`}
                      aria-pressed={isActive}
                      type="button"
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zero Moisture Alert */}
            {latestReading?.moisture_machine === 0 && (
              <div className="flex justify-end mt-2 animate-pulse">
                <div className="bg-red-400 text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm shadow-red-200">
                  <AlertTriangle className="h-4 w-4 fill-white text-red-500" />
                  <span className="text-sm font-medium">ความชื้น 0% ตรวจไม่พบวัตถุดิบ</span>
                </div>
              </div>
            )}
            <MoistureDeviceDetail
              reading={latestReading || null}
              settings={moistureSettings || null}
              isLoading={isLoadingMoisture}
              isLoadingSummary={isLoadingHistory}
              moistureSummary={moistureSummary}
              onViewHistory={handleScrollToChart}
            />
            <div ref={chartRef}>
              <MoistureTrendChart
                data={moistureHistory || []}
                isLoading={isLoadingHistory}
              />
            </div>
            <MoistureSnapshotBarChart
              readings={moistureHistory || []}
              moistureSummary={moistureSummary}
              isLoading={isLoadingHistory}
            />
            {/* Moisture Device History Table */}
            <div className="bg-white/70 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
              <MoistureDeviceHistoryTable deviceCode={deviceCode} />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <MeasurementTabs
                deviceCode={deviceCode}
                searchTerm={searchTerm}
                wholeGrainData={wholeGrainData}
                ingredientsData={ingredientsData}
                impuritiesData={impuritiesData}
                allData={allData}
                notificationSettings={notificationSettings || []}
                isLoadingWholeGrain={isLoadingWholeGrain}
                isLoadingIngredients={isLoadingIngredients}
                isLoadingImpurities={isLoadingImpurities}
                isLoadingAllData={isLoadingAllData}
                onMeasurementClick={onMeasurementClick}
              />
            </div>

            {/* Add Calculation Summary Box */}
            {deviceCode && deviceCode !== 'default' && (
              <div className="px-0">
                <DeviceCalculationSummary
                  allData={allData}
                  isLoading={isLoadingAllData}
                />
              </div>
            )}
          </>
        )}

        {/* Add Device History Table at the bottom - Only for rice quality meters, not moisture meters */}
        {deviceCode && deviceCode !== 'default' && !isMoistureMeter && (
          <div className="px-0">
            <div className="mt-8 bg-white/70 dark:bg-gray-800/40 p-5 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
              <Suspense fallback={
                <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                  <h3 className="text-lg font-semibold mb-4">{t('dataCategories', 'historyTitle')}</h3>
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                </div>
              }>
                <DeviceHistoryTable deviceIds={[deviceCode]} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
