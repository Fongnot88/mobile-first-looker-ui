# Table Column Mapping - หน้าประวัติอุปกรณ์ (Device History)

เอกสารนี้แสดงการ mapping ระหว่างชื่อหัวตารางกับ Column ใน Database  
**เฉพาะคอลัมน์ที่แสดงในหน้าประวัติอุปกรณ์เท่านั้น** (เรียงตามลำดับการแสดงผล)

---

## ลำดับการแสดงคอลัมน์ในตาราง (40 คอลัมน์)

| # | Database Column | Table Name | Thai (ไทย) | English | Chinese (中文) |
|---|----------------|------------|------------|---------|----------------|
| 1 | `machine_unix_time` | rice_quality_analysis | Timestamp เครื่องวัด | Machine Timestamp | 机器时间戳 |
| 2 | `device_display_name` | device_settings (display_name) | ชื่ออุปกรณ์ | Device Name | 设备名称 |
| 3 | `surveyor` | rice_quality_analysis | ผู้ตรวจ | Surveyor | 检查员 |
| 4 | `cur_material` | rice_quality_analysis | วัตถุดิบและชนิดข้าว | Rice Type | 大米种类 |
| 5 | `output` | rice_quality_analysis | จำนวนเมล็ด | Kernel Count | 颗粒数 |
| 6 | `heavy_chalkiness_rate` | rice_quality_analysis | ท้องไข่ | Chalkiness Rate | 重度垩白率 |
| 7 | `class1` | rice_quality_analysis | ชั้น 1 (>7.0mm) | Class 1 (>7.0mm) | 一级 (>7.0mm) |
| 8 | `class2` | rice_quality_analysis | ชั้น 2 (>6.6-7.0mm) | Class 2 (>6.6-7.0mm) | 二级 (>6.6-7.0mm) |
| 9 | `class3` | rice_quality_analysis | ชั้น 3 (>6.2-6.6mm) | Class 3 (>6.2-6.6mm) | 三级 (>6.2-6.6mm) |
| 10 | `short_grain` | rice_quality_analysis | เมล็ดสั้น | Short Grain | 短粒率 |
| 11 | `slender_kernel` | rice_quality_analysis | ข้าวลีบ | Slender Kernel | 瘦长粒率 |
| 12 | `whole_kernels` | rice_quality_analysis | เต็มเมล็ด | Whole Kernels | 整粒率 |
| 13 | `head_rice` | rice_quality_analysis | ต้นข้าว | Head Rice | 头米率 |
| 14 | `total_brokens` | rice_quality_analysis | ข้าวหักรวม | Total Broken | 总碎米率 |
| 15 | `small_brokens` | rice_quality_analysis | ปลายข้าว | Small Broken | 小碎米率 |
| 16 | `small_brokens_c1` | rice_quality_analysis | ปลายข้าวC1 | Small Broken C1 | 小碎米C1率 |
| 17 | `red_line_rate` | rice_quality_analysis | สีต่ำกว่ามาตรฐาน | Below Standard Color | 红线率 |
| 18 | `parboiled_red_line` | rice_quality_analysis | เมล็ดแดง | Red Kernels | 红线米率 |
| 19 | `parboiled_white_rice` | rice_quality_analysis | ข้าวดิบ | Raw Rice | 蒸谷白米率 |
| 20 | `honey_rice` | rice_quality_analysis | เมล็ดม่วง | Purple Kernels | 紫米粒 |
| 21 | `yellow_rice_rate` | rice_quality_analysis | เมล็ดเหลือง | Yellow Kernels | 黄粒率 |
| 22 | `black_kernel` | rice_quality_analysis | เมล็ดดำ | Black Kernels | 黑粒率 |
| 23 | `partly_black_peck` | rice_quality_analysis | ดำบางส่วน & จุดดำ | Partly Black & Black Spots | 黑斑及黑点率 |
| 24 | `partly_black` | rice_quality_analysis | ดำบางส่วน | Partly Black | 黑斑率 |
| 25 | `imperfection_rate` | rice_quality_analysis | เมล็ดเสีย | Damaged Kernels | 不完善粒率 |
| 26 | `sticky_rice_rate` | rice_quality_analysis | ข้าวเหนียว | Sticky Rice | 糯米率 |
| 27 | `impurity_num` | rice_quality_analysis | เมล็ดอื่นๆ | Other Kernels | 杂质 |
| 28 | `paddy_rate` | rice_quality_analysis | ข้าวเปลือก(เมล็ด/กก.) | Paddy (kernels/kg) | 稻谷 (粒/公斤) |
| 29 | `whiteness` | rice_quality_analysis | ความขาว | Whiteness | 白度 |
| 30 | `process_precision` | rice_quality_analysis | ระดับขัดสี | Milling Level | 碾磨等级 |
| 31 | `mix_rate` | rice_quality_analysis | อัตราส่วนผสม | Mix Rate | 混合率 |
| 32 | `sprout_rate` | rice_quality_analysis | อัตราการงอก | Sprout Rate | 发芽率 |
| 33 | `unripe_rate` | rice_quality_analysis | อัตราการไม่สุก | Unripe Rate | 未熟率 |
| 34 | `brown_rice_rate` | rice_quality_analysis | อัตราข้าวกล้อง | Brown Rice Rate | 糙米率 |
| 35 | `main_rate` | rice_quality_analysis | อัตราหลัก | Main Rate | 主要率 |
| 36 | `mix_index` | rice_quality_analysis | ดัชนีผสม | Mix Index | 混合指数 |
| 37 | `main_index` | rice_quality_analysis | ดัชนีหลัก | Main Index | 主要指数 |
| 38 | `sample_index` | rice_quality_analysis | พอร์ตอุปกรณ์ | Device Port | 设备端口 |
| 39 | `sample_source` | rice_quality_analysis | จาก | From | 来自 |
| 40 | `created_at` | rice_quality_analysis | วันที่บันทึก | Date Recorded | 记录日期 |

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
