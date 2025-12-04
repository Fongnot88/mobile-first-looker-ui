import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Droplets, Clock } from "lucide-react";
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
  const { data: readings, isLoading, error } = useMoistureReadings({
    limit: 100
  });

  const automaticReadings = readings?.filter((reading) => reading.event === "automatic_read") ?? [];

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm:ss', { locale: th });
    } catch {
      return dateString;
    }
  };

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(2);
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
        <span className="text-sm text-gray-500 dark:text-gray-300">
          แสดง 4 คอลัมน์ | รวม {automaticReadings.length} รายการ
        </span>
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
                <TableHead className="whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium">Event</TableHead>
                <TableHead className="whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Droplets className="h-4 w-4" />
                    Machine (%)
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Droplets className="h-4 w-4" />
                    Model (%)
                  </div>
                </TableHead>
                <TableHead className="whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    เวลา
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {automaticReadings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell className="whitespace-nowrap px-1.5 py-0.5 text-[11px]">
                    {reading.event || '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-1.5 py-0.5 text-[11px] text-right font-mono">
                    {formatNumber(reading.moisture_machine)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-1.5 py-0.5 text-[11px] text-right font-mono">
                    {formatNumber(reading.moisture_model)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    {formatDateTime(reading.reading_time)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
