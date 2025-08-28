import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./components/AuthProvider";
import { CountdownProvider } from "./contexts/CountdownContext";
import { LanguageProvider } from "./contexts/LanguageContext";


import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

import { NotificationPermissionPopup } from '@/components/NotificationPermissionPopup';
import { GlobalNotificationManager } from '@/components/GlobalNotificationManager';



// Create QueryClient outside component to prevent recreation on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {

  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  
  // ฟังก์ชันสำหรับจัดการการยอมรับการแจ้งเตือน
  const handleAcceptNotification = async () => {
    setShowNotificationPopup(false);
    
    console.log('🔔 User clicked Accept - attempting to request permission...');
    
    // ขออนุญาตจากเบราว์เซอร์ (บังคับขอใหม่แม้ว่าจะถูก denied)
    if (typeof Notification !== 'undefined' && Notification.requestPermission) {
      try {
        console.log('🔔 Current permission before request:', Notification.permission);
        const browserPermission = await Notification.requestPermission();
        console.log('🔔 Browser permission result after request:', browserPermission);
        
        if (browserPermission === 'granted') {
          // แสดงข้อความสำเร็จ
          toast({
            title: "✅ สำเร็จ!",
            description: "คุณจะได้รับการแจ้งเตือนจาก RiceFlow แล้ว",
            variant: "default",
          });
          
          // ส่งการแจ้งเตือนทดสอบ
          setTimeout(() => {
            new Notification('🎉 ยินดีต้อนรับสู่ RiceFlow!', {
              body: 'คุณได้เปิดใช้งานการแจ้งเตือนแล้ว จะได้รับข้อมูลอัพเดททันที',
              icon: '/favicon.ico'
            });
          }, 2000);
        } else if (browserPermission === 'denied') {
          // ผู้ใช้ปฏิเสธ - เปิด browser settings โดยอัตโนมัติ
         
          
          // พยายามเปิด browser notification settings
          try {
            // สำหรับ Chrome/Edge
            if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')) {
              window.open('chrome://settings/content/notifications', '_blank');
            }
            // สำหรับ Firefox
            else if (navigator.userAgent.includes('Firefox')) {
              window.open('about:preferences#privacy', '_blank');
            }
            // สำหรับ Safari
            else if (navigator.userAgent.includes('Safari')) {
              // Safari ไม่สามารถเปิด settings โดยตรงได้
              alert('กรุณาไปที่ Safari > Preferences > Websites > Notifications');
            }
            else {
              // เบราว์เซอร์อื่นๆ
              window.open('chrome://settings/content/notifications', '_blank');
            }
            
            toast({
              title: "🚀 เปิด Settings ให้แล้ว!",
              description: "หา localhost:8080 แล้วเปลี่ยนเป็น 'Allow' - ระบบจะตรวจสอบอัตโนมัติ",
              variant: "default",
            });
            
            // เริ่มตรวจสอบ permission ทุก 2 วินาที
            startPermissionMonitoring();
            
          } catch (error) {
            console.log('❌ Failed to open browser settings:', error);
            toast({
              title: "🛠️ ตั้งค่าแบบ Manual",
              description: "คลิกไอคอน 🔔 ข้าง URL แล้วเลือก 'Reset permission'",
              variant: "default",
            });
          }
        } else {
          // default หรือสถานะอื่นๆ
          toast({
            title: "ℹ️ ลองอีกครั้ง",
            description: "กรุณาลองคลิกปุ่ม 'อนุญาต' อีกครั้ง",
            variant: "default",
          });
        }
      } catch (error) {
        console.log('❌ Browser permission request failed:', error);
        toast({
          title: "❌ เกิดข้อผิดพลาด",
          description: "ไม่สามารถขออนุญาตได้ กรุณาตั้งค่าในเบราว์เซอร์",
          variant: "destructive",
        });
      }
    } else {
      // เบราว์เซอร์ไม่สนับสนุน Notification API
      toast({
        title: "⚠️ เบราว์เซอร์ไม่สนับสนุน",
        description: "เบราว์เซอร์นี้ไม่สามารถใช้การแจ้งเตือนได้",
        variant: "destructive",
      });
    }
  };
  
  // ฟังก์ชันสำหรับจัดการการปฏิเสธการแจ้งเตือน
  const handleDeclineNotification = () => {
    setShowNotificationPopup(false);
    toast({
      title: "💭 ไม่เป็นไร",
      description: "คุณสามารถเปิดการแจ้งเตือนได้ภายหลัง จากเมนูหรือการตั้งค่า",
      variant: "default",
    });
  };
  
  // ฟังก์ชันตรวจสอบ permission แบบ real-time
  const startPermissionMonitoring = () => {
    console.log('🔍 Starting permission monitoring...');
    
    // ประกาศตัวแปรก่อนใช้งาน
        let monitoringInterval: ReturnType<typeof setInterval>;
    
    const checkPermission = async () => {
      if (typeof Notification !== 'undefined') {
        const currentPermission = Notification.permission;
        console.log('🔍 Current permission status:', currentPermission);
        
        if (currentPermission === 'granted') {
          console.log('✅ Permission granted! FCM will handle notifications.');
          
          // แสดงข้อความสำเร็จ
          toast({
            title: "✅ สำเร็จ!",
            description: "คุณจะได้รับการแจ้งเตือนจาก RiceFlow แล้ว!",
            variant: "default",
          });
          
          // ส่งการแจ้งเตือนทดสอบ
          setTimeout(() => {
            new Notification('🎉 ยินดีต้อนรับสู่ RiceFlow!', {
              body: 'คุณได้เปิดใช้งานการแจ้งเตือนแล้ว จะได้รับข้อมูลอัพเดททันที',
              icon: '/favicon.ico'
            });
          }, 1000);
          
          // หยุดการตรวจสอบเมื่อสำเร็จแล้ว
          if (monitoringInterval) {
            clearInterval(monitoringInterval);
          }
        }
      }
    };
    
    // ตรวจสอบทุก 2 วินาที
    monitoringInterval = setInterval(checkPermission, 2000);
    
    // หยุดการตรวจสอบหลังจาก 30 วินาที
    setTimeout(() => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
      console.log('🔍 Permission monitoring stopped after 30 seconds');
    }, 30000);
    
    // Return cleanup function
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  };
  
  // Initialize notification permission popup - DISABLED to prevent annoying popup
  useEffect(() => {
    const checkNotificationPermission = () => {
      const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
      console.log('🔐 Browser notification permission:', permission);
      
      // Disabled popup to prevent annoying modal
      // if (permission === 'default' || permission === 'denied') {
      //   setTimeout(() => {
      //     setShowNotificationPopup(true);
      //   }, 3000);
      // }
    };

    const timer = setTimeout(checkNotificationPermission, 1000);
    return () => clearTimeout(timer);
  }, []);







  const handleGlobalCountdownComplete = () => {
    const currentTime = new Date().toISOString();
    console.log("🕐 Global countdown complete at:", currentTime);
    console.log("🔄 Triggering data refresh across all components");

    // Log query client state before invalidation
    const queryCache = queryClient.getQueryCache();
    const allQueries = queryCache.getAll();
    console.log("📊 Query cache state before refresh:", {
      totalQueries: allQueries.length,
      notificationQueries: allQueries.filter(
        (q) => q.queryKey[0] === "notifications"
      ).length,
      deviceQueries: allQueries.filter((q) => q.queryKey[0] === "devices")
        .length,
    });

    // Invalidate queries that should refresh on the global timer
    const invalidatedQueries = ["notifications", "devices", "measurements"];
    invalidatedQueries.forEach((queryKey) => {
      const result = queryClient.invalidateQueries({ queryKey: [queryKey] });
      console.log(`🔄 Invalidated ${queryKey} queries:`, result);
    });

    console.log("✅ Global countdown refresh completed");
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <LanguageProvider>
          <CountdownProvider>
            <AuthProvider>
              <QueryClientProvider client={queryClient}>
                {/* Temporarily disable GlobalNotificationManager to stop sounds */}
                {/* <GlobalNotificationManager /> */}
                <RouterProvider router={router} />
                <Toaster />
                {/* Disabled notification popup to prevent annoying modal */}
                {false && showNotificationPopup && (
                  <NotificationPermissionPopup
                    isOpen={showNotificationPopup}
                    onAccept={handleAcceptNotification}
                    onDecline={handleDeclineNotification}
                  />
                )}

              </QueryClientProvider>
            </AuthProvider>
          </CountdownProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
