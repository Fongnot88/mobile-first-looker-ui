import React, { useRef } from "react";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { getColumnThaiName } from "@/lib/columnTranslations";
import { useMeasurementTranslations } from "@/lib/measurementTranslations";
import { RiceQualityData } from './types';
import { formatCellValue, getColumnKeys } from './utils';
import { useDragScroll } from "@/utils/dragUtils";
import { useTranslation } from "@/hooks/useTranslation";
import materialVarietyTranslations from "@/lib/material-variety-translations.json";

interface HistoryTableProps {
  historyData: RiceQualityData[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onRowClick: (row: RiceQualityData) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  historyData,
  totalCount,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onRowClick
}) => {
  const { t, language } = useTranslation();
  const { getColumnTranslation } = useMeasurementTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, dragHandlers] = useDragScroll(containerRef);
  // Get all column keys and create custom order: ชื่ออุปกรณ์, ผู้ตรวจ, then rest, วันที่บันทึก at end
  const allKeys = getColumnKeys(historyData);
  const priorityColumns = ['machine_unix_time', 'device_display_name', 'surveyor', 'cur_material', 'output', 'heavy_chalkiness_rate'];
  const remainingKeys = allKeys.filter(
    (k) => !priorityColumns.includes(k) && k !== 'device_display_name' && k !== 'output' && k !== 'created_at'
  );
  
  const columnKeys = [...priorityColumns, ...remainingKeys, 'created_at'];

  // Helper: translate material/variety code based on current language and JSON mapping
  const translateByCode = (category: 'material' | 'variety_detect', code: string | number) => {
    try {
      const categories: any = (materialVarietyTranslations as any).categories;
      const items: any[] = categories?.[category]?.items || [];
      const codeStr = String(code);
      const found = items.find((it) => it.code === codeStr);
      if (!found) return codeStr;

      const langKey = language === 'th' ? 'name_th' : language === 'zh' ? 'name_zh' : 'name_en';
      return found[langKey] || found['name_en'] || codeStr;
    } catch (e) {
      return String(code ?? '-');
    }
  };

  if (!historyData || historyData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-300">
        {t('general', 'noData')}
      </div>
    );
  }

  return (
    <>
      <div 
        ref={containerRef}
        className={`overflow-x-auto text-xs ${dragState.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={dragHandlers.handleMouseDown}
        onMouseMove={dragHandlers.handleMouseMove}
        onMouseUp={dragHandlers.handleDragEnd}
        onMouseLeave={dragHandlers.handleDragEnd}
        onTouchStart={dragHandlers.handleTouchStart}
        onTouchMove={dragHandlers.handleTouchMove}
        onTouchEnd={dragHandlers.handleDragEnd}
        style={{ userSelect: dragState.isDragging ? 'none' : 'auto' }}
      >
        <ResponsiveTable>
          <TableHeader>
            <TableRow>
              {columnKeys.map((key) => {
                // Custom header for device_display_name, output, and code columns
                const displayName = key === 'device_display_name' 
                  ? t('dataCategories', 'deviceName')
                  : key === 'output'
                  ? t('dataCategories', 'kernelCount')
                  : getColumnTranslation(key);
                
                return (
                  <TableHead 
                    key={key} 
                    className={`whitespace-nowrap px-1.5 py-0.5 text-[11px] font-medium ${
                      key === 'device_display_name' ? 'sticky left-0 bg-white dark:bg-gray-800 z-10' : ''
                    }`}
                  >
                    {displayName}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyData.map((row) => (
              <TableRow key={row.id} onClick={() => onRowClick(row)} className="cursor-pointer hover:bg-muted/50">
                {columnKeys.map((key) => {
                  // Use device_code as fallback if device_display_name is not available
                  const value = key === 'device_display_name' 
                    ? row.device_display_name || row.device_code 
                    : row[key];
                  
                  return (
                    <TableCell 
                      key={`${row.id}-${key}`} 
                      className={`whitespace-nowrap px-1.5 py-0.5 text-[11px] ${
                        key === 'device_display_name' ? 'sticky left-0 bg-white dark:bg-gray-800 z-10 font-medium' : ''
                      }`}
                    >
                      {key === 'cur_material'
                        ? translateByCode('material', value)
                        : formatCellValue(key, value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </ResponsiveTable>
      </div>

      {/* Row limit controls - moved to bottom */}
      <div className="flex justify-between items-center mt-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{t('general', 'show')}:</span>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="w-[60px] h-6 text-[11px] bg-white border border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 z-50">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="500">500</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">{t('general', 'rows')}</span>
        </div>
        <div className="text-xs text-gray-500">
          {t('general', 'total')} {totalCount} {t('general', 'items')}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-0.5 px-0.5 text-[10px]">
          <div className="text-[10px] text-gray-500">
            {t('general', 'page')} {currentPage} {t('general', 'of')} {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
