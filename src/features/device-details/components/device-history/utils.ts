
import { RiceQualityData } from './types';

// แก้ไข: เพิ่มการตรวจสอบประเภทข้อมูลก่อนเรียก toFixed และรองรับค่าที่เป็นสตริงที่สามารถแปลงเป็นตัวเลขได้
// Thai comment: แก้ไข: เพิ่มการตรวจสอบประเภทข้อมูลก่อนเรียก toFixed และรองรับค่าที่เป็นสตริงที่สามารถแปลงเป็นตัวเลขได้
export const formatValue = (value: any): string => {
  // ตรวจสอบค่า null หรือ undefined ก่อน
  // Thai comment: ตรวจสอบค่า null หรือ undefined ก่อน
  if (value === null || value === undefined) {
    return '-';
  }

  // ตรวจสอบว่า value เป็นตัวเลขหรือไม่
  // Thai comment: ตรวจสอบว่า value เป็นตัวเลขหรือไม่
  if (typeof value === 'number') {
    return value.toFixed(2);
  }

  // ถ้า value เป็นสตริง ให้ลองแปลงเป็นตัวเลข
  // กรณีนี้รองรับค่าตัวเลขที่อาจถูกส่งมาในรูปแบบสตริง
  // Thai comment: ถ้า value เป็นสตริง ให้ลองแปลงเป็นตัวเลข
  // Thai comment: กรณีนี้รองรับค่าตัวเลขที่อาจถูกส่งมาในรูปแบบสตริง
  if (typeof value === 'string') {
    const parsedNum = parseFloat(value);
    if (!isNaN(parsedNum)) {
      return parsedNum.toFixed(2);
    }
  }

  // ถ้า value ไม่ใช่ตัวเลข, ไม่ใช่ null/undefined, และไม่ใช่สตริงที่แปลงเป็นตัวเลขได้
  // ให้คืนค่าเป็นสตริงของ value นั้นๆ เพื่อให้มีบางอย่างแสดงผล
  // อาจพิจารณาคืนค่า '-' หากประเภทข้อมูลที่ไม่ใช่ตัวเลขเป็นสิ่งที่ไม่คาดคิด
  // Thai comment: ถ้า value ไม่ใช่ตัวเลข, ไม่ใช่ null/undefined, และไม่ใช่สตริงที่แปลงเป็นตัวเลขได้
  // Thai comment: ให้คืนค่าเป็นสตริงของ value นั้นๆ เพื่อให้มีบางอย่างแสดงผล
  // Thai comment: อาจพิจารณาคืนค่า '-' หากประเภทข้อมูลที่ไม่ใช่ตัวเลขเป็นสิ่งที่ไม่คาดคิด
  return String(value);
};

// ลำดับคอลัมน์ที่ต้องการแสดง
export const COLUMN_ORDER = [
  'created_at',
  'device_code',
  'class1',
  'class2',
  'class3',
  'short_grain',
  'slender_kernel',
  'whole_kernels',
  'head_rice',
  'total_brokens',
  'small_brokens',
  'small_brokens_c1',
  'red_line_rate',
  'parboiled_red_line',
  'parboiled_white_rice',
  'honey_rice',
  'yellow_rice_rate',
  'black_kernel',
  'partly_black_peck',
  'partly_black',
  'imperfection_rate',
  'sticky_rice_rate',
  'impurity_num',
  'paddy_rate',
  'whiteness',
  'process_precision',
  // NEW COLUMNS
  'mix_rate',
  'sprout_rate',
  'unripe_rate',
  'brown_rice_rate',
  'main_rate',
  'mix_index',
  'main_index'
];

export const getColumnKeys = (data: RiceQualityData[]): string[] => {
  if (!data || data.length === 0) return [];
  
  // ใช้ลำดับคอลัมน์ที่กำหนดไว้ล่วงหน้า และกรองคอลัมน์ที่ไม่มีข้อมูล
  return COLUMN_ORDER.filter(key => 
    data[0].hasOwnProperty(key) && 
    !['id', 'thai_datetime', 'sample_index', 'output'].includes(key) // กรอง thai_datetime ออก, ไม่กรอง created_at
  );
};

export const formatCellValue = (key: string, value: any): string => {
  if (key === 'created_at') {
    if (!value) return '-';
    // Assuming value is a UTC timestamp string from Supabase
    const dateObj = new Date(value);

    // เพิ่มเวลา 7 ชั่วโมงเหมือน TimeDisplay.tsx
    dateObj.setHours(dateObj.getHours() + 7);

    const formattedDate = dateObj.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedTime = dateObj.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // ใช้รูปแบบ 24 ชั่วโมง
    });
    return `${formattedDate} ${formattedTime}`;
  }
  
  if (key === 'device_code') {
    return value?.toString() || '-';
  }
  
  return formatValue(value);
};
