import React, { useState } from 'react';
import { Bell, BellOff, Droplets, Thermometer, Settings2, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useMoistureNotificationSettings, MoistureNotificationSettingsState } from '../hooks/useMoistureNotificationSettings';
import { useAuth } from '@/components/AuthProvider';

interface MoistureNotificationCardProps {
  deviceCode: string | undefined;
}

export const MoistureNotificationCard: React.FC<MoistureNotificationCardProps> = ({
  deviceCode,
}) => {
  const { user } = useAuth();
  const { loading, saving, settings, setSettings, saveSettings, hasSettings } = useMoistureNotificationSettings(deviceCode);
  const [isExpanded, setIsExpanded] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleTestNotification = async () => {
    if (!deviceCode) return;
    
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('check_moisture_notifications', {
        body: { deviceCode }
      });
      
      if (error) throw error;
      
      if (data?.notificationsCreated > 0) {
        toast.success(`พบ ${data.notificationsCreated} การแจ้งเตือนใหม่`);
      } else {
        toast.info('ไม่พบค่าที่เกินเกณฑ์');
      }
    } catch (error: any) {
      console.error('Test notification error:', error);
      toast.error('เกิดข้อผิดพลาดในการทดสอบ');
    } finally {
      setTesting(false);
    }
  };

  const updateSetting = <K extends keyof MoistureNotificationSettingsState>(
    key: K,
    value: MoistureNotificationSettingsState[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Guest users can't configure notifications
  if (!user) {
    return (
      <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-100 dark:border-gray-800/40">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <BellOff size={18} />
          <span className="text-sm">เข้าสู่ระบบเพื่อตั้งค่าการแจ้งเตือน</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-100 dark:border-gray-800/40 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3"></div>
        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-100 dark:border-gray-800/40">
      {/* Header with main toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {settings.enabled ? (
            <Bell className="text-amber-600 dark:text-amber-400" size={18} />
          ) : (
            <BellOff className="text-gray-400" size={18} />
          )}
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            การแจ้งเตือน
          </h4>
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={(checked) => updateSetting('enabled', checked)}
        />
      </div>

      {/* Summary when collapsed */}
      {settings.enabled && !isExpanded && (
        <div className="flex flex-wrap gap-2 mb-3">
          {settings.moistureEnabled && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-xs">
              <Droplets size={12} />
              {settings.moistureMinThreshold}-{settings.moistureMaxThreshold}%
            </span>
          )}
          {settings.temperatureEnabled && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">
              <Thermometer size={12} />
              {settings.temperatureMinThreshold}-{settings.temperatureMaxThreshold}°C
            </span>
          )}
        </div>
      )}

      {/* Expandable settings */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={!settings.enabled}
          >
            <span className="flex items-center gap-2">
              <Settings2 size={14} />
              ตั้งค่าเกณฑ์แจ้งเตือน
            </span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3 space-y-4">
          {/* Moisture Settings */}
          <div className="p-3 bg-cyan-50/50 dark:bg-cyan-900/10 rounded-lg border border-cyan-200/50 dark:border-cyan-800/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Droplets className="text-cyan-600 dark:text-cyan-400" size={16} />
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  ความชื้น
                </Label>
              </div>
              <Switch
                checked={settings.moistureEnabled}
                onCheckedChange={(checked) => updateSetting('moistureEnabled', checked)}
              />
            </div>

            {settings.moistureEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs text-gray-500">ต่ำสุด (%)</Label>
                    <Switch
                      checked={settings.moistureMinEnabled}
                      onCheckedChange={(checked) => updateSetting('moistureMinEnabled', checked)}
                      className="scale-75"
                    />
                  </div>
                  <Input
                    type="number"
                    value={settings.moistureMinThreshold}
                    onChange={(e) => updateSetting('moistureMinThreshold', e.target.value)}
                    disabled={!settings.moistureMinEnabled}
                    className="h-9 text-sm"
                    placeholder="10"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs text-gray-500">สูงสุด (%)</Label>
                    <Switch
                      checked={settings.moistureMaxEnabled}
                      onCheckedChange={(checked) => updateSetting('moistureMaxEnabled', checked)}
                      className="scale-75"
                    />
                  </div>
                  <Input
                    type="number"
                    value={settings.moistureMaxThreshold}
                    onChange={(e) => updateSetting('moistureMaxThreshold', e.target.value)}
                    disabled={!settings.moistureMaxEnabled}
                    className="h-9 text-sm"
                    placeholder="20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Temperature Settings */}
          <div className="p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-200/50 dark:border-orange-800/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Thermometer className="text-orange-600 dark:text-orange-400" size={16} />
                <Label className="text-sm font-medium text-gray-900 dark:text-white">
                  อุณหภูมิ
                </Label>
              </div>
              <Switch
                checked={settings.temperatureEnabled}
                onCheckedChange={(checked) => updateSetting('temperatureEnabled', checked)}
              />
            </div>

            {settings.temperatureEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs text-gray-500">ต่ำสุด (°C)</Label>
                    <Switch
                      checked={settings.temperatureMinEnabled}
                      onCheckedChange={(checked) => updateSetting('temperatureMinEnabled', checked)}
                      className="scale-75"
                    />
                  </div>
                  <Input
                    type="number"
                    value={settings.temperatureMinThreshold}
                    onChange={(e) => updateSetting('temperatureMinThreshold', e.target.value)}
                    disabled={!settings.temperatureMinEnabled}
                    className="h-9 text-sm"
                    placeholder="20"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs text-gray-500">สูงสุด (°C)</Label>
                    <Switch
                      checked={settings.temperatureMaxEnabled}
                      onCheckedChange={(checked) => updateSetting('temperatureMaxEnabled', checked)}
                      className="scale-75"
                    />
                  </div>
                  <Input
                    type="number"
                    value={settings.temperatureMaxThreshold}
                    onChange={(e) => updateSetting('temperatureMaxThreshold', e.target.value)}
                    disabled={!settings.temperatureMaxEnabled}
                    className="h-9 text-sm"
                    placeholder="40"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </Button>
            <Button
              onClick={handleTestNotification}
              disabled={testing || !hasSettings}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PlayCircle size={16} />
              {testing ? 'กำลังทดสอบ...' : 'ทดสอบ'}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
