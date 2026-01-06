
-- ลบข้อมูลทั้งหมดของอุปกรณ์ 6400000401432 (COTECNA : Lab)

-- 1. ลบข้อมูลวิเคราะห์คุณภาพข้าว
DELETE FROM rice_quality_analysis WHERE device_code = '6400000401432';

-- 2. ลบสิทธิ์การเข้าถึงผู้ใช้
DELETE FROM user_device_access WHERE device_code = '6400000401432';

-- 3. ลบการตั้งค่าแจ้งเตือน
DELETE FROM notification_settings WHERE device_code = '6400000401432';

-- 4. ลบการแจ้งเตือน
DELETE FROM notifications WHERE device_code = '6400000401432';

-- 5. ลบประวัติการตั้งค่าแจ้งเตือน
DELETE FROM notification_settings_history WHERE device_code = '6400000401432';

-- 6. ลบการเข้าถึงสำหรับ guest
DELETE FROM guest_device_access WHERE device_code = '6400000401432';

-- 7. ลบ cache สำหรับ guest devices
DELETE FROM guest_devices_cache WHERE device_code = '6400000401432';

-- 8. ลบการตั้งค่าอุปกรณ์
DELETE FROM device_settings WHERE device_code = '6400000401432';

-- 9. ลบการตั้งค่าการแสดงผลสำหรับ admin
DELETE FROM admin_device_visibility WHERE device_code = '6400000401432';

-- 10. ลบ user chart preferences
DELETE FROM user_chart_preferences WHERE device_code = '6400000401432';

-- 11. ลบ user device preferences  
DELETE FROM user_device_preferences WHERE device_code = '6400000401432';
