import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Droplets, Thermometer, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { MoistureHistoryReading } from "../hooks/useMoistureHistory";
import { DEFAULT_MOISTURE_THRESHOLD } from "../utils/moistureCalculations";

type MoistureSummaryStats = {
  averageMoisture: number;
  maxMoisture: number;
  minMoisture: number;
  averageTemperature: number | null;
};

interface MoistureSnapshotBarChartProps {
  readings: MoistureHistoryReading[];
  moistureSummary?: MoistureSummaryStats | null;
  isLoading?: boolean;
  moistureAlertThreshold?: number;
  temperatureAlertThreshold?: number;
}

export const MoistureSnapshotBarChart: React.FC<MoistureSnapshotBarChartProps> = ({
  readings,
  moistureSummary,
  isLoading = false,
  moistureAlertThreshold = DEFAULT_MOISTURE_THRESHOLD.critical,
  temperatureAlertThreshold = 35, // สมมติค่าแจ้งเตือนอุณหภูมิ
}) => {
  const latestItems = useMemo(() => {
    if (!readings || readings.length === 0) return [];
    const sliced = readings.slice(-4); // 4 ช่วงเวลาล่าสุด
    const avgMoisture =
      moistureSummary?.averageMoisture ??
      (() => {
        const values = readings
          .map((r) => r.moisture_machine ?? r.moisture_model)
          .filter((v): v is number => v !== null && v !== undefined);
        if (!values.length) return null;
        return values.reduce((sum, v) => sum + v, 0) / values.length;
      })();
    const avgTemperature =
      moistureSummary?.averageTemperature ??
      (() => {
        const values = readings
          .map((r) => r.temperature)
          .filter((v): v is number => v !== null && v !== undefined);
        if (!values.length) return null;
        return values.reduce((sum, v) => sum + v, 0) / values.length;
      })();

    return sliced.map((reading) => ({
      time: reading.reading_time
        ? format(new Date(reading.reading_time), "d/M HH:mm", { locale: th })
        : "-",
      moistureCurrent: reading.moisture_machine ?? reading.moisture_model ?? null,
      moistureAlert: moistureAlertThreshold,
      moistureAvg: avgMoisture,
      temperatureCurrent: reading.temperature ?? null,
      temperatureAlert: temperatureAlertThreshold,
      temperatureAvg: avgTemperature,
    }));
  }, [readings, moistureAlertThreshold, temperatureAlertThreshold, moistureSummary]);

  const [yMin, yMax] = useMemo(() => {
    const values: number[] = [];
    latestItems.forEach((item) => {
      [
        item.moistureCurrent,
        item.moistureAlert,
        item.moistureAvg,
        item.temperatureCurrent,
        item.temperatureAlert,
        item.temperatureAvg,
      ].forEach((v) => {
        if (v !== null && v !== undefined) values.push(v);
      });
    });
    if (!values.length) return [0, 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max((max - min) * 0.1, 1);
    return [min - padding, max + padding];
  }, [latestItems]);

  const { visualMoistureAvg, visualTemperatureAvg } = useMemo(() => {
    const range = yMax - yMin || 1;
    return {
      visualMoistureAvg: yMin + range * 0.45,
      visualTemperatureAvg: yMin + range * 0.55,
    };
  }, [yMin, yMax]);

  if (isLoading) {
    return (
      <div className="bg-white/70 dark:bg-gray-800/40 p-6 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-52 mb-4 animate-pulse"></div>
        <div className="h-64 bg-gray-100 dark:bg-gray-700/50 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (!latestItems.length) {
    return (
      <div className="bg-white/70 dark:bg-gray-800/40 p-6 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm text-center">
        <TrendingUp className="w-10 h-10 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">ยังไม่มีข้อมูลล่าสุดเพียงพอสำหรับกราฟแท่ง</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const avgMoisture = payload[0]?.payload?.moistureAvg;
      const avgTemp = payload[0]?.payload?.temperatureAvg;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">เวลา: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value !== null && entry.value !== undefined ? entry.value.toFixed(1) : "-"}
            </p>
          ))}
          {(avgMoisture !== null && avgMoisture !== undefined) && (
            <p className="flex items-center gap-2 text-cyan-600 dark:text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              ค่าเฉลี่ยความชื้น: {avgMoisture.toFixed(1)}
            </p>
          )}
          {(avgTemp !== null && avgTemp !== undefined) && (
            <p className="flex items-center gap-2 text-orange-600 dark:text-orange-300">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              ค่าเฉลี่ยอุณหภูมิ: {avgTemp.toFixed(1)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderAvgDot = (color: string) => (props: any) => {
    const { cx, cy } = props;
    if (cx === undefined || cy === undefined) return null;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        stroke="#fff"
        strokeWidth={1.5}
        className="animate-pulse"
      />
    );
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/40 p-6 rounded-xl border border-gray-100 dark:border-gray-800/30 shadow-md backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">สแนปช็อตกราฟแท่ง (4 เวลาล่าสุด)</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Droplets className="w-4 h-4 text-cyan-500" /> ความชื้น
          </div>
          <div className="flex items-center gap-1">
            <Thermometer className="w-4 h-4 text-orange-500" /> อุณหภูมิ
          </div>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={latestItems} margin={{ top: 10, right: 10, left: -10, bottom: 5 }} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={{ stroke: "#d1d5db" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={{ stroke: "#d1d5db" }}
              label={{ value: "ค่า", angle: -90, position: "insideLeft", fontSize: 10, fill: "#6b7280" }}
              domain={[yMin, yMax]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />

            {/* Visual average guide lines (กึ่งกลางกราฟเพื่อมองเห็นค่าเฉลี่ย) */}
            <ReferenceLine
              y={visualMoistureAvg}
              stroke="#06b6d4"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{ value: "ค่าเฉลี่ยความชื้น (กึ่งกลาง)", position: "insideTopRight", fill: "#06b6d4", fontSize: 10 }}
            />
            <ReferenceLine
              y={visualTemperatureAvg}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{ value: "ค่าเฉลี่ยอุณหภูมิ (กึ่งกลาง)", position: "insideTopRight", fill: "#f59e0b", fontSize: 10 }}
            />

            {/* Moisture bars */}
            <Bar dataKey="moistureCurrent" name="ค่าความชื้นปัจจุบัน" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="moistureAlert" name="ค่าความชื้นที่ตั้งไว้แจ้งเตือน" fill="#ef4444" radius={[4, 4, 0, 0]} />

            {/* Temperature bars */}
            <Bar dataKey="temperatureCurrent" name="ค่าอุณหภูมิ" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="temperatureAlert" name="ค่าอุณหภูมิที่ตั้งไว้แจ้งเตือน" fill="#fb7185" radius={[4, 4, 0, 0]} />
            {latestItems.some((item) => item.moistureAvg !== null && item.moistureAvg !== undefined) && (
              <Line
                type="monotone"
                dataKey="moistureAvg"
                name="ค่าเฉลี่ยความชื้น"
                stroke="#06b6d4"
                strokeDasharray="6 4"
                strokeWidth={3}
                dot={renderAvgDot("#06b6d4")}
                activeDot={renderAvgDot("#06b6d4")}
                connectNulls
              />
            )}
            {latestItems.some((item) => item.temperatureAvg !== null && item.temperatureAvg !== undefined) && (
              <Line
                type="monotone"
                dataKey="temperatureAvg"
                name="ค่าเฉลี่ยอุณหภูมิ"
                stroke="#f59e0b"
                strokeDasharray="6 4"
                strokeWidth={3}
                dot={renderAvgDot("#f59e0b")}
                activeDot={renderAvgDot("#f59e0b")}
                connectNulls
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
        แสดง 4 ช่วงเวลาล่าสุด พร้อมค่าปัจจุบัน / แจ้งเตือน / ค่าเฉลี่ย
      </p>
    </div>
  );
};
