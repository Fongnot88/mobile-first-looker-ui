
import React, { ReactNode, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { LAYOUT_STYLES, cn } from '@/lib/layout-styles';
import { HeaderSidebar } from '@/components/header/HeaderSidebar';
import { TopHeader } from './top-header';
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
  
  /** padding-bottom เพิ่มเติมสำหรับ content (จะถูกรวมกับค่าเริ่มต้นสำหรับ footer) */
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

  // กำหนด padding-bottom ที่เหมาะสมสำหรับ footer nav
  const getFooterSpacing = () => {
    if (!showFooterNav) return 'pb-4'; // ไม่มี footer nav ให้ padding เล็กน้อย
    if (isMobile) return 'pb-20'; // mobile มี footer nav ให้ padding มากพอ (80px)
    return 'pb-4'; // desktop ไม่มี footer nav ให้ padding เล็กน้อย
  };

  const footerSpacing = getFooterSpacing();
  const finalPaddingBottom = contentPaddingBottom ? `${footerSpacing} ${contentPaddingBottom}` : footerSpacing;

  return (
    <>
      {/* Render TopHeader */}
      <TopHeader 
        isMobile={isMobile} 
        isCollapsed={isCollapsed} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      {/* Sidebar - now renders for both mobile and desktop */}
      <HeaderSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />
      
      {/* Main Content with automatic footer spacing */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out min-h-screen",
        isMobile ? "ml-0" : (isCollapsed ? "md:ml-20" : "md:ml-64"),
        "p-5",
        finalPaddingBottom, // ใช้ spacing ที่คำนวณแล้ว
        className
      )}>
        {children}
      </main>
      
      {/* Footer Navigation - Mobile only with consistent spacing */}
      {isMobile && showFooterNav && <FooterNav />}
    </>
  );
}
