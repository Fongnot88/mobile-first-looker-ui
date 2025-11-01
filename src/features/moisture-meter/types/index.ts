export interface MoistureDevice {
  id: string;
  deviceCode: string;
  displayName: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  currentMoisture: number;
  realtimeMoisture?: number;
  temperature?: number;
  lastUpdated: string;
  hasAlert: boolean;
}

export interface MoistureThreshold {
  min: number;
  max: number;
  warning: number;
  critical: number;
}

export interface MoistureOverview {
  average: number;
  highest: MoistureDevice;
  lowest: MoistureDevice;
  alertCount: number;
  totalDevices: number;
}
