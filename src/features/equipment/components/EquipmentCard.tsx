
import { EquipmentCardContainer } from "./card/EquipmentCardContainer";

interface EquipmentCardProps {
  deviceCode: string;
  lastUpdated: string | null;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  displayName?: string;
  onDeviceUpdated?: () => void;
  deviceData?: any; // เพิ่ม prop สำหรับข้อมูลอุปกรณ์
  isMoistureMeter?: boolean; // เพิ่ม prop สำหรับเครื่องวัดความชื้น
}

export function EquipmentCard(props: EquipmentCardProps) {
  return <EquipmentCardContainer {...props} />;
}
