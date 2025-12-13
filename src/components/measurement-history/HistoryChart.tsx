
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area
} from "recharts";
import { calculateAverage, formatBangkokTime, getTimeFrameHours } from './api';
import { GraphStyleOptions, HistoryItem, TimeFrame } from './types';
import { useTranslation } from '@/hooks/useTranslation';



type HistoryChartProps = {
  historyData: HistoryItem[] | undefined;
  isLoading: boolean;
  dataKey: string;
  error: string | null;
  unit?: string;
  timeFrame?: TimeFrame;
  styleOptions?: GraphStyleOptions;
};

const HistoryChart: React.FC<HistoryChartProps> = ({ 
  historyData,
  isLoading,
  dataKey,
  error,
  unit = "",
  timeFrame = "24h",
  styleOptions = {}
}) => {
  const { t } = useTranslation();
  // สไตล์เริ่มต้น - ถ้าไม่ระบุให้ใช้แบบเส้นธรรมดา
  const graphStyle = styleOptions.graphStyle || 'line';
  const barColor = styleOptions.barColor || '#9b87f5';
  const lineColor = styleOptions.lineColor || '#F97316';
  // Calculate average
  const average = useMemo(() => 
    calculateAverage(historyData || [], dataKey), 
    [historyData, dataKey]
  );

  // Prepare data for the chart
  const chartData = useMemo(() => {
    if (!historyData || historyData.length === 0) {
      // Create empty chart data with 0 values when no data is available
      const currentDate = new Date();
      const hours = getTimeFrameHours(timeFrame);
      
      // Create array with empty data points spread across the time frame
      const emptyData = [];
      for (let i = 0; i <= hours; i += Math.max(1, Math.floor(hours/5))) {
        const pointDate = new Date(currentDate);
        pointDate.setHours(pointDate.getHours() - (hours - i));
        
        const { thaiTime, thaiDate } = formatBangkokTime(pointDate.toISOString());
        
        emptyData.push({
          time: thaiTime,
          value: 0,
          date: thaiDate
        });
      }
      return emptyData;
    }
    
    return historyData
      .map((item: HistoryItem) => {
        const dateString = item.created_at || item.thai_datetime;
        const { thaiTime, thaiDate } = formatBangkokTime(dateString);
        
        return {
          time: thaiTime,
          value: item[dataKey] !== null && item[dataKey] !== undefined ? Number(item[dataKey]) : null,
          date: thaiDate
        };
      })
      .reverse();
  }, [historyData, dataKey, timeFrame]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-emerald-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  console.log("Chart data:", chartData);

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 hover:shadow-xl transition-shadow duration-300 dark:text-white">
      <div className="h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {graphStyle === 'area' ? (
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: -30, left: -30, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={barColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={barColor} stopOpacity={0.1} />
                </linearGradient>
                <filter id="shadow" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.1)" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e0e0e0" strokeWidth={1} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                padding={{ left: 0, right: 0 }}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                tickFormatter={(value) => `${value}%`}
                axisLine={false}
                tickLine={false}
                width={15}
                tickMargin={-10}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dark:text-white">
                        <p className="text-xs font-medium">{`${t('general', 'time')} ${payload[0].payload.time} น.`}</p>
                        <p className="text-xs font-medium" style={{ color: barColor }}>{`${t('general', 'value')} ${payload[0].value}%`}</p>
                        <p className="text-xs text-gray-500">{payload[0].payload.date}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine 
                y={average} 
                stroke={lineColor} 
                strokeDasharray="3 3"
                label={{
                  position: 'top',
                  value: `${t('general', 'average')} ${average.toFixed(2)}%\n(${t('general', 'range')} ${(average * 0.95).toFixed(2)} - ${(average * 1.05).toFixed(2)}%)`,
                  fill: lineColor,
                  fontSize: 12,
                  offset: 0,
                  dy: -20,
                  dx: 20,
                  textAnchor: 'start'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={barColor}
                strokeWidth={2}
                fill={`url(#colorValue)`}
                fillOpacity={0.9}
                dot={false}
                style={{ filter: "url(#shadow)" }}
                activeDot={{ r: 4, stroke: barColor, strokeWidth: 2, fill: 'white' }}
                animationDuration={500}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 0, right: -30, left: -30, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e0e0e0" strokeWidth={1} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                padding={{ left: 0, right: 0 }}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                tickFormatter={(value) => `${value}%`}
                axisLine={false}
                tickLine={false}
                width={15}
                tickMargin={-10}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dark:text-white">
                        <p className="text-xs font-medium">{`${t('general', 'time')} ${payload[0].payload.time} น.`}</p>
                        <p className="text-xs font-medium" style={{ color: barColor }}>{`${t('general', 'value')} ${payload[0].value}%`}</p>
                        <p className="text-xs text-gray-500">{payload[0].payload.date}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine 
                y={average} 
                stroke={lineColor} 
                strokeDasharray="3 3"
                label={{
                  position: 'top',
                  value: `${t('general', 'average')} ${average.toFixed(2)}%\n(${t('general', 'range')} ${(average * 0.95).toFixed(2)} - ${(average * 1.05).toFixed(2)}%)`,
                  fill: lineColor,
                  fontSize: 12,
                  offset: 0,
                  dy: -20,
                  dx: 20,
                  textAnchor: 'start'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={barColor} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: barColor, strokeWidth: 2, fill: 'white' }}
                animationDuration={500}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;
