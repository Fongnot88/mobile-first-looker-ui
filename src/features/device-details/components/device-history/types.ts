
export interface RiceQualityData {
  id: number;
  device_code: string;
  device_display_name?: string; // Added for device display name
  created_at: string;
  thai_datetime: string;
  class1: number | null;
  class2: number | null;
  class3: number | null;
  short_grain: number | null;
  slender_kernel: number | null;
  whole_kernels: number | null;
  head_rice: number | null;
  total_brokens: number | null;
  small_brokens: number | null;
  small_brokens_c1: number | null;
  red_line_rate: number | null;
  parboiled_red_line: number | null;
  parboiled_white_rice: number | null;
  honey_rice: number | null;
  yellow_rice_rate: number | null;
  black_kernel: number | null;
  partly_black_peck: number | null;
  partly_black: number | null;
  imperfection_rate: number | null;
  sticky_rice_rate: number | null;
  impurity_num: number | null;
  paddy_rate: number | null;
  whiteness: number | null;
  process_precision: number | null;
  // NEW COLUMNS
  mix_rate: number | null;
  sprout_rate: number | null;
  unripe_rate: number | null;
  brown_rice_rate: number | null;
  main_rate: number | null;
  mix_index: number | null;
  main_index: number | null;
  // New fields
  cur_material: string | null;
  cur_variety: number | null; // Updated to match database schema
  sample_index: number | null;
  msg_id: string | null;
  surveyor: string | null;
  sample_source: string | null;
  [key: string]: any;
}

export interface DeviceHistoryTableProps {
  deviceIds?: string[];
}

export interface DataCategory {
  title: string;
  icon: string;
  color: string;
  fields: string[];
}
