# Table Column Mapping - หน้าประวัติอุปกรณ์ (Device History)

เอกสารนี้แสดงการ mapping ระหว่างชื่อหัวตารางกับ Column ใน Database  
**เฉพาะคอลัมน์ที่แสดงในหน้าประวัติอุปกรณ์เท่านั้น** (เรียงตามลำดับการแสดงผล)

---

## ลำดับการแสดงคอลัมน์ในตาราง (40 คอลัมน์)

| # | Table Name | Database Column | Thai (ไทย) | English |
|---|------------|-----------------|------------|---------|
| 1 | rice_quality_analysis | `machine_unix_time` | Timestamp เครื่องวัด | Machine Timestamp |
| 2 | device_settings (display_name) | `device_display_name` | ชื่ออุปกรณ์ | Device Name |
| 3 | rice_quality_analysis | `surveyor` | ผู้ตรวจ | Surveyor |
| 4 | rice_quality_analysis | `cur_material` | วัตถุดิบและชนิดข้าว | Rice Type |
| 5 | rice_quality_analysis | `output` | จำนวนเมล็ด | Kernel Count |
| 6 | rice_quality_analysis | `heavy_chalkiness_rate` | ท้องไข่ | Chalkiness Rate |
| 7 | rice_quality_analysis | `class1` | ชั้น 1 (>7.0mm) | Class 1 (>7.0mm) |
| 8 | rice_quality_analysis | `class2` | ชั้น 2 (>6.6-7.0mm) | Class 2 (>6.6-7.0mm) |
| 9 | rice_quality_analysis | `class3` | ชั้น 3 (>6.2-6.6mm) | Class 3 (>6.2-6.6mm) |
| 10 | rice_quality_analysis | `short_grain` | เมล็ดสั้น | Short Grain |
| 11 | rice_quality_analysis | `slender_kernel` | ข้าวลีบ | Slender Kernel |
| 12 | rice_quality_analysis | `whole_kernels` | เต็มเมล็ด | Whole Kernels |
| 13 | rice_quality_analysis | `head_rice` | ต้นข้าว | Head Rice |
| 14 | rice_quality_analysis | `total_brokens` | ข้าวหักรวม | Total Broken |
| 15 | rice_quality_analysis | `small_brokens` | ปลายข้าว | Small Broken |
| 16 | rice_quality_analysis | `small_brokens_c1` | ปลายข้าวC1 | Small Broken C1 |
| 17 | rice_quality_analysis | `red_line_rate` | สีต่ำกว่ามาตรฐาน | Below Standard Color |
| 18 | rice_quality_analysis | `parboiled_red_line` | เมล็ดแดง | Red Kernels |
| 19 | rice_quality_analysis | `parboiled_white_rice` | ข้าวดิบ | Raw Rice |
| 20 | rice_quality_analysis | `honey_rice` | เมล็ดม่วง | Purple Kernels |
| 21 | rice_quality_analysis | `yellow_rice_rate` | เมล็ดเหลือง | Yellow Kernels |
| 22 | rice_quality_analysis | `black_kernel` | เมล็ดดำ | Black Kernels |
| 23 | rice_quality_analysis | `partly_black_peck` | ดำบางส่วน & จุดดำ | Partly Black & Black Spots |
| 24 | rice_quality_analysis | `partly_black` | ดำบางส่วน | Partly Black |
| 25 | rice_quality_analysis | `imperfection_rate` | เมล็ดเสีย | Damaged Kernels |
| 26 | rice_quality_analysis | `sticky_rice_rate` | ข้าวเหนียว | Sticky Rice |
| 27 | rice_quality_analysis | `impurity_num` | เมล็ดอื่นๆ | Other Kernels |
| 28 | rice_quality_analysis | `paddy_rate` | ข้าวเปลือก(เมล็ด/กก.) | Paddy (kernels/kg) |
| 29 | rice_quality_analysis | `whiteness` | ความขาว | Whiteness |
| 30 | rice_quality_analysis | `process_precision` | ระดับขัดสี | Milling Level |
| 31 | rice_quality_analysis | `mix_rate` | อัตราส่วนผสม | Mix Rate |
| 32 | rice_quality_analysis | `sprout_rate` | อัตราการงอก | Sprout Rate |
| 33 | rice_quality_analysis | `unripe_rate` | อัตราการไม่สุก | Unripe Rate |
| 34 | rice_quality_analysis | `brown_rice_rate` | อัตราข้าวกล้อง | Brown Rice Rate |
| 35 | rice_quality_analysis | `main_rate` | อัตราหลัก | Main Rate |
| 36 | rice_quality_analysis | `mix_index` | ดัชนีผสม | Mix Index |
| 37 | rice_quality_analysis | `main_index` | ดัชนีหลัก | Main Index |
| 38 | rice_quality_analysis | `sample_index` | พอร์ตอุปกรณ์ | Device Port |
| 39 | rice_quality_analysis | `sample_source` | จาก | From |
| 40 | rice_quality_analysis | `created_at` | วันที่บันทึก | Date Recorded |

---

## สรุป Table ที่ใช้

| Table Name | จำนวน Columns | รายละเอียด |
|------------|---------------|-------------|
| `rice_quality_analysis` | 39 | ข้อมูลการวิเคราะห์คุณภาพข้าวหลัก |
| `device_settings` | 1 | ชื่อแสดงอุปกรณ์ (display_name → device_display_name) |

---

## หมายเหตุ

- **Priority Columns (แสดงก่อน):** machine_unix_time, device_display_name, surveyor, cur_material, output, heavy_chalkiness_rate
- **Last Column:** created_at (วันที่บันทึก) แสดงท้ายสุดเสมอ
- **device_display_name:** JOIN จาก `device_settings.display_name` โดยใช้ `device_code` เป็น key, fallback เป็น `device_code` ถ้าไม่มีชื่อ
- **cur_material:** แปลค่าจาก code เป็นชื่อวัตถุดิบตาม `material-variety-translations.json`

---

*Source: `src/features/device-details/components/device-history/HistoryTable.tsx`*  
*Last updated: 2025-12-05*
