import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Share2, Calendar, Languages, Droplets, Thermometer } from "lucide-react";
import { format } from "date-fns";
import { th, enUS } from "date-fns/locale";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

const PublicMoistureView = () => {
  const { t, language } = useTranslation();
  const { toggleLanguage } = useLanguage();
  const { token } = useParams<{ token: string }>();

  const { data: sharedData, isLoading, error } = useQuery({
    queryKey: ['shared-moisture', token],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');

      // Get shared link info
      const { data: sharedLink, error: linkError } = await supabase
        .from('shared_moisture_links')
        .select('*')
        .eq('share_token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (linkError) throw linkError;
      if (!sharedLink) throw new Error('Shared link not found or inactive');

      // Check if expired
      if (sharedLink.expires_at && new Date(sharedLink.expires_at) < new Date()) {
        throw new Error('Shared link has expired');
      }

      // Get moisture reading data
      const { data: reading, error: readingError } = await supabase
        .from('moisture_meter_readings')
        .select('*')
        .eq('id', sharedLink.reading_id)
        .single();

      if (readingError) throw readingError;

      // Get device display name
      let deviceDisplayName = null;
      if (reading.device_code) {
        const { data: deviceSettings } = await supabase
          .from('moisture_meter_settings')
          .select('display_name')
          .eq('device_code', reading.device_code)
          .maybeSingle();
        deviceDisplayName = deviceSettings?.display_name || null;
      }

      return { sharedLink, reading, deviceDisplayName };
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.message?.includes('not found') || error?.message?.includes('expired')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy HH:mm น.", { locale: language === 'th' ? th : enUS });
    } catch {
      return dateString;
    }
  };

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !sharedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg mx-4">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">ลิงก์ไม่ถูกต้อง</h2>
            <p className="text-muted-foreground mb-6">
              {error?.message === 'Shared link not found or inactive' 
                ? 'ไม่พบลิงก์แชร์หรือลิงก์ถูกปิดใช้งานแล้ว'
                : error?.message === 'Shared link has expired'
                ? 'ลิงก์แชร์นี้หมดอายุแล้ว'
                : 'ไม่สามารถโหลดข้อมูลได้'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { sharedLink, reading, deviceDisplayName } = sharedData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg animate-scale-in shadow-lg">
        {/* Header */}
        <div className="pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {sharedLink.title}
            </h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleLanguage} 
                className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[32px] px-2" 
                title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
              >
                <Languages className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {language === 'th' ? 'TH' : 'EN'}
                </span>
              </Button>
              <Badge variant="secondary" className="gap-2">
                <Share2 className="w-4 h-4" />
                {language === 'th' ? 'แชร์สาธารณะ' : 'Public Share'}
              </Badge>
            </div>
          </div>
          <Separator className="bg-gray-200 dark:bg-gray-700 mt-4" />
        </div>

        {/* Device Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Droplets className="w-6 h-6 text-blue-600" />
            <div>
              {deviceDisplayName && (
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {deviceDisplayName}
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {reading.device_code}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatDateTime(reading.reading_time)}
          </div>
        </div>

        {/* Moisture Data */}
        <div className="space-y-4">
          {/* Moisture */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {language === 'th' ? 'ค่าความชื้น' : 'Moisture'}
                </span>
              </div>
              <div className="text-2xl font-bold">
                {formatNumber(reading.moisture_machine)}%
              </div>
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {language === 'th' ? 'อุณหภูมิ' : 'Temperature'}
                </span>
              </div>
              <div className="text-2xl font-bold">
                {formatNumber(reading.temperature)}°C
              </div>
            </div>
          </div>

          {/* Time */}
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {language === 'th' ? 'เวลา' : 'Time'}
                </span>
              </div>
              <div className="text-lg font-bold">
                {formatDateTime(reading.reading_time)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-right text-xs text-gray-500 dark:text-gray-400">
            <div>{language === 'th' ? 'แชร์โดย' : 'Shared by'}: RiceFlow</div>
            <div className="flex items-center justify-end gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {language === 'th' ? 'แชร์เมื่อ' : 'Shared on'}: {format(new Date(sharedLink.created_at), 'dd/MM/yyyy HH:mm', { locale: language === 'th' ? th : enUS })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMoistureView;
