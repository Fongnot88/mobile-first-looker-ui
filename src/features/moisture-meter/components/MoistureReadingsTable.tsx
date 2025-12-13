import { useMemo, useState } from "react";
import { Droplets, Clock } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMoistureReadings } from "../hooks/useMoistureReadings";

interface MoistureReadingsTableProps {
  title?: string;
}

export function MoistureReadingsTable({ 
  title = "ประวัติอุปกรณ์เครื่องวัดความชื้นข้าว" 
}: MoistureReadingsTableProps) {
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<'reading_time' | 'device_name' | 'moisture_machine' | 'moisture_model' | 'temperature' | 'device_code'>('reading_time');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data: readings, isLoading, error } = useMoistureReadings({
    limit: pageSize
  });

  const automaticReadings = readings?.filter((reading) => reading.event === "automatic_read") ?? [];

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      // ตัวอย่างรูปแบบ: 2025-12-05 02:30:12.801891+00
      const match = dateString.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
      );

      let date: Date;

      if (match) {
        const [, year, month, day, hour, minute, second = "0"] = match;
        // สร้าง Date โดยใช้เวลาเป็น local time ตรง ๆ (ไม่ใช้ timezone จากสตริง)
        date = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second)
        );
      } else {
        // fallback เผื่อรูปแบบไม่ตรง ใช้ Date ปกติ
        date = new Date(dateString);
      }

      return format(date, "dd MMM yy HH:mm น.", { locale: th });
    } catch (e) {
      console.error("Failed to format reading_time", dateString, e);
      return dateString;
    }
  };

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(2);
  };

  const handleSort = (key: typeof sortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir(key === 'reading_time' ? 'desc' : 'asc');
      return key;
    });
  };

  const sortedReadings = useMemo(() => {
    const copy = [...automaticReadings];
    const dir = sortDir === 'asc' ? 1 : -1;

    const getVal = (item: typeof automaticReadings[number]) => {
      switch (sortKey) {
        case 'reading_time': {
          if (!item.reading_time) return null;
          const time = new Date(item.reading_time).getTime();
          return Number.isNaN(time) ? null : time;
        }
        case 'device_name':
          return (item.device_name || item.device_code || '').toLowerCase();
        case 'moisture_machine':
          return item.moisture_machine;
        case 'moisture_model':
          return item.moisture_model;
        case 'temperature':
          return item.temperature;
        case 'device_code':
          return (item.device_code || '').toLowerCase();
        default:
          return null;
      }
    };

    copy.sort((a, b) => {
      const aVal = getVal(a);
      const bVal = getVal(b);

      const aNull = aVal === null || aVal === undefined || aVal === '';
      const bNull = bVal === null || bVal === undefined || bVal === '';

      if (aNull && bNull) return 0;
      if (aNull) return 1; // nulls ไปท้าย
      if (bNull) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * dir;
      }

      return String(aVal).localeCompare(String(bVal)) * dir;
    });
    return copy;
  }, [automaticReadings, sortDir, sortKey]);

  const renderSortIndicator = (key: typeof sortKey) => {
    if (sortKey !== key) return null;
    return <span className="ml-1 text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4 text-emerald-800 dark:text-emerald-400">
          {title}
        </h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("MoistureReadingsTable error:", error);
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4 text-emerald-800 dark:text-emerald-400">{title}</h3>
        <div className="text-center py-8">
          <div className="text-amber-600 dark:text-amber-400 mb-2">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0l-5.898 8.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            ไม่สามารถโหลดข้อมูลจากเครื่องวัดความชื้นได้
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            กรุณาลองรีเฟรชหน้าเว็บ หรือติดต่อผู้ดูแลระบบ
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
          >
            รีเฟรชหน้าเว็บ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-400">
          {title}
        </h3>
        <div className="flex items-center gap-3 text-xs md:text-sm text-gray-500 dark:text-gray-300">
          <span className="whitespace-nowrap">
            แสดง 6 คอลัมน์ | รวม {automaticReadings.length} รายการ
          </span>
        </div>
      </div>

      {automaticReadings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Droplets className="h-12 w-12 mx-auto mb-3 opacity-20 text-gray-400" />
          <p>ยังไม่มีข้อมูลจากเครื่องวัดความชื้น</p>
          <p className="text-sm mt-1">ข้อมูลจะปรากฏเมื่อได้รับจาก MQTT</p>
        </div>
      ) : (
        <div className="overflow-x-auto text-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium">
                  <button type="button" className="flex items-center gap-1" onClick={() => handleSort('reading_time')}>
                    <Clock className="h-4 w-4" />
                    เวลา {renderSortIndicator('reading_time')}
                  </button>
                </TableHead>
                <TableHead className="whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium">
                  <button type="button" className="flex items-center gap-1" onClick={() => handleSort('device_name')}>
                    ชื่ออุปกรณ์ {renderSortIndicator('device_name')}
                  </button>
                </TableHead>
                <TableHead className="whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium text-right">
                  <button type="button" className="flex items-center justify-end gap-1 w-full" onClick={() => handleSort('moisture_machine')}>
                    <Droplets className="h-4 w-4" />
                    ค่าความชื้น {renderSortIndicator('moisture_machine')}
                  </button>
                </TableHead>
                <TableHead className="whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium text-right">
                  <button type="button" className="flex items-center justify-end gap-1 w-full" onClick={() => handleSort('moisture_model')}>
                    <Droplets className="h-4 w-4" />
                    Model % {renderSortIndicator('moisture_model')}
                  </button>
                </TableHead>
                <TableHead className="whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium text-right">
                  <button type="button" className="flex items-center justify-end gap-1 w-full" onClick={() => handleSort('temperature')}>
                    อุณหภูมิ (°C) {renderSortIndicator('temperature')}
                  </button>
                </TableHead>
                <TableHead className="whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium">
                  <button type="button" className="flex items-center gap-1" onClick={() => handleSort('device_code')}>
                    รหัสอุปกรณ์ {renderSortIndicator('device_code')}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedReadings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell className="whitespace-nowrap px-1.5 py-0.5 text-[11px]">
                    {formatDateTime(reading.reading_time)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-1.5 py-0.5 text-[11px]">
                    {reading.device_name || reading.device_code || '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-1.5 py-0.5 text-[11px] text-right font-mono">
                    {formatNumber(reading.moisture_machine)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-1.5 py-0.5 text-[11px] text-right font-mono">
                    {formatNumber(reading.moisture_model)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-1.5 py-0.5 text-[11px] text-right font-mono">
                    {formatNumber(reading.temperature)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-1.5 py-0.5 text-[11px]">
                    {reading.device_code || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex justify-end items-center mt-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="whitespace-nowrap">แถวต่อหน้า:</span>
          {[10, 50, 100, 500].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setPageSize(size)}
              className={`px-2 py-0.5 rounded-full border text-[11px] md:text-xs transition-colors ${
                pageSize === size
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
