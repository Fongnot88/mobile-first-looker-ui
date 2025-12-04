import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Droplets, Clock, Cpu, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMoistureReadings, MoistureReading } from "../hooks/useMoistureReadings";

interface MoistureReadingsTableProps {
  deviceCodes?: string[];
  title?: string;
}

export function MoistureReadingsTable({ 
  deviceCodes, 
  title = "ประวัติเครื่องวัดความชื้นข้าว" 
}: MoistureReadingsTableProps) {
  const { data: readings, isLoading, isRefetching, refetch } = useMoistureReadings({
    deviceCodes,
    limit: 100
  });

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </CardHeader>
      <CardContent>
        {(!readings || readings.length === 0) ? (
          <div className="text-center py-8 text-muted-foreground">
            <Droplets className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>ยังไม่มีข้อมูลจากเครื่องวัดความชื้น</p>
            <p className="text-sm mt-1">ข้อมูลจะปรากฏเมื่อได้รับจาก MQTT</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">
                    <div className="flex items-center gap-1">
                      <Cpu className="h-4 w-4" />
                      รหัสอุปกรณ์
                    </div>
                  </TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Droplets className="h-4 w-4" />
                      Machine (%)
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Droplets className="h-4 w-4" />
                      Model (%)
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      เวลา
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="font-mono text-sm">
                      {reading.device_code}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {reading.event || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(reading.moisture_machine)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(reading.moisture_model)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(reading.reading_time)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
