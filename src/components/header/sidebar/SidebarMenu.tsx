
import { Home, Settings, AlertCircle, History, User, Users, FileText, Wheat, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useActivePath } from "./sidebar-utils";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { useTranslation } from "@/hooks/useTranslation";

interface SidebarMenuProps {
  isCollapsed: boolean;
  isMobile: boolean;
  userRoles: string[];
  user: any | null;
}

export const SidebarMenu = ({ isCollapsed, isMobile, userRoles, user }: SidebarMenuProps) => {
  const { isActive } = useActivePath();
  const { t } = useTranslation();
  
  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการเข้าถึงหน้าจัดการผู้ใช้งานหรือไม่
  const canAccessUserManagement = userRoles.includes('admin') || userRoles.includes('superadmin');
  const isSuperAdmin = userRoles.includes('superadmin');
  const isGuest = !user; // Check if user is a guest
  
  return (
    <ScrollArea className={cn(
      "flex-1",
      isCollapsed ? "-mr-2 pr-2" : "-mr-4 pr-4" // ปรับ margin และ padding ตามขนาดของ sidebar
    )}>
      <nav className="flex flex-col space-y-1 mt-4">
        <SidebarMenuItem 
          path="/assistant"
          icon={() => <img src="/lovable-uploads/14fdbf4f-5cb3-4905-b737-a0478e16d12b.png" alt="AI Assistant" className="h-5 w-5 rounded-full" />}
          label={t('assistant', 'aiAssistantMenuItem')}
          isActive={isActive("/assistant")}
          isCollapsed={isCollapsed}
        />
        
        <SidebarMenuItem 
          path="/" 
          icon={Home}
          label={t('mainMenu', 'home')}
          isActive={isActive("/")}
          isCollapsed={isCollapsed}
        />
        
        <SidebarMenuItem 
          path="/equipment" 
          icon={Settings}
          label={t('mainMenu', 'device')}
          isActive={isActive("/equipment")}
          isCollapsed={isCollapsed}
        />
        
        {/* Show "รู้จัก Riceflow" only for guests */}
        {isGuest && (
          <SidebarMenuItem 
            path="/about-riceflow" 
            icon={Wheat}
            label={t('mainMenu', 'aboutRiceflow')}
            isActive={isActive("/about-riceflow")}
            isCollapsed={isCollapsed}
          />
        )}
        
        {/* Guest users can't access notification history */}
        {user && (
          <SidebarMenuItem 
            path="/notification-history" 
            icon={History}
            label={t('mainMenu', 'notificationsHistory')}
            isActive={isActive("/notification-history")}
            isCollapsed={isCollapsed}
          />
        )}
        
        {/* Profile only for logged-in users */}
        {user && (
          <SidebarMenuItem 
            path="/profile" 
            icon={User}
            label={t('mainMenu', 'profile')}
            isActive={isActive("/profile")}
            isCollapsed={isCollapsed}
          />
        )}
        
        {/* Admin features only for authenticated admin users */}
        {user && canAccessUserManagement && (
          <SidebarMenuItem 
            path="/user-management" 
            icon={Users}
            label={t('mainMenu', 'userManagement')}
            isActive={isActive("/user-management")}
            isCollapsed={isCollapsed}
          />
        )}
        
        {/* Device Status Logs - only for superadmin */}
        {user && isSuperAdmin && (
          <SidebarMenuItem 
            path="/device-status-logs" 
            icon={Activity}
            label="Online/Offline Log"
            isActive={isActive("/device-status-logs")}
            isCollapsed={isCollapsed}
          />
        )}
        {/* Show login option for guests */}
        {isGuest && (
          <SidebarMenuItem 
            path="/auth/login" 
            icon={User}
            label={t('login', 'login')}
            isActive={isActive("/auth/login")}
            isCollapsed={isCollapsed}
          />
        )}
      </nav>
    </ScrollArea>
  );
};
