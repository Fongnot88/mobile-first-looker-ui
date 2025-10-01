-- ปิด trigger auto-fill cur_material ชั่วคราว
DROP TRIGGER IF EXISTS trigger_auto_fill_cur_material ON rice_quality_analysis;

-- หมายเหตุ: Functions ยังคงอยู่ในระบบ สามารถเปิดใช้งานกลับมาได้โดยการสร้าง trigger ใหม่ด้วยคำสั่ง:
-- CREATE TRIGGER trigger_auto_fill_cur_material
--   BEFORE INSERT OR UPDATE ON rice_quality_analysis
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_fill_cur_material();