
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RiceQualityData } from './types';

export const useHistoryData = (deviceIds?: string[]) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['deviceHistory', deviceIds || 'all', currentPage, itemsPerPage],
    queryFn: async () => {
      console.log('Fetching history data for devices:', deviceIds);
      const offset = (currentPage - 1) * itemsPerPage;
      
      let query = supabase
        .from('rice_quality_analysis')
        .select('*, output', { count: 'exact' });

            // Filter by device_ids if the array is provided and not empty
      if (deviceIds && deviceIds.length > 0) {
        query = query.in('device_code', deviceIds);
        console.log('Filtering by device_ids:', deviceIds);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      if (error) {
        console.error('Error fetching history data:', error);
        throw error;
      }

      // Smart Deduplication: Content-based and Time-based
      // Handles double entries where timestamps differ slightly (e.g. milliseconds) but data is identical
      const uniqueData = data ? (data as any[]).filter((item, index, self) => {
        // 1. Check for exact duplicates first (fastest)
        const exactKey = `${item.device_code}-${item.created_at}`;
        const firstExactIndex = self.findIndex(t => `${t.device_code}-${t.created_at}` === exactKey);
        if (index !== firstExactIndex) return false;

        // 2. Deep content check for "effectively duplicate" records
        // Same device, similar time (< 60s diff), identical critical values
        const currentMs = new Date(item.created_at).getTime();
        
        // Check if there is any earlier record (lower index) that matches criteria
        const isDuplicateOfPrevious = self.slice(0, index).some(prev => {
          if (prev.device_code !== item.device_code) return false;
          
          // Time check: un-duplicates usually happen within seconds
          const prevMs = new Date(prev.created_at).getTime();
          if (Math.abs(currentMs - prevMs) > 60000) return false; // > 1 minute diff = distinct
          
          // Content check: Compare key quality metrics
          // If all these matched, it's overwhelmingly likely to be the same sample
          return (
            prev.whole_kernels === item.whole_kernels &&
            prev.head_rice === item.head_rice &&
            prev.total_brokens === item.total_brokens &&
            prev.yellow_rice_rate === item.yellow_rice_rate
          );
        });

        return !isDuplicateOfPrevious;
      }) : [];
      
      console.log('Successfully fetched history data:', { 
        count, 
        rawLength: data?.length, 
        uniqueLength: uniqueData.length 
      });
      
      // Get unique device codes from the filtered unique results
      const deviceCodes = [...new Set(uniqueData.map(item => item.device_code))];
      
      // Fetch device display names if we have device codes
      let deviceNamesMap: Record<string, string> = {};
      if (deviceCodes.length > 0) {
        const { data: deviceSettings, error: deviceError } = await supabase
          .from('device_settings')
          .select('device_code, display_name')
          .in('device_code', deviceCodes);
          
        if (deviceError) {
          console.error('Error fetching device settings:', deviceError);
        } else if (deviceSettings) {
          deviceNamesMap = deviceSettings.reduce((acc, device) => ({
            ...acc,
            [device.device_code]: device.display_name || device.device_code
          }), {});
        }
      }
      
      // Add device_display_name and ensure all required fields exist with defaults
      const enhancedData = uniqueData.map(item => ({
        ...item,
        device_display_name: deviceNamesMap[item.device_code] || item.device_code,
        // Add default values for new columns if they don't exist - using bracket notation for type safety
        mix_rate: (item as any)['mix_rate'] ?? null,
        sprout_rate: (item as any)['sprout_rate'] ?? null,
        unripe_rate: (item as any)['unripe_rate'] ?? null,
        brown_rice_rate: (item as any)['brown_rice_rate'] ?? null,
        main_rate: (item as any)['main_rate'] ?? null,
        mix_index: (item as any)['mix_index'] ?? null,
        main_index: (item as any)['main_index'] ?? null,
        heavy_chalkiness_rate: (item as any)['heavy_chalkiness_rate'] ?? null,
        // New fields
        cur_material: (item as any)['cur_material'] ?? null,
        cur_variety: (item as any)['cur_variety'] ?? null,
        machine_unix_time: (item as any)['machine_unix_time'] ?? null,
        simple_index: (item as any)['simple_index'] ?? null,
        msg_id: (item as any)['msg_id'] ?? null,
        surveyor: (item as any)['surveyor'] ?? null,
        sample_source: (item as any)['sample_source'] ?? null,
      }));
      
      return { data: enhancedData as RiceQualityData[], count: count || 0 };
    },
    enabled: true, // Always enable the query
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const totalPages = historyData ? Math.ceil(historyData.count / itemsPerPage) : 0;

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    historyData: historyData?.data || [],
    totalCount: historyData?.count || 0,
    currentPage,
    totalPages,
    itemsPerPage,
    isLoading,
    error,
    setCurrentPage,
    setItemsPerPage: handleItemsPerPageChange
  };
};
