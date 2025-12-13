import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { MoistureHistoryReading } from "../hooks/useMoistureHistory";

interface MoistureTrendChartProps {
  data: MoistureHistoryReading[];
  isLoading?: boolean;
}

export const MoistureTrendChart: React.FC<MoistureTrendChartProps> = ({
  data,
  isLoading = false,
}) => {
  const chartData = useMemo(() => {
    return data.map((reading) => ({
      time: reading.reading_time 
        ? format(new Date(reading.reading_time), "d/M HH:mm", { locale: th })
        : "-",
      fullTime: reading.reading_time
        ? format(new Date(reading.reading_time), "d MMM yyyy HH:mm", { locale: th })
        : "-",
      moistureMachine: reading.moisture_machine,
      moistureModel: reading.moisture_model,
      temperature: reading.temperature,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
        <div className="h-64 bg-gray-100 dark:bg-gray-700/50 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
        <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">ไม่พบข้อมูลประวัติการวัด</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const fullTime = payload[0]?.payload?.fullTime;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{fullTime}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(1) ?? "-"} {entry.name.includes("ความชื้น") ? "%" : "°C"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        แนวโน้มความชื้นและอุณหภูมิ
      </h3>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={{ stroke: '#d1d5db' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="moisture"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={{ stroke: '#d1d5db' }}
              domain={['auto', 'auto']}
              label={{ value: '%', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#6b7280' }}
            />
            <YAxis 
              yAxisId="temperature"
              orientation="right"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={{ stroke: '#d1d5db' }}
              domain={['auto', 'auto']}
              label={{ value: '°C', angle: 90, position: 'insideRight', fontSize: 10, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Line
              yAxisId="moisture"
              type="monotone"
              dataKey="moistureMachine"
              name="ความชื้น (เครื่อง)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
              connectNulls
            />
            <Line
              yAxisId="moisture"
              type="monotone"
              dataKey="moistureModel"
              name="ความชื้น (โมเดล)"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ r: 3, fill: '#06b6d4' }}
              activeDot={{ r: 5 }}
              connectNulls
            />
            <Line
              yAxisId="temperature"
              type="monotone"
              dataKey="temperature"
              name="อุณหภูมิ"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 3, fill: '#f97316' }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
        แสดงข้อมูล {data.length} รายการล่าสุด
      </p>
    </div>
  );
};
