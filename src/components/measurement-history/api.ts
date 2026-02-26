
import { supabase } from "@/integrations/supabase/client";
import { TimeFrame } from "./MeasurementHistory";
import { convertUrlSymbolToMeasurementSymbol } from "./utils/symbolMapping";
import { 
  validateApiAccess, 
  validateUserAuthentication, 
  validateDeviceAccess,
  validateNotificationOwnership,
  logSecurityEvent,
  createApiError,
  ValidationResult
} from "@/utils/apiValidation";

// Function to get hours based on timeframe
export const getTimeFrameHours = (frame: TimeFrame): number => {
  switch (frame) {
    case '1h': return 1;
    case '24h': return 24;
    case '7d': return 24 * 7;
    case '30d': return 24 * 30;
    default: return 24;
  }
};

// Enhanced fetch measurement history with comprehensive validation
// Note: Guests are allowed to read data without authentication (RLS policy handles access control)
export const fetchMeasurementHistory = async (
  deviceCode: string, 
  symbol: string, 
  timeFrame: TimeFrame
) => {
  console.log('🔍 fetchMeasurementHistory called:', { deviceCode, symbol, timeFrame });
  
  if (!deviceCode || !symbol) {
    const error = createApiError('fetchMeasurementHistory', 'Missing device code or measurement symbol');
    throw error;
  }

  // Try validation but allow guests to proceed (RLS policy will handle access control)
  const validation = await validateApiAccess(deviceCode);
  const isGuest = !validation.isValid && validation.error?.includes('Auth session missing');
  
  // Only throw error if it's NOT a guest (i.e., authenticated user with access denied)
  if (!validation.isValid && !isGuest) {
    throw createApiError('fetchMeasurementHistory', validation.error || 'Access validation failed', validation.userId, {
      device_code: deviceCode,
      rice_type_id: symbol
    });
  }
  
  if (isGuest) {
    console.log('👤 Guest user - proceeding with RLS-based access control');
  }

  // Defensively convert the symbol to the correct database column name.
  // This ensures that even if the calling code passes a URL-style symbol,
  // the database query will use the correct column name.
  const dbColumnSymbol = convertUrlSymbolToMeasurementSymbol(symbol);
  
  try {
    logSecurityEvent({
      function_name: 'fetchMeasurementHistory',
      user_id: validation.userId,
      device_code: deviceCode,
      rice_type_id: symbol,
      action: 'fetch_history_start',
      success: true,
      timestamp: new Date().toISOString()
    });
    
    // Dynamic select query using the corrected symbol
    const selectQuery = `id, ${dbColumnSymbol}, created_at, thai_datetime`;
    
    // Calculate cutoff date based on timeframe
    const hours = getTimeFrameHours(timeFrame);
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    
    const { data, error } = await supabase
      .from('rice_quality_analysis')
      .select(selectQuery)
      .eq('device_code', deviceCode)
      .gt('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error fetching history for ${symbol} (queried as ${dbColumnSymbol}) on device ${deviceCode}:`, error);
      logSecurityEvent({
        function_name: 'fetchMeasurementHistory',
        user_id: validation.userId,
        device_code: deviceCode,
        rice_type_id: symbol,
        action: 'fetch_history_failed',
        success: false,
        error_message: error.message,
        timestamp: new Date().toISOString()
      });
      throw new Error(error.message);
    }
    
    console.log('✅ Successfully fetched measurement history:', data?.length || 0, 'records');
    logSecurityEvent({
      function_name: 'fetchMeasurementHistory',
      user_id: validation.userId,
      device_code: deviceCode,
      rice_type_id: symbol,
      action: 'fetch_history_success',
      success: true,
      timestamp: new Date().toISOString()
    });
    
    return data;
  } catch (err: any) {
    console.error('Error in fetchMeasurementHistory:', err);
    logSecurityEvent({
      function_name: 'fetchMeasurementHistory',
      user_id: validation.userId,
      device_code: deviceCode,
      rice_type_id: symbol,
      action: 'fetch_history_exception',
      success: false,
      error_message: err.message,
      timestamp: new Date().toISOString()
    });
    return [];
  }
};

// Format Bangkok time (+7)
export const formatBangkokTime = (dateString?: string): { thaiDate: string; thaiTime: string } => {
  if (!dateString) return { thaiDate: "ไม่มีข้อมูล", thaiTime: "ไม่มีข้อมูล" };
  
  const date = new Date(dateString);
  const adjustedDate = new Date(date);
  adjustedDate.setHours(adjustedDate.getHours() + 7);
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  const thaiDate = new Intl.DateTimeFormat('th-TH', dateOptions).format(adjustedDate);
  const thaiTime = new Intl.DateTimeFormat('th-TH', timeOptions).format(adjustedDate);
  
  return { thaiDate, thaiTime };
};

// Calculate average value
export const calculateAverage = (historyData: any[], symbol: string): number => {
  if (!historyData || historyData.length === 0) return 0;
  
  const values = historyData
    .map((item: any) => (item as any)[symbol])
    .filter((value: any) => value !== null && value !== undefined);
    
  if (values.length === 0) return 0;
  
  const sum = values.reduce((acc: number, val: number) => acc + val, 0);
  return sum / values.length;
};

// Enhanced get latest measurement with validation
// Note: Guests are allowed to read data without authentication (RLS policy handles access control)
export const getLatestMeasurement = async (
  deviceCode: string,
  symbol: string
): Promise<{ value: number | null; timestamp: string | null }> => {
  console.log('🔍 getLatestMeasurement called:', { deviceCode, symbol });
  
  try {
    if (!deviceCode || !symbol) {
      logSecurityEvent({
        function_name: 'getLatestMeasurement',
        action: 'invalid_parameters',
        success: false,
        error_message: 'Missing deviceCode or symbol',
        timestamp: new Date().toISOString()
      });
      return { value: null, timestamp: null };
    }

    // Try validation but allow guests to proceed (RLS policy will handle access control)
    const validation = await validateApiAccess(deviceCode);
    const isGuest = !validation.isValid && validation.error?.includes('Auth session missing');
    
    // Only block if it's NOT a guest (i.e., authenticated user with access denied)
    if (!validation.isValid && !isGuest) {
      console.warn('🚫 Validation failed for getLatestMeasurement:', validation.error);
      logSecurityEvent({
        function_name: 'getLatestMeasurement',
        user_id: validation.userId,
        device_code: deviceCode,
        rice_type_id: symbol,
        action: 'access_denied',
        success: false,
        error_message: validation.error || 'Access validation failed',
        timestamp: new Date().toISOString()
      });
      
      // Don't throw error for this function, return null values instead
      return { value: null, timestamp: null };
    }
    
    if (isGuest) {
      console.log('👤 Guest user - proceeding with RLS-based access control');
    }

    // ดึงข้อมูลล่าสุดเพียง 1 รายการ
    // เลือกทุกคอลัมน์แล้วค่อยดึงค่าที่ต้องการในภายหลัง
    const { data, error } = await supabase
      .from('rice_quality_analysis')
      .select('*')
      .eq('device_code', deviceCode)
      .order('created_at', { ascending: false })
      .limit(1);
    
    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (error) {
      console.error(`Error fetching latest measurement for ${symbol} on device ${deviceCode}:`, error);
      logSecurityEvent({
        function_name: 'getLatestMeasurement',
        user_id: validation.userId,
        device_code: deviceCode,
        rice_type_id: symbol,
        action: 'fetch_failed',
        success: false,
        error_message: error.message,
        timestamp: new Date().toISOString()
      });
      return { value: null, timestamp: null };
    }
    
    // ตรวจสอบว่ามีข้อมูลในอาร์เรย์หรือไม่
    if (!data || data.length === 0) {
      // ไม่มีข้อมูล - ไม่ต้องแสดง error ในคอนโซล เพราะเป็นกรณีปกติที่อาจไม่มีข้อมูล
      return { value: null, timestamp: null };
    }
    
    // ใช้ข้อมูลรายการแรก (และเป็นรายการเดียวเนื่องจากใช้ limit(1))
    const latestData = data[0];
    
    console.log('✅ Successfully fetched latest measurement');
    logSecurityEvent({
      function_name: 'getLatestMeasurement',
      user_id: validation.userId,
      device_code: deviceCode,
      rice_type_id: symbol,
      action: 'fetch_success',
      success: true,
      timestamp: new Date().toISOString()
    });
    
    return {
      value: latestData[symbol],
      timestamp: latestData.created_at
    };
  } catch (err: any) {
    console.error('Error in getLatestMeasurement:', err);
    logSecurityEvent({
      function_name: 'getLatestMeasurement',
      action: 'exception',
      success: false,
      error_message: err.message,
      timestamp: new Date().toISOString()
    });
    return { value: null, timestamp: null };
  }
};

// Use unified notification setting interface
import { NotificationSetting } from "@/pages/notification-settings/types";

// Enhanced fetch notification settings with comprehensive validation
export const getNotificationSettings = async (deviceCode: string, symbol: string): Promise<NotificationSetting | null> => {
  console.log('🔍 getNotificationSettings called:', { deviceCode, symbol });
  
  try {
    // Phase 3: Comprehensive validation
    const validation = await validateApiAccess(deviceCode, symbol);
    if (!validation.isValid) {
      console.error('🚫 Validation failed for getNotificationSettings:', validation.error);
      logSecurityEvent({
        function_name: 'getNotificationSettings',
        user_id: validation.userId,
        device_code: deviceCode,
        rice_type_id: symbol,
        action: 'access_denied',
        success: false,
        error_message: validation.error || 'Access validation failed',
        timestamp: new Date().toISOString()
      });
      
      throw createApiError('getNotificationSettings', validation.error || 'Access validation failed', validation.userId, {
        device_code: deviceCode,
        rice_type_id: symbol
      });
    }

    logSecurityEvent({
      function_name: 'getNotificationSettings',
      user_id: validation.userId,
      device_code: deviceCode,
      rice_type_id: symbol,
      action: 'fetch_settings_start',
      success: true,
      timestamp: new Date().toISOString()
    });

    // Note: RLS policies จะกรองให้เห็นเฉพาะการตั้งค่าของ user ปัจจุบันอยู่แล้ว
    // แต่เราเพิ่ม explicit user_id filter เพื่อความปลอดภัยเพิ่มเติม
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('device_code', deviceCode)
      .eq('rice_type_id', symbol)
      .eq('user_id', validation.userId) // ⭐ CRITICAL: Explicit user_id filter
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching notification settings:', error);
      logSecurityEvent({
        function_name: 'getNotificationSettings',
        user_id: validation.userId,
        device_code: deviceCode,
        rice_type_id: symbol,
        action: 'fetch_settings_failed',
        success: false,
        error_message: error.message,
        timestamp: new Date().toISOString()
      });
      
      throw createApiError('getNotificationSettings', 'Failed to fetch notification settings: ' + error.message, validation.userId, {
        device_code: deviceCode,
        rice_type_id: symbol
      });
    }
    
    // Additional validation: verify returned data belongs to current user
    if (settings && settings.user_id !== validation.userId) {
      console.error('🚨 SECURITY VIOLATION: Retrieved settings belong to different user:', {
        retrievedUserId: settings.user_id,
        requestingUserId: validation.userId
      });
      
      logSecurityEvent({
        function_name: 'getNotificationSettings',
        user_id: validation.userId,
        device_code: deviceCode,
        rice_type_id: symbol,
        action: 'cross_user_data_detected',
        success: false,
        error_message: `Settings belong to user ${settings.user_id}, not ${validation.userId}`,
        timestamp: new Date().toISOString()
      });
      
      throw createApiError('getNotificationSettings', 'Security violation: Settings belong to another user', validation.userId, {
        device_code: deviceCode,
        rice_type_id: symbol,
        retrieved_user_id: settings.user_id
      });
    }
    
    console.log('✅ Successfully fetched notification settings');
    logSecurityEvent({
      function_name: 'getNotificationSettings',
      user_id: validation.userId,
      device_code: deviceCode,
      rice_type_id: symbol,
      action: 'fetch_settings_success',
      success: true,
      timestamp: new Date().toISOString()
    });
    
    return settings;
  } catch (err: any) {
    console.error('Exception in getNotificationSettings:', err);
    
    // If it's already our custom error, re-throw it
    if (err.message.includes('Access validation failed') || err.message.includes('Security violation')) {
      throw err;
    }
    
    // Otherwise, log and wrap the error
    logSecurityEvent({
      function_name: 'getNotificationSettings',
      action: 'exception',
      success: false,
      error_message: err.message,
      timestamp: new Date().toISOString()
    });
    
    throw createApiError('getNotificationSettings', 'Unexpected error: ' + err.message, undefined, {
      device_code: deviceCode,
      rice_type_id: symbol
    });
  }
};

// Enhanced save notification settings with comprehensive validation
export const saveNotificationSettings = async (settings: {
  deviceCode: string;
  symbol: string;
  name: string;
  enabled: boolean;
  minEnabled: boolean;
  maxEnabled: boolean;
  minThreshold: number;
  maxThreshold: number;
}): Promise<void> => {
  const { deviceCode, symbol, name, enabled, minEnabled, maxEnabled, minThreshold, maxThreshold } = settings;
  
  console.log('🔍 saveNotificationSettings called:', { deviceCode, symbol, name });
  
  try {
    // Phase 3: Comprehensive validation 
    const validation = await validateApiAccess(deviceCode, symbol);
    if (!validation.isValid || !validation.userId) {
      console.error('🚫 Validation failed for saveNotificationSettings:', validation.error);
      logSecurityEvent({
        function_name: 'saveNotificationSettings',
        user_id: validation.userId,
        device_code: deviceCode,
        rice_type_id: symbol,
        action: 'access_denied',
        success: false,
        error_message: validation.error || 'Access validation failed',
        timestamp: new Date().toISOString()
      });
      
      throw createApiError('saveNotificationSettings', validation.error || 'Access validation failed', validation.userId, {
        device_code: deviceCode,
        rice_type_id: symbol
      });
    }

    const userId = validation.userId;

    logSecurityEvent({
      function_name: 'saveNotificationSettings',
      user_id: userId,
      device_code: deviceCode,
      rice_type_id: symbol,
      action: 'save_settings_start',
      success: true,
      timestamp: new Date().toISOString()
    });
    
    // Use UPSERT to avoid duplicate key conflicts and race conditions
    console.log('💾 Upserting notification settings for user:', userId);
    
    const { error } = await supabase
      .from('notification_settings')
      .upsert({
        device_code: deviceCode,
        rice_type_id: symbol,
        rice_type_name: name,
        enabled,
        min_enabled: minEnabled,
        max_enabled: maxEnabled,
        min_threshold: minThreshold,
        max_threshold: maxThreshold,
        user_id: userId, // ⭐ CRITICAL: Validated user_id
      }, {
        onConflict: 'user_id,device_code,rice_type_id', // ✅ แก้แล้ว: ใช้ unique constraint ที่ถูกต้อง
        ignoreDuplicates: false // Update on conflict
      });
    
    if (error) {
      logSecurityEvent({
        function_name: 'saveNotificationSettings',
        user_id: userId,
        device_code: deviceCode,
        rice_type_id: symbol,
        action: 'upsert_failed',
        success: false,
        error_message: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
    
    console.log('✅ Successfully saved notification settings');
    logSecurityEvent({
      function_name: 'saveNotificationSettings',
      user_id: userId,
      device_code: deviceCode,
      rice_type_id: symbol,
      action: 'upsert_success',
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error saving notification settings:', error);
    
    // If it's already our custom error, re-throw it
    if (error.message.includes('Access validation failed') || 
        error.message.includes('Security violation') ||
        error.message.includes('User must be authenticated')) {
      throw error;
    }
    
    // Log unexpected errors
    logSecurityEvent({
      function_name: 'saveNotificationSettings',
      action: 'save_exception',
      success: false,
      error_message: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw createApiError('saveNotificationSettings', 'Failed to save notification settings: ' + error.message, undefined, {
      device_code: deviceCode,
      rice_type_id: symbol
    });
  }
};
