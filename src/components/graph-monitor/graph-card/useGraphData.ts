import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SelectedGraph } from "../types";
import { TimeFrame } from "@/components/measurement-history/MeasurementHistory";
import { getTimeFrameHours } from "@/components/measurement-history/api";

export const useGraphData = (graph: SelectedGraph, timeFrame: TimeFrame) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGraphData();
  }, [graph, timeFrame]);

  const fetchGraphData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Calculate cutoff date based on timeframe
      const hours = getTimeFrameHours(timeFrame);
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hours);
      
      const { data, error } = await supabase
        .from("rice_quality_analysis")
        .select("*")
        .eq("device_code", graph.deviceCode)
        .gt("created_at", cutoffDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) {
        console.error("Error fetching graph data:", error);
        // Check if this is an RLS/permission error
        if (error.code === "PGRST301" || error.message?.includes("policy") || error.message?.includes("permission")) {
          setError("คุณไม่มีสิทธิ์เข้าถึงข้อมูลของอุปกรณ์นี้");
        } else {
          setError("ไม่สามารถโหลดข้อมูลได้");
        }
        return;
      }

      if (!data || data.length === 0) {
        setError("ไม่พบข้อมูล");
        setData([]);
        return;
      }

      // Transform the data for the chart, accessing the specific column directly
      const chartData = data
        .filter(item => 
          item[graph.symbol] !== undefined
        )
        .map(item => {
          const value = item[graph.symbol];
          
          // Format date for display
          const date = new Date(item.created_at);
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
          
          return {
            time: formattedDate,
            value: Number(value),
            fullDate: item.created_at
          };
        })
        .reverse(); // Display oldest to newest

      setData(chartData);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setLoading(false);
    }
  };

  return { loading, data, error };
};