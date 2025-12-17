
import React, { useState } from "react";
import { DeviceHistoryTableProps } from "./device-history/types";
import { useHistoryData } from "./device-history/useHistoryData";
import { HistoryTable } from "./device-history/HistoryTable";
import { HistoryDetailDialog } from "./device-history/HistoryDetailDialog";
import { RiceQualityData } from "./device-history/types";
import { getColumnKeys } from "./device-history/utils";
import { useTranslation } from "@/hooks/useTranslation";

export const DeviceHistoryTable: React.FC<DeviceHistoryTableProps & { title?: string }> = ({ deviceIds, title }) => {
  const { t } = useTranslation();
  const actualTitle = title || t('dataCategories', 'riceQualityHistoryTitle');
  const [selectedRow, setSelectedRow] = useState<RiceQualityData | null>(null);
  
  const {
    historyData,
    totalCount,
    currentPage,
    totalPages,
    itemsPerPage,
    isLoading,
    error,
    setCurrentPage,
    setItemsPerPage
  } = useHistoryData(deviceIds);

  const handleRowClick = (row: RiceQualityData) => {
    setSelectedRow(row);
  };

  const handleCloseDialog = () => {
    setSelectedRow(null);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4 text-emerald-800 dark:text-emerald-400">{actualTitle}</h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("DeviceHistoryTable error:", error);
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4 text-emerald-800 dark:text-emerald-400">{actualTitle}</h3>
        <div className="text-center py-8">
          <div className="text-amber-600 dark:text-amber-400 mb-2">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0l-5.898 8.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            ไม่สามารถโหลดข้อมูลได้
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">กรุณาลองรีเฟรชหน้าเว็บ หรือติดต่อผู้ดูแลระบบ</p>
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

  // Always show the table container, even if there's no data
  const columnKeys = historyData && historyData.length > 0 ? getColumnKeys(historyData) : [];

  return (
    <>
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-400">{actualTitle}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-300">
            {t('general', 'show')} {columnKeys.length} {t('general', 'columns')} | {t('general', 'total')} {totalCount} {t('general', 'items')}
          </span>
        </div>

        {!historyData || historyData.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ยังไม่มีข้อมูลประวัติ
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {'ไม่พบข้อมูลประวัติ'}
            </p>
          </div>
        ) : (
          <HistoryTable
            historyData={historyData}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onRowClick={handleRowClick}
          />
        )}
      </div>

      <HistoryDetailDialog
        selectedRow={selectedRow}
        onClose={handleCloseDialog}
      />
    </>
  );
};
