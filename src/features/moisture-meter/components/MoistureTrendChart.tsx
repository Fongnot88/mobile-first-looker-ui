import React, { useMemo, useState } from "react";
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
  const [visibleLines, setVisibleLines] = useState({
    moistureMachine: true,
    moistureMachineAvg: true,
    moistureModel: false,
    moistureModelAvg: false,
    temperature: false,
    temperatureAvg: false,
  });

  const averages = useMemo(() => {
    const moistureMachineValues = data
      .map((r) => r.moisture_machine)
      .filter((v): v is number => v !== null && v !== undefined);
    const moistureModelValues = data
      .map((r) => r.moisture_model)
      .filter((v): v is number => v !== null && v !== undefined);
    const temperatureValues = data
      .map((r) => r.temperature)
      .filter((v): v is number => v !== null && v !== undefined);

    const avg = (values: number[]) =>
      values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : null;

    return {
      moistureMachineAvg: avg(moistureMachineValues),
      moistureModelAvg: avg(moistureModelValues),
      temperatureAvg: avg(temperatureValues),
    };
  }, [data]);

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
      moistureMachineAvg: averages.moistureMachineAvg,
      moistureModelAvg: averages.moistureModelAvg,
      temperatureAvg: averages.temperatureAvg,
    }));
  }, [data, averages]);

  const toggleLine = (key: keyof typeof visibleLines) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allVisible = useMemo(
    () => Object.values(visibleLines).every(Boolean),
    [visibleLines]
  );

  const showAllLines = () => {
    const next = !allVisible;
    setVisibleLines({
      moistureMachine: next,
      moistureMachineAvg: next,
      moistureModel: next,
      moistureModelAvg: next,
      temperature: next,
      temperatureAvg: next,
    });
  };

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

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={showAllLines}
          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
            allVisible
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
              : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          แสดงทั้งหมด ({allVisible ? "เปิด" : "ปิด"})
        </button>
        {[
          { key: "moistureMachine", label: "ความชื้น (เครื่อง)", color: "#3b82f6" },
          { key: "moistureModel", label: "ความชื้น (โมเดล)", color: "#06b6d4" },
          { key: "temperature", label: "อุณหภูมิ", color: "#f97316" },
          { key: "moistureMachineAvg", label: "ค่าเฉลี่ย (เครื่อง)", color: "#60a5fa" },
          { key: "moistureModelAvg", label: "ค่าเฉลี่ย (โมเดล)", color: "#22d3ee" },
          { key: "temperatureAvg", label: "ค่าเฉลี่ยอุณหภูมิ", color: "#fb923c" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => toggleLine(item.key as keyof typeof visibleLines)}
            className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-2 ${
              visibleLines[item.key as keyof typeof visibleLines]
                ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
            }`}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color, opacity: visibleLines[item.key as keyof typeof visibleLines] ? 1 : 0.4 }}
            />
            {item.label}
          </button>
        ))}
      </div>
      
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
            {visibleLines.moistureMachine && (
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
            )}
            {visibleLines.moistureModel && (
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
            )}
            {visibleLines.temperature && (
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
            )}
            {visibleLines.moistureMachineAvg && averages.moistureMachineAvg !== null && (
              <Line
                yAxisId="moisture"
                type="monotone"
                dataKey="moistureMachineAvg"
                name="ค่าเฉลี่ย (เครื่อง)"
                stroke="#60a5fa"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                connectNulls
              />
            )}
            {visibleLines.moistureModelAvg && averages.moistureModelAvg !== null && (
              <Line
                yAxisId="moisture"
                type="monotone"
                dataKey="moistureModelAvg"
                name="ค่าเฉลี่ย (โมเดล)"
                stroke="#22d3ee"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                connectNulls
              />
            )}
            {visibleLines.temperatureAvg && averages.temperatureAvg !== null && (
              <Line
                yAxisId="temperature"
                type="monotone"
                dataKey="temperatureAvg"
                name="ค่าเฉลี่ยอุณหภูมิ"
                stroke="#fb923c"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
        แสดงข้อมูล {data.length} รายการล่าสุด
      </p>
    </div>
  );
};
