
import React, { ReactNode, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { LAYOUT_STYLES, cn } from '@/lib/layout-styles';
import { HeaderSidebar } from '@/components/header/HeaderSidebar';
import { TopHeader } from './top-header'; // Import the new TopHeader
import { MeyerAndTimeBar } from './meyer-and-time-bar'; // Import MeyerAndTimeBar
import { FooterNav } from '@/components/FooterNav';

/**
 * AppLayout เป็น component หลักสำหรับจัดการโครงสร้างของแอปพลิเคชัน
 * ประกอบด้วย 3 ส่วนหลัก: Sidebar, Header และ Content
 */
interface AppLayoutProps {
  /** เนื้อหาหลักของหน้า */
  children: ReactNode;
  
  /** กำหนดว่าควรแสดง FooterNav หรือไม่ (เฉพาะบน mobile) */
  showFooterNav?: boolean;
  
  /** กำหนดให้ content มีความกว้างมากขึ้น (max-w-7xl แทน max-w-5xl) */
  wideContent?: boolean;
  
  /** กำหนดพื้นหลังของ container */
  className?: string;
  
  /** padding-bottom เพิ่มเติมสำหรับ content (จะถูกรวมกับค่าเริ่มต้น) */
  contentPaddingBottom?: string;
}

export function AppLayout({
  children,
  showFooterNav = true,
  wideContent = false,
  className,
  contentPaddingBottom
}: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const updateSidebarState = (event?: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent?.detail) {
        setIsCollapsed(customEvent.detail.isCollapsed);
      } else {
        const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
        setIsCollapsed(savedCollapsedState === 'true');
      }
    };
    updateSidebarState();
    window.addEventListener('storage', () => updateSidebarState());
    window.addEventListener('sidebarStateChanged', updateSidebarState);
    return () => {
      window.removeEventListener('storage', () => updateSidebarState());
      window.removeEventListener('sidebarStateChanged', updateSidebarState);
    };
  }, []);

  // คำนวณ padding-bottom อัตโนมัติ
  const getMainPaddingBottom = () => {
    const basePadding = 'p-5'; // 20px padding รอบๆ
    
    if (isMobile && showFooterNav) {
      // เพิ่ม padding-bottom 80px (20 พื้นฐาน + 60 สำหรับ footer) บน mobile เมื่อมี footer
      return cn(basePadding, 'pb-20', contentPaddingBottom);
    } else {
      // ใช้ padding ปกติบน desktop หรือเมื่อไม่มี footer
      return cn(basePadding, contentPaddingBottom);
    }
  };

  return (
    <>
      {/* Render TopHeader */}
      <TopHeader 
        isMobile={isMobile} 
        isCollapsed={isCollapsed} 
        setSidebarOpen={setSidebarOpen} 
        // pageTitle={...} // We can make pageTitle dynamic later
      />
      
      {/* Sidebar - now renders for both mobile and desktop */}
      <HeaderSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isMobile ? "ml-0" : (isCollapsed ? "md:ml-20" : "md:ml-64"),
        getMainPaddingBottom(),
        className
      )}>
        <MeyerAndTimeBar />
        {children}
      </main>
      
      {/* Footer Navigation - Mobile only */}
      {isMobile && showFooterNav && <FooterNav />}
    </>
  );
}
