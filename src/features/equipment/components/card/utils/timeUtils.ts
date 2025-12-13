
import { format } from "date-fns";
import { th, enUS, zhCN } from "date-fns/locale";

const parseTimestamp = (value: string | null): Date | null => {
  if (!value || value === "-") return null;

  // พยายาม parse รูปแบบ "YYYY-MM-DD HH:mm:ss" (เช่นจาก moisture_meter_readings)
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    const [, year, month, day, hour, minute, second = "0"] = match;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

export const formatEquipmentTime = (lastUpdated: string | null, language: 'th' | 'en' | 'zh' = 'th') => {
  const date = parseTimestamp(lastUpdated);
  if (!date) {
    switch (language) {
      case 'en': return "No data";
      case 'zh': return "无数据";
      default: return "ไม่มีข้อมูล";
    }
  }

  switch (language) {
    case 'en':
      return format(date, "dd MMM yy HH:mm", { locale: enUS });
    case 'zh':
      return format(date, "dd MMM yy HH:mm", { locale: zhCN });
    default:
      return format(date, "dd MMM yy HH:mm น.", { locale: th });
  }
};

export const isRecentUpdate = (
  lastUpdated: string | null, 
  deviceData?: any,
  isMoistureMeter: boolean = false
): boolean => {
  console.log("🔍 isRecentUpdate called with:", { lastUpdated, deviceData, isMoistureMeter });
  
  // ตรวจสอบ lastUpdated ก่อน
  if (!lastUpdated || lastUpdated === "-") {
    console.log("❌ No lastUpdated or lastUpdated is '-', returning false");
    return false;
  }
  
  // ตรวจสอบข้อมูลอุปกรณ์ (ต้องมีและต้องไม่มีค่า "-" ในฟิลด์สำคัญ)
  if (deviceData) {
    console.log("🔍 Checking deviceData for invalid values:", deviceData);
    
    // เลือกฟิลด์ที่ต้องตรวจสอบตามประเภทอุปกรณ์
    const importantFields = isMoistureMeter
      ? ['moisture_machine', 'moisture_model', 'temperature'] // สำหรับเครื่องวัดความชื้น
      : ['class1', 'class2', 'class3', 'whole_kernels', 'head_rice', 
         'total_brokens', 'small_brokens', 'whiteness', 'process_precision']; // สำหรับเครื่องวัดคุณภาพข้าว
    
    // ตรวจสอบทุกฟิลด์สำคัญ
    for (const field of importantFields) {
      const fieldValue = deviceData[field];
      console.log(`🔍 Checking field ${field}:`, fieldValue);
      
      // ถ้าพบค่า "-", null, หรือ undefined ในฟิลด์ใดก็ตาม
      if (fieldValue === "-" || fieldValue === null || fieldValue === undefined || fieldValue === "") {
        console.log(`❌ Found invalid value in field ${field}: "${fieldValue}", returning false`);
        return false;
      }
    }
    
    console.log("✅ All important fields have valid values");
  } else {
    console.log("⚠️ No deviceData provided, treating as invalid update");
    return false; // ถ้าไม่มีข้อมูลอุปกรณ์ให้ถือว่าไม่ใช่การอัพเดทที่ถูกต้อง
  }
  
  // ตรวจสอบเวลา (ภายใน 30 นาที)
  try {
    const adjustedLastUpdateDate = parseTimestamp(lastUpdated);
    if (!adjustedLastUpdateDate) {
      console.warn("❌ Invalid date string:", lastUpdated);
      return false;
    }
    
    const now = new Date();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    const diffMs = now.getTime() - adjustedLastUpdateDate.getTime();
    const isWithin30Minutes = diffMs >= 0 && diffMs < thirtyMinutesInMs;
    
    console.log("⏰ Time check result:", { 
      now: now.toISOString(), 
      adjustedTime: adjustedLastUpdateDate.toISOString(), 
      diffMs, 
      thirtyMinutesInMs, 
      isWithin30Minutes 
    });
    
    const finalResult = isWithin30Minutes;
    console.log(`🎯 Final result for ${lastUpdated}:`, finalResult ? "🟢 GREEN" : "🔴 RED");
    
    return finalResult;
  } catch (error) {
    console.error("❌ Error processing date:", lastUpdated, error);
    return false;
  }
};

export const getTimeClasses = (isRecent: boolean): string => {
  const classes = isRecent
    ? "font-bold text-green-700 bg-yellow-200 dark:text-green-300 dark:bg-yellow-600/40 px-1.5 py-0.5 rounded-md"
    : "font-medium text-gray-800 dark:text-teal-200";
  
  console.log(`🎨 getTimeClasses returning:`, isRecent ? "GREEN classes" : "RED classes");
  return classes;
};
