import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Droplets } from 'lucide-react';
import { MoistureMeterDashboard } from '@/features/moisture-meter/components';
import { generateMockMoistureDevices } from '@/features/moisture-meter/utils/moistureCalculations';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';

export default function MoistureMeterDetails() {
  const { deviceCode } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { handleBack } = useNavigationHistory();
  
  // Generate mock devices for demo (in production, this would fetch from API)
  const [devices] = useState(() => generateMockMoistureDevices(5));

  const handleViewHistory = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      // Navigate to device history page
      navigate(`/device/${device.deviceCode}/moisture`);
    }
  };

  return (
    <AppLayout showFooterNav={true} contentPaddingBottom={isMobile ? 'pb-32' : 'pb-4'}>
      <div className="flex-1">
        {/* Header Section */}
        <div className="px-[5%] mb-4 md:px-0">
          <div className="flex flex-col gap-2">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors duration-150 w-fit"
            >
              <ArrowLeft size={16} />
              ย้อนกลับ
            </button>

            {/* Title with Icon */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Droplets className="text-cyan-500" size={28} />
                  เครื่องวัดความชื้นข้าว
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {deviceCode || 'ภาพรวมทั้งหมด'}
                </p>
              </div>
              
              {/* Decorative wheat icons */}
              <div className="flex items-center gap-1">
                <Droplets className="text-cyan-400" size={16} strokeWidth={2.5} />
                <Droplets className="text-cyan-500" size={20} strokeWidth={2.5} />
                <Droplets className="text-cyan-600" size={18} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="px-[5%] md:px-0">
          <MoistureMeterDashboard
            devices={devices}
            onViewHistory={handleViewHistory}
          />
        </div>

        {/* Info Card */}
        <div className="px-[5%] md:px-0 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <Droplets className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  💡 เกี่ยวกับความชื้นข้าว
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  ค่าความชื้นมาตรฐานสำหรับการเก็บรักษาข้าวควรอยู่ระหว่าง 12-14% 
                  หากเกิน 18% ควรเฝ้าระวัง และเกิน 20% ต้องตรวจสอบทันที เพื่อป้องกันการเสียหายของข้าว
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
