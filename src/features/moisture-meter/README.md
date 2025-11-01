# Moisture Meter Feature

## 📋 Overview

ระบบแสดงผลข้อมูลเครื่องวัดความชื้นข้าวแบบ Multi-Device Comparison Dashboard ที่เน้นการเปรียบเทียบค่าความชื้นจากหลายเครื่องพร้อมกัน พร้อมระบบ Color Coding และการแจ้งเตือนอัตโนมัติ

## 🎨 Design Concept

### Key Features
1. **Multi-Device Comparison** - แสดงกราฟเปรียบเทียบความชื้นจาก 1-5 เครื่องพร้อมกัน
2. **Color Coding System** - ระบบสีแยกประเภทข้อมูล
   - 🔵 Cyan = ค่าจากอุปกรณ์
   - 🟣 Purple = Real-time
   - 🟡 Yellow = Warning (เฝ้าระวัง)
   - 🔴 Red = Critical (เตือน)
3. **Interactive Chart** - คลิกที่แท่งกราฟเพื่อดูรายละเอียด
4. **Overview Statistics** - สรุปค่าเฉลี่ย, สูงสุด, ต่ำสุด, และจำนวน Alert
5. **Device Details** - รายละเอียดเครื่องที่เลือก พร้อมปุ่มดูกราฟย้อนหลัง

## 📁 Structure

```
src/features/moisture-meter/
├── types/
│   └── index.ts              # TypeScript interfaces
├── components/
│   ├── MoistureMeterDashboard.tsx        # Main dashboard
│   ├── MoistureComparisonChart.tsx       # Bar chart
│   ├── MoistureOverviewCard.tsx          # Statistics card
│   ├── MoistureLegend.tsx                # Color legend
│   ├── MoistureDeviceDetailCard.tsx      # Device details
│   └── index.ts              # Exports
├── utils/
│   └── moistureCalculations.ts  # Utility functions
└── README.md
```

## 🔧 Components

### 1. MoistureMeterDashboard
Main component ที่รวมทุกอย่างเข้าด้วยกัน

```tsx
import { MoistureMeterDashboard } from '@/features/moisture-meter/components';

<MoistureMeterDashboard
  devices={devices}
  threshold={threshold}
  onViewHistory={(deviceId) => console.log(deviceId)}
/>
```

### 2. MoistureComparisonChart
กราฟแท่งเปรียบเทียบความชื้น

**Features:**
- แสดงแท่งคู่ (Device + Real-time)
- เส้น Threshold แบบ dashed
- Click เพื่อเลือกเครื่อง
- Icon Alert สำหรับเครื่องที่มีปัญหา

### 3. MoistureOverviewCard
การ์ดสรุปภาพรวม

**Displays:**
- ค่าเฉลี่ย (Average)
- สูงสุด (Highest)
- ต่ำสุด (Lowest)
- จำนวน Alert

### 4. MoistureLegend
คำอธิบายสีและสถานะ

### 5. MoistureDeviceDetailCard
รายละเอียดเครื่องที่เลือก

**Displays:**
- ความชื้นปัจจุบัน
- Real-time (ถ้ามี)
- อุณหภูมิ
- สถานที่
- เวลาอัพเดตล่าสุด

## 📊 Data Types

### MoistureDevice
```typescript
interface MoistureDevice {
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
```

### MoistureThreshold
```typescript
interface MoistureThreshold {
  min: number;        // 10
  max: number;        // 30
  warning: number;    // 18
  critical: number;   // 20
}
```

## 🛠️ Utility Functions

### calculateMoistureOverview
คำนวณค่าสถิติภาพรวม

```typescript
const overview = calculateMoistureOverview(devices);
```

### checkMoistureAlert
ตรวจสอบว่าค่าความชื้นเกินเกณฑ์หรือไม่

```typescript
const hasAlert = checkMoistureAlert(moisture, threshold);
```

### getMoistureStatus
ได้สถานะตามค่าความชื้น

```typescript
const status = getMoistureStatus(moisture, threshold);
// Returns: 'normal' | 'warning' | 'critical'
```

### generateMockMoistureDevices
สร้างข้อมูลตัวอย่างสำหรับทดสอบ

```typescript
const devices = generateMockMoistureDevices(5);
```

## 🎯 Routes

- `/moisture-meter` - Dashboard ภาพรวม
- `/moisture-meter/:deviceCode` - Dashboard เฉพาะเครื่อง

## 🎨 Color Scheme

| Color | Class | Usage |
|-------|-------|-------|
| Cyan | `bg-cyan-400` | ค่าจากอุปกรณ์ |
| Purple | `bg-purple-500` | Real-time |
| Yellow | `bg-yellow-400` | Warning (≥18%) |
| Red | `bg-red-500` | Critical (≥20%) |
| Green | `bg-green-500` | สถานะออนไลน์ |
| Orange | `bg-orange-500` | Alert icon |

## 📱 Responsive Design

- **Mobile**: Stack vertically, single column
- **Tablet**: 2 columns grid
- **Desktop**: Full layout with 4 columns

## 🔔 Threshold Values

พื้นฐานสำหรับข้าว:
- **Normal**: < 18%
- **Warning**: 18-19.9%
- **Critical**: ≥ 20%

## 🚀 Usage Example

```tsx
import { useState } from 'react';
import { MoistureMeterDashboard } from '@/features/moisture-meter/components';
import { 
  generateMockMoistureDevices,
  DEFAULT_MOISTURE_THRESHOLD 
} from '@/features/moisture-meter/utils/moistureCalculations';

export default function MoistureMeterPage() {
  const [devices] = useState(() => generateMockMoistureDevices(5));

  const handleViewHistory = (deviceId: string) => {
    // Navigate to history page
    console.log('View history for:', deviceId);
  };

  return (
    <MoistureMeterDashboard
      devices={devices}
      threshold={DEFAULT_MOISTURE_THRESHOLD}
      onViewHistory={handleViewHistory}
    />
  );
}
```

## 🎯 Future Enhancements

- [ ] Real-time data from WebSocket
- [ ] Historical data chart
- [ ] Export data to CSV/PDF
- [ ] Email/SMS alerts
- [ ] Multi-language support
- [ ] Custom threshold settings
- [ ] Device grouping by location
- [ ] Comparison with previous period

## 📝 Notes

- ใช้ `date-fns` สำหรับการจัดการเวลา
- ใช้ `lucide-react` สำหรับ icons
- รองรับ Dark Mode
- ออกแบบ Mobile-First
- ใช้ Tailwind CSS สำหรับ styling
