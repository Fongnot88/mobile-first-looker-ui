import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const PrivacyPolicyContent = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
          นโยบายความเป็นส่วนตัว (Privacy Policy)
        </h1>
      </div>
      
      <div className="relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
        
        <Card className="shadow-sm border-gray-100 dark:border-gray-800">
          <CardContent className="pt-8 pb-10 px-6 sm:px-10 prose prose-emerald dark:prose-invert max-w-none">
            
            <p className="text-sm text-muted-foreground mb-8">
              อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">1. ข้อมูลที่เราเก็บรวบรวม</h3>
                <p>
                  เรามีการเก็บรวบรวมข้อมูลส่วนบุคคลของท่านเมื่อท่านลงทะเบียนเข้าใช้งานแอปพลิเคชัน ข้อมูลเหล่านี้อาจรวมถึงแต่ไม่จำกัดเพียง: 
                  ชื่อ-นามสกุล, ที่อยู่อีเมล, เบอร์โทรศัพท์, และข้อมูลที่เกี่ยวข้องกับการใช้งานอุปกรณ์เซ็นเซอร์ต่างๆ ในระบบของเรา
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">2. วัตถุประสงค์ในการใช้ข้อมูล</h3>
                <p>
                  ข้อมูลที่เรารวบรวมจะถูกนำไปใช้เพื่อวัตถุประสงค์ดังต่อไปนี้:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>เพื่อให้บริการแอปพลิเคชันและฟังก์ชันต่างๆ แก่ท่านได้อย่างมีประสิทธิภาพ</li>
                  <li>เพื่อตรวจสอบสิทธิ์และการยืนยันตัวตนในการเข้าใช้งานระบบ</li>
                  <li>เพื่อการวิเคราะห์และปรับปรุงคุณภาพการให้บริการของเรา</li>
                  <li>เพื่อติดต่อสื่อสาร แจ้งเตือนสถานะของอุปกรณ์ หรือส่งข้อมูลที่จำเป็นให้แก่ท่าน</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">3. การเปิดเผยและการแบ่งปันข้อมูล</h3>
                <p>
                  เราไม่มีนโยบายการขายหรือเปิดเผยข้อมูลส่วนตัวของท่านให้กับบุคคลที่สาม ยกเว้นในกรณีที่:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>ได้รับความยินยอมโดยตรงจากท่าน</li>
                  <li>เป็นการปฏิบัติตามคำสั่งศาล หรือเป็นไปตามที่กฎหมายกำหนด</li>
                  <li>เป็นความจำเป็นในการปกป้องสิทธิ์และทรัพย์สินของเรา หรือความปลอดภัยของผู้ใช้งานรายอื่น</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">4. ความปลอดภัยของข้อมูล</h3>
                <p>
                  เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมในการจัดเก็บและปกป้องข้อมูลของท่านจากการเข้าถึง การเปลี่ยนแปลง หรือการลบแก้ไขโดยไม่ได้รับอนุญาต 
                  แม้ว่าเราจะพยายามอย่างเต็มที่ แต่ระบบผ่านเครือข่ายอินเทอร์เน็ตอาจไม่สามารถรับประกันความปลอดภัยได้ 100% ตลอดเวลา
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">5. สิทธิของท่านในฐานะเจ้าของข้อมูล</h3>
                <p>
                  ท่านมีสิทธิ์ขอดู ขอแก้ไข หรือขอลบข้อมูลส่วนบุคคลที่อยู่ในระบบของเราได้เสมอ หากท่านต้องการใช้สิทธิเหล่านี้ ท่านสามารถติดต่อทีมงานของเราได้ผ่านหน้า <a href="/support" onClick={(e) => { e.preventDefault(); navigate('/support'); }} className="text-emerald-600 dark:text-emerald-400 hover:underline">ศูนย์ช่วยเหลือและสนับสนุน</a>
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">6. การเปลี่ยนแปลงนโยบาย</h3>
                <p>
                  เราอาจประเมินและปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นระยะ การเปลี่ยนแปลงใดๆ จะถือว่ามีผลบังคับใช้เมื่อเราได้ประกาศบนแอปพลิเคชันนี้ 
                  เราขอแนะนำให้ท่านทบทวนหน้านี้อย่างสม่ำเสมอ
                </p>
              </section>
            </div>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Privacy Policy component wrapper
const PrivacyPolicy = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/50 to-gray-50/50 dark:from-gray-900/50 dark:to-gray-950/50 ${isMobile ? 'pb-20' : ''}`}>
      <PrivacyPolicyContent />
    </div>
  );
};

export default PrivacyPolicy;
