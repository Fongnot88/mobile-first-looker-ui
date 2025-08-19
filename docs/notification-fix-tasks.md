# 🔧 แผนแก้ไขปัญหาการแจ้งเตือนข้าม User

## 📋 ภาพรวมโครงการ
แก้ไขปัญหาการแจ้งเตือนที่ user หนึ่งตั้งค่าแล้วไปดังกับ user อื่นในอุปกรณ์เดียวกัน

## 🎯 เป้าหมาย
- การแจ้งเตือนแยกตาม user อย่างสมบูรณ์
- เสียงแจ้งเตือนดังเฉพาะกับ user ที่ตั้งค่า
- ไม่มีการแจ้งเตือนข้าม user

---

## 📝 Task Lists

### 🔥 **PHASE 1: Database Migration & Settings Fix**

#### **Task 1.1: เพิ่ม user_id ใน notification_settings**
- [ ] สร้าง migration เพิ่มคอลัมน์ `user_id` 
- [ ] อัพเดท RLS policies สำหรับ notification_settings
- [ ] ทดสอบการเข้าถึงข้อมูลตาม user

**🎯 Acceptance Criteria:**
- ✅ คอลัมน์ `user_id` ถูกเพิ่มใน notification_settings
- ✅ RLS policy กรองข้อมูลตาม user_id ได้ถูกต้อง
- ✅ User แต่ละคนเห็นเฉพาะการตั้งค่าของตัวเอง

**🧪 Testing Method:**
```sql
-- ทดสอบ RLS Policy
SELECT * FROM notification_settings; -- ควรเห็นเฉพาะของตัวเอง
```

#### **Task 1.2: แก้ไข saveNotificationSettings API**
- [ ] เพิ่ม user_id ในการบันทึกการตั้งค่า
- [ ] อัพเดท type definitions
- [ ] ทดสอบการบันทึกข้อมูล

**🎯 Acceptance Criteria:**
- ✅ การบันทึกการตั้งค่าจะมี user_id ที่ถูกต้อง
- ✅ User ไม่สามารถแก้ไขการตั้งค่าของ user อื่นได้
- ✅ API response ถูกต้อง

**🧪 Testing Method:**
- ทดสอบบันทึกการตั้งค่าด้วย user แต่ละคน
- ตรวจสอบ user_id ในฐานข้อมูล

#### **Task 1.3: แก้ไข getNotificationSettings API**  
- [ ] เพิ่มการกรองตาม user_id
- [ ] อัพเดท response type
- [ ] ทดสอบการดึงข้อมูล

**🎯 Acceptance Criteria:**
- ✅ API ส่งคืนเฉพาะการตั้งค่าของ user ที่เรียก
- ✅ ไม่มีข้อมูลรั่วไหลระหว่าง user
- ✅ Performance ยังคงดีอยู่

**🧪 Testing Method:**
- เรียก API ด้วย user ID ต่างๆ
- ตรวจสอบว่าข้อมูลที่ได้แยกกันอย่างชัดเจน

---

### 🔥 **PHASE 2: Edge Function Update**

#### **Task 2.1: แก้ไข check_notifications Edge Function**
- [ ] เพิ่มการกรอง notification_settings ตาม user_id
- [ ] แก้ไขการสร้างการแจ้งเตือนให้มี user_id
- [ ] อัพเดท database function check_notification_thresholds

**🎯 Acceptance Criteria:**
- ✅ การแจ้งเตือนถูกสร้างเฉพาะสำหรับ user ที่ตั้งค่า
- ✅ ไม่มีการแจ้งเตือนข้าม user
- ✅ Function ทำงานโดยไม่มี error

**🧪 Testing Method:**
- ตั้งค่าแจ้งเตือนด้วย user A
- ทำให้เกิดเงื่อนไขแจ้งเตือน 
- ตรวจสอบว่า user B ไม่ได้รับการแจ้งเตือน

#### **Task 2.2: แก้ไข notifications table RLS**
- [ ] อัพเดท RLS policies สำหรับ notifications table
- [ ] เพิ่ม user_id ใน notifications หากยังไม่มี
- [ ] ทดสอบการเข้าถึงข้อมูล

**🎯 Acceptance Criteria:**
- ✅ User เห็นเฉพาะการแจ้งเตือนของตัวเอง
- ✅ RLS policy ทำงานถูกต้อง
- ✅ Performance ไม่ได้รับผลกระทบ

**🧪 Testing Method:**
```sql
-- ทดสอบดูการแจ้งเตือน
SELECT * FROM notifications WHERE user_id = auth.uid();
```

---

### 🔥 **PHASE 3: Frontend Update**

#### **Task 3.1: แก้ไข useNotificationSettings Hook**
- [ ] เพิ่ม user filtering ใน hook
- [ ] อัพเดท API calls ให้ส่ง user_id
- [ ] ทดสอบการทำงานของ hook

**🎯 Acceptance Criteria:**
- ✅ Hook ดึงเฉพาะการตั้งค่าของ user ปัจจุบัน
- ✅ การบันทึกการตั้งค่าทำงานถูกต้อง
- ✅ ไม่มี race condition

**🧪 Testing Method:**
- ล็อกอินด้วย user ต่างๆ
- ตรวจสอบการตั้งค่าที่แสดงผล
- ทดสอบการบันทึกการตั้งค่า

#### **Task 3.2: แก้ไข MeasurementItem Component**
- [ ] แก้ไขการตรวจสอบการตั้งค่าให้เฉพาะ user ปัจจุบัน
- [ ] อัพเดท sound alert logic
- [ ] ทดสอบการแสดงผลและเสียง

**🎯 Acceptance Criteria:**
- ✅ เสียงแจ้งเตือนดังเฉพาะกับ user ที่ตั้งค่า
- ✅ Visual indicator แสดงถูกต้อง
- ✅ Performance ดี

**🧪 Testing Method:**
- ตั้งค่าแจ้งเตือนด้วย user A
- ล็อกอินด้วย user B ในอุปกรณ์เดียวกัน
- ทำให้เกิดเงื่อนไขแจ้งเตือน
- ตรวจสอบว่า user B ไม่ได้ยินเสียง

#### **Task 3.3: แก้ไข Notification Components**
- [ ] อัพเดท NotificationList ให้แสดงเฉพาะของ user
- [ ] แก้ไข NotificationHistory 
- [ ] อัพเดท notification-related hooks

**🎯 Acceptance Criteria:**
- ✅ รายการแจ้งเตือนแสดงเฉพาะของ user ปัจจุบัน
- ✅ History แยกตาม user
- ✅ Real-time updates ทำงานถูกต้อง

**🧪 Testing Method:**
- เปรียบเทียบรายการแจ้งเตือนระหว่าง user
- ทดสอบ real-time notification updates

---

### 🔥 **PHASE 4: Data Cleanup & Final Testing**

#### **Task 4.1: ทำความสะอาดข้อมูลเก่า**
- [ ] หา notification_settings ที่มี user_id = NULL
- [ ] อัพเดทหรือลบข้อมูลที่ไม่สมบูรณ์
- [ ] เพิ่ม constraints ป้องกันปัญหาในอนาคต

**🎯 Acceptance Criteria:**
- ✅ ไม่มี notification_settings ที่ไม่มี user_id
- ✅ Database constraints ทำงาน
- ✅ ข้อมูลสะอาดและสมบูรณ์

**🧪 Testing Method:**
```sql
-- ตรวจสอบข้อมูลที่ไม่สมบูรณ์
SELECT COUNT(*) FROM notification_settings WHERE user_id IS NULL;
-- ควรได้ 0
```

#### **Task 4.2: Integration Testing**
- [ ] ทดสอบ end-to-end workflow
- [ ] ทดสอบกับหลาย user พร้อมกัน
- [ ] ทดสอบ edge cases

**🎯 Acceptance Criteria:**
- ✅ ระบบทำงานถูกต้องใน multi-user environment
- ✅ ไม่มีการแจ้งเตือนข้าม user
- ✅ Performance ยอมรับได้

**🧪 Testing Method:**
- สร้าง test scenario ครอบคลุมทุกกรณี
- ทดสอบ load testing
- ทดสอบกับ real users

#### **Task 4.3: Documentation & Monitoring**
- [ ] อัพเดท API documentation
- [ ] เพิ่ม monitoring สำหรับการแจ้งเตือน
- [ ] สร้าง troubleshooting guide

**🎯 Acceptance Criteria:**
- ✅ Documentation ครบถ้วน
- ✅ Monitoring พร้อมใช้งาน
- ✅ Team เข้าใจการเปลี่ยนแปลง

**🧪 Testing Method:**
- Review documentation กับ team
- ทดสอบ monitoring alerts
- Validate troubleshooting procedures

---

## 🔍 **Overall Quality Assurance**

### **Critical Test Cases:**
1. **Cross-User Notification Test:**
   - User A ตั้งค่าแจ้งเตือนสำหรับ Device X
   - User B ล็อกอินในอุปกรณ์เดียวกัน
   - เมื่อเกิดเงื่อนไขแจ้งเตือน User B ต้องไม่ได้รับการแจ้งเตือน

2. **Sound Alert Test:**
   - User A ตั้งค่าเสียงแจ้งเตือน
   - User B ใช้งานในอุปกรณ์เดียวกัน
   - เมื่อเกิดเงื่อนไข User B ต้องไม่ได้ยินเสียง

3. **Performance Test:**
   - ทดสอบกับ 50+ users พร้อมกัน
   - Response time ต้องไม่เกิน 2 วินาที
   - Memory usage ต้องไม่เพิ่มขึ้นอย่างผิดปกติ

### **Success Metrics:**
- ✅ 0% cross-user notifications
- ✅ 100% user-specific alerts
- ✅ <2s response time
- ✅ 0 critical bugs in production

---

## 📅 **Timeline Estimate**
- **Phase 1:** 2-3 days
- **Phase 2:** 1-2 days  
- **Phase 3:** 2-3 days
- **Phase 4:** 1-2 days
- **Total:** 6-10 days

## 🚨 **Risk Mitigation**
- สำรองข้อมูลก่อนการ migration
- ทดสอบใน staging environment ก่อน
- เตรียม rollback plan
- Gradual deployment แทน big bang
