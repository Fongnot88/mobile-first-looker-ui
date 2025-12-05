# Table Column Mapping Documentation

เอกสารนี้แสดงการ mapping ระหว่างชื่อหัวตาราง (Thai/English/Chinese) กับ Column ใน Database

## Rice Quality Analysis Table (`rice_quality_analysis`)

| Database Column | Thai (ไทย) | English | Chinese (中文) |
|----------------|------------|---------|----------------|
| `created_at` | วันที่บันทึก | Date Recorded | 记录日期 |
| `device_code` | รหัสเครื่อง | Device Code | 设备代码 |
| `device_display_name` | ชื่ออุปกรณ์ | Device Name | 设备名称 |
| `machine_unix_time` | Timestamp เครื่องวัด | Machine Timestamp | 机器时间戳 |
| `surveyor` | ผู้ตรวจ | Surveyor | 检查员 |
| `sample_source` | จาก | From | 来自 |
| `cur_material` | วัตถุดิบและชนิดข้าว | Rice Type | 大米种类 |
| `cur_variety` | มาตรฐาน | Standard | 标准 |
| `output` | จำนวนเมล็ด | Kernel Count | 颗粒数 |

### ข้อมูลคุณภาพข้าว (Rice Quality Metrics)

| Database Column | Thai (ไทย) | English | Chinese (中文) |
|----------------|------------|---------|----------------|
| `class1` | ชั้น 1 (>7.0mm) | Class 1 (>7.0mm) | 一级 (>7.0mm) |
| `class2` | ชั้น 2 (>6.6-7.0mm) | Class 2 (>6.6-7.0mm) | 二级 (>6.6-7.0mm) |
| `class3` | ชั้น 3 (>6.2-6.6mm) | Class 3 (>6.2-6.6mm) | 三级 (>6.2-6.6mm) |
| `short_grain` | เมล็ดสั้น | Short Grain | 短粒率 |
| `slender_kernel` | ข้าวลีบ | Slender Kernel | 瘦长粒率 |
| `whole_kernels` | เต็มเมล็ด | Whole Kernels | 整粒率 |
| `head_rice` | ต้นข้าว | Head Rice | 头米率 |
| `total_brokens` | ข้าวหักรวม | Total Broken | 总碎米率 |
| `small_brokens` | ปลายข้าว | Small Broken | 小碎米率 |
| `small_brokens_c1` | ปลายข้าวC1 | Small Broken C1 | 小碎米C1率 |

### ข้อมูลสี/ลักษณะเมล็ด (Color/Kernel Characteristics)

| Database Column | Thai (ไทย) | English | Chinese (中文) |
|----------------|------------|---------|----------------|
| `red_line_rate` | สีต่ำกว่ามาตรฐาน | Below Standard Color | 红线率 |
| `parboiled_red_line` | เมล็ดแดง | Red Kernels | 红线米率 |
| `parboiled_white_rice` | ข้าวดิบ | Raw Rice | 蒸谷白米率 |
| `honey_rice` | เมล็ดม่วง | Purple Kernels | 紫米粒 |
| `light_honey_rice` | ข้าวม่วงอ่อน | Light Honey Rice | 浅色蜜糖米 |
| `yellow_rice_rate` | เมล็ดเหลือง | Yellow Kernels | 黄粒率 |
| `black_kernel` | เมล็ดดำ | Black Kernels | 黑粒率 |
| `partly_black_peck` | ดำบางส่วน & จุดดำ | Partly Black & Black Spots | 黑斑及黑点率 |
| `partly_black` | ดำบางส่วน | Partly Black | 黑斑率 |
| `heavy_chalkiness_rate` | ท้องไข่ | Chalkiness Rate | 重度垩白率 |

### ข้อมูลคุณภาพอื่นๆ (Other Quality Metrics)

| Database Column | Thai (ไทย) | English | Chinese (中文) |
|----------------|------------|---------|----------------|
| `imperfection_rate` | เมล็ดเสีย | Damaged Kernels | 不完善粒率 |
| `sticky_rice_rate` | ข้าวเหนียว | Sticky Rice | 糯米率 |
| `impurity_num` | เมล็ดอื่นๆ | Other Kernels | 杂质 |
| `paddy_rate` | ข้าวเปลือก(เมล็ด/กก.) | Paddy (kernels/kg) | 稻谷 (粒/公斤) |
| `whiteness` | ความขาว | Whiteness | 白度 |
| `process_precision` | ระดับขัดสี | Milling Level | 碾磨等级 |

### ข้อมูลอัตราส่วน (Rate/Index Metrics)

| Database Column | Thai (ไทย) | English | Chinese (中文) |
|----------------|------------|---------|----------------|
| `mix_rate` | อัตราส่วนผสม | Mix Rate | 混合率 |
| `sprout_rate` | อัตราการงอก | Sprout Rate | 发芽率 |
| `unripe_rate` | อัตราการไม่สุก | Unripe Rate | 未熟率 |
| `brown_rice_rate` | อัตราข้าวกล้อง | Brown Rice Rate | 糙米率 |
| `main_rate` | อัตราหลัก | Main Rate | 主要率 |
| `mix_index` | ดัชนีผสม | Mix Index | 混合指数 |
| `main_index` | ดัชนีหลัก | Main Index | 主要指数 |
| `topline_rate` | เส้นบน | Top Line Rate | 顶线率 |
| `other_backline` | เส้นหลังอื่นๆ | Other Backline | 其他背线 |

### ข้อมูลระบบ (System Columns)

| Database Column | Thai (ไทย) | English | Chinese (中文) |
|----------------|------------|---------|----------------|
| `simple_index` | พอร์ตอุปกรณ์ | Device Port | 设备端口 |
| `msg_id` | เวลา_msg | Message Time | 消息时间 |

---

## Moisture Meter Readings Table (`moisture_meter_readings`)

| Database Column | Thai (ไทย) | English | Description |
|----------------|------------|---------|-------------|
| `id` | รหัส | ID | Primary key (UUID) |
| `event` | เหตุการณ์ | Event | Type of reading (e.g., "automatic_read") |
| `moisture_machine` | ความชื้นเครื่องวัด | Machine Moisture | Moisture reading from machine |
| `moisture_model` | ความชื้นโมเดล | Model Moisture | Predicted moisture from model |
| `reading_time` | เวลาอ่าน | Reading Time | Timestamp of the reading |

---

## Device Settings Table (`device_settings`)

| Database Column | Thai (ไทย) | English | Description |
|----------------|------------|---------|-------------|
| `device_code` | รหัสเครื่อง | Device Code | Unique device identifier |
| `display_name` | ชื่ออุปกรณ์ | Display Name | Human-readable device name |
| `location` | ที่ตั้ง | Location | Physical location of device |
| `graph_color` | สีกราฟ | Graph Color | Color for charts/graphs |
| `is_active` | สถานะใช้งาน | Is Active | Whether device is active |
| `report_enabled` | เปิดใช้รายงาน | Report Enabled | Whether reporting is enabled |

---

## Notes

1. **device_display_name** - ใช้แสดงในตารางแทน device_code เพื่อความอ่านง่าย
2. **machine_unix_time** - แสดงเป็น "Timestamp เครื่องวัด" ในตาราง History
3. **output** - แสดงเป็น "จำนวนเมล็ด" / "Kernel Count" ในตาราง
4. **cur_material** - แปลค่าจาก code เป็นชื่อวัตถุดิบตาม `material-variety-translations.json`

---

*Last updated: 2025-12-05*
