import { useTranslation } from "@/hooks/useTranslation";

export const getColumnTranslatedName = (columnName: string, language: 'th' | 'en' | 'zh' = 'th'): string => {
  let translations;
  switch (language) {
    case 'en': translations = columnTranslationsEn; break;
    case 'zh': translations = columnTranslationsZh; break;
    default: translations = columnTranslations; break;
  }
  return translations[columnName] || columnName;
};

// Keep for backward compatibility
export const getColumnThaiName = (columnName: string): string => {
  return columnTranslations[columnName] || columnName;
};

export const getMeasurementThaiName = (measurementName: string): string => {
  return measurementTranslations[measurementName] || measurementName;
};

export const getAllColumnTranslations = (): Record<string, string> => {
  return columnTranslations;
};

export const hasTranslation = (columnName: string): boolean => {
  return !!columnTranslations[columnName];
};

export const measurementTranslations: Record<string, string> = {
  class1: 'ชั้น 1 (>7.0mm)',
  class2: 'ชั้น 2 (>6.6-7.0mm)',
  class3: 'ชั้น 3 (>6.2-6.6mm)',
  short_grain: 'เมล็ดสั้น',
  slender_kernel: 'ข้าวลีบ',
  whole_kernels: 'เต็มเมล็ด',
  head_rice: 'ต้นข้าว',
  total_brokens: 'ข้าวหักรวม',
  small_brokens: 'ปลายข้าว',
  small_brokens_c1: 'ปลายข้าวC1',
  red_line_rate: 'สีต่ำกว่ามาตรฐาน',
  parboiled_red_line: 'เมล็ดแดง',
  parboiled_white_rice: 'ข้าวดิบ',
  honey_rice: 'เมล็ดม่วง',
  yellow_rice_rate: 'เมล็ดเหลือง',
  black_kernel: 'เมล็ดดำ',
  partly_black_peck: 'ดำบางส่วน & จุดดำ',
  partly_black: 'ดำบางส่วน',
  imperfection_rate: 'เมล็ดเสีย',
  sticky_rice_rate: 'ข้าวเหนียว',
  impurity_num: 'เมล็ดอื่นๆ',
  paddy_rate: 'ข้าวเปลือก(เมล็ด/กก.)',
  whiteness: 'ความขาว',
  process_precision: 'ระดับขัดสี',
  mix_rate: 'อัตราส่วนผสม',
  sprout_rate: 'อัตราการงอก',
  unripe_rate: 'อัตราการไม่สุก',
  brown_rice_rate: 'อัตราข้าวกล้อง',
  main_rate: 'อัตราหลัก',
  mix_index: 'ดัชนีผสม',
  main_index: 'ดัชนีหลัก',
  heavy_chalkiness_rate: 'ท้องไข่',
  light_honey_rice: 'ข้าวม่วงอ่อน',
  topline_rate: 'เส้นบน',
  other_backline: 'เส้นหลังอื่นๆ',
};

export const columnTranslations: Record<string, string> = {
  created_at: 'วันที่บันทึก',
  device_code: 'รหัสเครื่อง',
  class1: 'ชั้น 1 (>7.0mm)',
  class2: 'ชั้น 2 (>6.6-7.0mm)',
  class3: 'ชั้น 3 (>6.2-6.6mm)',
  short_grain: 'เมล็ดสั้น',
  slender_kernel: 'ข้าวลีบ',
  whole_kernels: 'เต็มเมล็ด',
  head_rice: 'ต้นข้าว',
  total_brokens: 'ข้าวหักรวม',
  small_brokens: 'ปลายข้าว',
  small_brokens_c1: 'ปลายข้าวC1',
  red_line_rate: 'สีต่ำกว่ามาตรฐาน',
  parboiled_red_line: 'เมล็ดแดง',
  parboiled_white_rice: 'ข้าวดิบ',
  honey_rice: 'เมล็ดม่วง',
  yellow_rice_rate: 'เมล็ดเหลือง',
  black_kernel: 'เมล็ดดำ',
  partly_black_peck: 'ดำบางส่วน & จุดดำ',
  partly_black: 'ดำบางส่วน',
  imperfection_rate: 'เมล็ดเสีย',
  sticky_rice_rate: 'ข้าวเหนียว',
  impurity_num: 'เมล็ดอื่นๆ',
  paddy_rate: 'ข้าวเปลือก(เมล็ด/กก.)',
  whiteness: 'ความขาว',
  process_precision: 'ระดับขัดสี',
  
  // New columns - using column names as display names for now
  mix_rate: 'อัตราส่วนผสม',
  sprout_rate: 'อัตราการงอก', 
  unripe_rate: 'อัตราการไม่สุก',
  brown_rice_rate: 'อัตราข้าวกล้อง',
  main_rate: 'อัตราหลัก',
  mix_index: 'ดัชนีผสม',
  main_index: 'ดัชนีหลัก',
  // New analysis fields
  heavy_chalkiness_rate: 'ท้องไข่',
  light_honey_rice: 'ข้าวม่วงอ่อน',
  topline_rate: 'เส้นบน',
  other_backline: 'เส้นหลังอื่นๆ',
  // New columns
  cur_material: 'วัตถุดิบและชนิดข้าว',
  cur_variety: 'มาตรฐาน',
  simple_index: 'พอร์ตอุปกรณ์',
  msg_id: 'เวลา_msg',
  surveyor: 'ผู้ตรวจ',
  sample_source: 'จาก',
  machine_unix_time_minus_1h: 'เวลาเครื่อง',
};

export const columnTranslationsEn: Record<string, string> = {
  created_at: 'Date Recorded',
  device_code: 'Device Code',
  class1: 'Class 1 (>7.0mm)',
  class2: 'Class 2 (>6.6-7.0mm)',
  class3: 'Class 3 (>6.2-6.6mm)',
  short_grain: 'Short Grain',
  slender_kernel: 'Slender Kernel',
  whole_kernels: 'Whole Kernels',
  head_rice: 'Head Rice',
  total_brokens: 'Total Broken',
  small_brokens: 'Small Broken',
  small_brokens_c1: 'Small Broken C1',
  red_line_rate: 'Below Standard Color',
  parboiled_red_line: 'Red Kernels',
  parboiled_white_rice: 'Raw Rice',
  honey_rice: 'Purple Kernels',
  yellow_rice_rate: 'Yellow Kernels',
  black_kernel: 'Black Kernels',
  partly_black_peck: 'Partly Black & Black Spots',
  partly_black: 'Partly Black',
  imperfection_rate: 'Damaged Kernels',
  sticky_rice_rate: 'Sticky Rice',
  impurity_num: 'Other Kernels',
  paddy_rate: 'Paddy (kernels/kg)',
  whiteness: 'Whiteness',
  process_precision: 'Milling Level',
  mix_rate: 'Mix Rate',
  sprout_rate: 'Sprout Rate',
  unripe_rate: 'Unripe Rate',
  brown_rice_rate: 'Brown Rice Rate',
  main_rate: 'Main Rate',
  mix_index: 'Mix Index',
  main_index: 'Main Index',
  // New analysis fields
  heavy_chalkiness_rate: 'Chalkiness rate',
  light_honey_rice: 'Light Honey Rice',
  topline_rate: 'Top Line Rate',
  other_backline: 'Other Backline',
  // New columns
  cur_material: 'Rice Type',
  cur_variety: 'Standard',
  simple_index: 'Device Port',
  msg_id: 'Message Time',
  surveyor: 'Surveyor',
  sample_source: 'From',
  machine_unix_time_minus_1h: 'Machine Time',
};

export const columnTranslationsZh: Record<string, string> = {
  created_at: '记录日期',
  device_code: '设备代码',
  class1: '一级 (>7.0mm)',
  class2: '二级 (>6.6-7.0mm)',
  class3: '三级 (>6.2-6.6mm)',
  short_grain: '短粒率',
  slender_kernel: '瘦长粒率',
  whole_kernels: '整粒率',
  head_rice: '头米率',
  total_brokens: '总碎米率',
  small_brokens: '小碎米率',
  small_brokens_c1: '小碎米C1率',
  red_line_rate: '红线率',
  parboiled_red_line: '红线米率',
  parboiled_white_rice: '蒸谷白米率',
  honey_rice: '紫米粒',
  yellow_rice_rate: '黄粒率',
  black_kernel: '黑粒率',
  partly_black_peck: '黑斑及黑点率',
  partly_black: '黑斑率',
  imperfection_rate: '不完善粒率',
  sticky_rice_rate: '糯米率',
  impurity_num: '杂质',
  paddy_rate: '稻谷 (粒/公斤)',
  whiteness: '白度',
  process_precision: '碾磨等级',
  mix_rate: '混合率',
  sprout_rate: '发芽率',
  unripe_rate: '未熟率',
  brown_rice_rate: '糙米率',
  main_rate: '主要率',
  mix_index: '混合指数',
  main_index: '主要指数',
  // New analysis fields
  heavy_chalkiness_rate: '重度垩白率',
  light_honey_rice: '浅色蜜糖米',
  topline_rate: '顶线率',
  other_backline: '其他背线',
  // New columns
  cur_material: '大米种类',
  cur_variety: '标准',
  simple_index: '设备端口',
  msg_id: '消息时间',
  surveyor: '检查员',
  sample_source: '来自',
  machine_unix_time_minus_1h: '机器时间',
};
