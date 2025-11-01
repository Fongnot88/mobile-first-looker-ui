import { MoistureDevice, MoistureOverview, MoistureThreshold } from '../types';

/**
 * Calculate overview statistics from multiple moisture devices
 */
export const calculateMoistureOverview = (devices: MoistureDevice[]): MoistureOverview | null => {
  if (devices.length === 0) return null;

  const moistureValues = devices.map(d => d.currentMoisture);
  const average = moistureValues.reduce((sum, val) => sum + val, 0) / moistureValues.length;

  const highest = devices.reduce((max, device) => 
    device.currentMoisture > max.currentMoisture ? device : max
  );

  const lowest = devices.reduce((min, device) => 
    device.currentMoisture < min.currentMoisture ? device : min
  );

  const alertCount = devices.filter(d => d.hasAlert).length;

  return {
    average,
    highest,
    lowest,
    alertCount,
    totalDevices: devices.length,
  };
};

/**
 * Check if moisture value exceeds threshold
 */
export const checkMoistureAlert = (moisture: number, threshold: MoistureThreshold): boolean => {
  return moisture >= threshold.critical;
};

/**
 * Get status based on moisture value and threshold
 */
export const getMoistureStatus = (
  moisture: number, 
  threshold: MoistureThreshold
): 'normal' | 'warning' | 'critical' => {
  if (moisture >= threshold.critical) return 'critical';
  if (moisture >= threshold.warning) return 'warning';
  return 'normal';
};

/**
 * Default threshold values for rice moisture
 */
export const DEFAULT_MOISTURE_THRESHOLD: MoistureThreshold = {
  min: 10,
  max: 30,
  warning: 18,
  critical: 20,
};

/**
 * Generate mock moisture devices for demo/testing
 */
export const generateMockMoistureDevices = (count: number = 5): MoistureDevice[] => {
  return Array.from({ length: count }, (_, index) => {
    const deviceNum = index + 1;
    const currentMoisture = 10 + Math.random() * 20; // 10-30%
    const realtimeMoisture = currentMoisture + (Math.random() - 0.5) * 4; // ±2%
    
    return {
      id: `device-${deviceNum}`,
      deviceCode: `MM00${deviceNum}`,
      displayName: `เครื่องวัดความชื้น MM-00${deviceNum}`,
      location: `โกดัง ${String.fromCharCode(64 + deviceNum)}`,
      status: currentMoisture >= 20 ? 'warning' : 'online',
      currentMoisture,
      realtimeMoisture,
      temperature: 20 + Math.random() * 10, // 20-30°C
      lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      hasAlert: currentMoisture >= DEFAULT_MOISTURE_THRESHOLD.critical,
    };
  });
};
