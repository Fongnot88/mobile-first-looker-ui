import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, MessageCircle, ExternalLink, LifeBuoy } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppLayout } from "@/components/layouts/app-layout";

const SupportContent = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
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
          <LifeBuoy className="h-6 w-6 text-emerald-500" />
          ศูนย์ช่วยเหลือและสนับสนุน
        </h1>
      </div>
      
      <div className="relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/20 border-b">
              <CardTitle className="text-xl text-emerald-800 dark:text-emerald-400">ช่องทางการติดต่อ</CardTitle>
              <CardDescription>
                หากพบปัญหาในการใช้งานแอปพลิเคชันหรืออุปกรณ์ขัดข้อง สามารถติดต่อเราได้ตามช่องทางด้านล่างนี้
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              {/* Phone */}
              <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full text-blue-600 dark:text-blue-400 shrink-0 mt-1">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">โทรศัพท์</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">ติดต่อสอบถามข้อมูลต่างๆ ได้ตลอดเวลา</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    <a href="tel:0808300599" className="hover:underline">080-830-0599</a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full text-amber-600 dark:text-amber-400 shrink-0 mt-1">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">อีเมล (Email)</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">ส่งรายละเอียดปัญหา หน้าจอที่เกิดข้อผิดพลาด หรือข้อเสนอแนะ</p>
                  <p className="font-medium text-amber-600 dark:text-amber-400">
                    <a href="mailto:info@c2tech.app" className="hover:underline">info@c2tech.app</a>
                  </p>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full text-emerald-600 dark:text-emerald-400 shrink-0 mt-1">
                  <ExternalLink className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">เว็บไซต์ (Website)</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">เยี่ยมชมเว็บไซต์หลักของเราสำหรับข้อมูลเพิ่มเติม</p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    <a href="https://c2tech.app" target="_blank" rel="noopener noreferrer" className="hover:underline">c2tech.app</a>
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>คำถามที่พบบ่อย (FAQ)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b dark:border-gray-800 pb-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Q: ลืมรหัสผ่านต้องทำอย่างไร?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">A: สามารถติดต่อผู้ดูแลระบบ (Admin) เพื่อขอทำการรีเซ็ตรหัสผ่านใหม่ผ่านทางอีเมล หรือโทรศัพท์</p>
              </div>
              <div className="border-b dark:border-gray-800 pb-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Q: ไม่เห็นข้อมูลเครื่องวัดความชื้นในหน้าแดชบอร์ด?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">A: กรุณาตรวจสอบว่าคุณล็อกอินด้วยบัญชีที่ถูกต้อง หรือติดต่อแอดมินเพื่อขอสิทธิ์เข้าถึงอุปกรณ์เพิ่มเติม</p>
              </div>
              <div className="pt-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Q: อุปกรณ์แจ้งสถานะ Offline?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">A: ให้ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและปลั๊กไฟของอุปกรณ์ หากยังไม่สามารถใช้งานได้ กรุณาติดต่อช่างเทคนิค</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Main Support component
const Support = () => {
  const isMobile = useIsMobile();
  
  // To avoid having to check if user is logged in, and duplicating the AppLayout wrapper,
  // we'll check if we're in the app context by looking at the URL. Since this route can be accessed
  // from both authenticated and non-authenticated states due to allowGuest=true, we'll try to use the AppLayout
  // but catch any issues by rendering the raw content. However, since we defined the route under MainLayout,
  // it might already be wrapped in something. Let's provide a clean dedicated view.
  
  return (
    <div className={`min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/50 to-gray-50/50 dark:from-gray-900/50 dark:to-gray-950/50 ${isMobile ? 'pb-20' : ''}`}>
      <SupportContent />
    </div>
  );
};

export default Support;
