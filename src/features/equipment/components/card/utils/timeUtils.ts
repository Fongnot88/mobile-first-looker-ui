
import { format } from "date-fns";
import { th } from "date-fns/locale";

export const formatEquipmentTime = (lastUpdated: string | null) => {
  if (!lastUpdated || lastUpdated === "-") return "ไม่มีข้อมูล";
  
  const date = new Date(lastUpdated);
  // เพิ่มเวลาอีก 7 ชั่วโมง
  date.setHours(date.getHours() + 7);
  return format(date, "dd MMM yy HH:mm น.", { locale: th });
};

export const isRecentUpdate = (lastUpdated: string | null, deviceData?: any): boolean => {
  console.log("🔍 isRecentUpdate called with:", { lastUpdated, deviceData });
  
  // ตรวจสอบ lastUpdated ก่อน
  if (!lastUpdated || lastUpdated === "-") {
    console.log("❌ No lastUpdated or lastUpdated is '-', returning false");
    return false;
  }
  
  // ตรวจสอบข้อมูลอุปกรณ์ (ต้องมีและต้องไม่มีค่า "-" ในฟิลด์สำคัญ)
  if (deviceData) {
    console.log("🔍 Checking deviceData for '-' values:", deviceData);
    
    // คอลัมน์ที่สำคัญในการวิเคราะห์คุณภาพข้าว
    const importantFields = [
      'class1', 'class2', 'class3', 'whole_kernels', 'head_rice', 
      'total_brokens', 'small_brokens', 'whiteness', 'process_precision'
    ];
    
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
    const adjustedLastUpdateDate = new Date(lastUpdated);
    adjustedLastUpdateDate.setHours(adjustedLastUpdateDate.getHours() + 7);
    
    if (isNaN(adjustedLastUpdateDate.getTime())) {
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
