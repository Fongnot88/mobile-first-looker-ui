import { useTranslation } from "@/hooks/useTranslation";
import { getColumnTranslatedName } from "@/lib/columnTranslations";

// Hook for getting measurement translations
export const useMeasurementTranslations = () => {
  const { t, language } = useTranslation();
  
  const getColumnTranslation = (columnName: string): string => {
    const translationMap: Record<string, { category: string, key: string }> = {
      'created_at': { category: 'measurements', key: 'recordDate' },
      'device_code': { category: 'measurements', key: 'deviceCode' },
      'machine_unix_time_minus_1h': { category: 'measurements', key: 'machineUnixTime' },
      'machine_unix_time': { category: 'measurements', key: 'machineUnixTime' },
      'class1': { category: 'measurements', key: 'class1' },
      'class2': { category: 'measurements', key: 'class2' },
      'class3': { category: 'measurements', key: 'class3' },
      'short_grain': { category: 'measurements', key: 'shortGrain' },
      'slender_kernel': { category: 'measurements', key: 'slenderKernel' },
      'whole_kernels': { category: 'measurements', key: 'wholeKernels' },
      'head_rice': { category: 'measurements', key: 'headRice' },
      'total_brokens': { category: 'measurements', key: 'totalBrokens' },
      'small_brokens': { category: 'measurements', key: 'smallBrokens' },
      'small_brokens_c1': { category: 'measurements', key: 'smallBrokensC1' },
      'red_line_rate': { category: 'measurements', key: 'redLineRate' },
      'parboiled_red_line': { category: 'measurements', key: 'parboiledRedLine' },
      'parboiled_white_rice': { category: 'measurements', key: 'parboiledWhiteRice' },
      'honey_rice': { category: 'measurements', key: 'honeyRice' },
      'yellow_rice_rate': { category: 'measurements', key: 'yellowRiceRate' },
      'black_kernel': { category: 'measurements', key: 'blackKernel' },
      'partly_black_peck': { category: 'measurements', key: 'partlyBlackPeck' },
      'partly_black': { category: 'measurements', key: 'partlyBlack' },
      'imperfection_rate': { category: 'measurements', key: 'imperfectionRate' },
      'sticky_rice_rate': { category: 'measurements', key: 'stickyRiceRate' },
      'impurity_num': { category: 'measurements', key: 'impurityNum' },
      'paddy_rate': { category: 'measurements', key: 'paddyRate' },
      'whiteness': { category: 'measurements', key: 'whiteness' },
      'heavy_chalkiness_rate': { category: 'measurements', key: 'heavyChalkiness' },
      'process_precision': { category: 'measurements', key: 'processPrecision' },
    };

    const translation = translationMap[columnName];
    if (translation) {
      return t(translation.category as any, translation.key as any);
    }

    // Fallback to columnTranslations mapping (th/en/zh)
    return getColumnTranslatedName(columnName, language as 'th' | 'en' | 'zh');
  };

  return { getColumnTranslation };
};