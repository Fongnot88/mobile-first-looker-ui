
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePersonalNotifications } from "@/hooks/usePersonalNotifications";
import { getNotificationsEnabled } from "@/hooks/useAlertSound";

// Import pages directly (non-lazy for better performance on core pages)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import NotFound from "./pages/NotFound";
import Waiting from "./pages/Waiting";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import News from "./pages/News";
import NewsManagement from "./pages/NewsManagement";
import UserManagement from "./pages/UserManagement";
import NotificationSettings from "./pages/notification-settings";
import DeviceDetails from "./pages/DeviceDetails";
import MeasurementHistory from "./components/measurement-history/MeasurementHistory";
import NotificationHistory from "./pages/NotificationHistory";
import Equipment from "./pages/Equipment";
import MoistureMeterEquipment from "./pages/MoistureMeterEquipment";
import MoistureMeterDetails from "./pages/MoistureMeterDetails";
import GraphMonitor from "./pages/GraphMonitor";
import GraphSummary from "./pages/GraphSummary";
import GraphSummaryDetail from "./pages/GraphSummaryDetail";
import NewQualityMeasurements from "./pages/NewQualityMeasurements";
import MeasurementDetail from "./pages/MeasurementDetail";
import DeviceManagement from "./pages/DeviceManagement";
import AboutRiceflow from "./pages/AboutRiceflow";
import DeviceAccessManagement from "./pages/DeviceAccessManagement";
import Assistant from "./pages/Assistant";
import PublicAnalysisView from "./pages/PublicAnalysisView";
import PublicMoistureView from "./pages/PublicMoistureView";
import APITestPage from "./pages/APITestPage"; // เพิ่ม import สำหรับหน้าทดสอบ
import NotificationSettingsPage from "./pages/NotificationSettingsPage";

import { NotificationSenderPage } from "./pages/NotificationSenderPage";


// Device-specific graph pages
import DeviceGraphMonitor from "./pages/DeviceGraphMonitor";
import DeviceGraphSummary from "./pages/DeviceGraphSummary";

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
  </div>
);

// Main layout component with sidebar margin logic
const MainLayout = () => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { checkAndActivateOnRoute, hasActiveSettings } = usePersonalNotifications();
  
  useEffect(() => {
    // Listen for sidebar state changes using custom event
    const updateSidebarState = (event?: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent?.detail) {
        setIsCollapsed(customEvent.detail.isCollapsed);
      } else {
        const savedCollapsedState = localStorage.getItem('sidebarCollapsed');
        setIsCollapsed(savedCollapsedState === 'true');
      }
    };
    
    // Initial state
    updateSidebarState();
    
    // Listen for changes in localStorage
    window.addEventListener('storage', () => updateSidebarState());
    
    // Listen for custom event from Header component
    window.addEventListener('sidebarStateChanged', updateSidebarState);
    
    return () => {
      window.removeEventListener('storage', () => updateSidebarState());
      window.removeEventListener('sidebarStateChanged', updateSidebarState);
    };
  }, []);

  // ตรวจทุกครั้งที่เส้นทางเปลี่ยน เพื่อให้ผู้ใช้ได้ยินเสียงทันทีเมื่อมีการแจ้งเตือน
  useEffect(() => {
    // 🔒 CRITICAL: ตรวจสอบสถานะการแจ้งเตือนก่อนเรียก checkAndActivateOnRoute
    const globalEnabled = getNotificationsEnabled();
    if (!globalEnabled) {
      console.log('[MainLayout] route changed to', location.pathname, '→ notifications disabled, skip check');
      return;
    }
    
    console.log('[MainLayout] route changed to', location.pathname, '→ recheck personal notifications');
    checkAndActivateOnRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ตรวจเมื่อแท็บกลับมาโฟกัส/แอคทีฟ
  useEffect(() => {
    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        // 🔒 CRITICAL: ตรวจสอบสถานะการแจ้งเตือนก่อนเรียก checkAndActivateOnRoute
        const globalEnabled = getNotificationsEnabled();
        if (!globalEnabled) {
          console.log('[MainLayout] window focus/visible → notifications disabled, skip check');
          return;
        }
        
        console.log('[MainLayout] window focus/visible → recheck personal notifications');
        checkAndActivateOnRoute();
      }
    };
    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);
    return () => {
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
    };
  }, [checkAndActivateOnRoute]);

  // ตรวจเมื่อการตั้งค่าส่วนตัวเริ่มพร้อมใช้งาน (กรณี user/context เพิ่งพร้อมหลังเปลี่ยนหน้า)
  useEffect(() => {
    if (hasActiveSettings) {
      // 🔒 CRITICAL: ตรวจสอบสถานะการแจ้งเตือนก่อนเรียก checkAndActivateOnRoute
      const globalEnabled = getNotificationsEnabled();
      if (!globalEnabled) {
        console.log('[MainLayout] hasActiveSettings=true but notifications disabled, skip check');
        return;
      }
      
      console.log('[MainLayout] hasActiveSettings=true → recheck personal notifications');
      checkAndActivateOnRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveSettings]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Header, main, and FooterNav removed from MainLayout. Pages will use AppLayout. */}
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </div>
  );
};

// Auth layout for login/register pages
const AuthLayout = () => (
  <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-950">
    <Suspense fallback={<LoadingSpinner />}>
      <Outlet />
    </Suspense>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowGuest={true}>
            <Index />
          </ProtectedRoute>
        ),
      },
      {
        path: "news",
        element: (
          <ProtectedRoute allowGuest={true}>
            <News />
          </ProtectedRoute>
        ),
      },
      {
        path: "about-riceflow",
        element: (
          <ProtectedRoute allowGuest={true}>
            <AboutRiceflow />
          </ProtectedRoute>
        ),
      },
      // Logout route
      {
        path: "logout",
        element: <Logout />,
      },
      // Protected routes with guest access
      {
        path: "waiting",
        element: (
          <ProtectedRoute allowGuest={true}>
            <Waiting />
          </ProtectedRoute>
        ),
      },
      {
        path: "equipment",
        element: (
          <ProtectedRoute allowGuest={true}>
            <Equipment />
          </ProtectedRoute>
        ),
      },
      {
        path: "equipment/moisture-meter",
        element: (
          <ProtectedRoute allowGuest={true}>
            <MoistureMeterEquipment />
          </ProtectedRoute>
        ),
      },
      {
        path: "moisture-meter",
        element: (
          <ProtectedRoute allowGuest={true}>
            <MoistureMeterDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "moisture-meter/:deviceCode",
        element: (
          <ProtectedRoute allowGuest={true}>
            <MoistureMeterDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "measurements",
        element: (
          <ProtectedRoute allowGuest={true}>
            <div>Measurements Page - To be implemented</div>
          </ProtectedRoute>
        ),
      },
      {
        path: "device/:deviceCode",
        element: (
          <ProtectedRoute allowGuest={true}>
            <DeviceDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "device/:deviceCode/:symbol",
        element: (
          <ProtectedRoute allowGuest={true}>
            <MeasurementHistory />
          </ProtectedRoute>
        ),
      },
      // Device-specific graph routes
      {
        path: "device/:deviceCode/graph-monitor",
        element: (
          <ProtectedRoute allowGuest={true}>
            <DeviceGraphMonitor />
          </ProtectedRoute>
        ),
      },
      {
        path: "device/:deviceCode/graph-summary",
        element: (
          <ProtectedRoute allowGuest={true}>
            <DeviceGraphSummary />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "graph-monitor",
        element: (
          <ProtectedRoute allowGuest={true}>
            <GraphMonitor />
          </ProtectedRoute>
        ),
      },
      {
        path: "graph-summary",
        element: (
          <ProtectedRoute allowGuest={true}>
            <GraphSummary />
          </ProtectedRoute>
        ),
      },
      {
        path: "graph-summary-detail",
        element: (
          <ProtectedRoute allowGuest={true}>
            <GraphSummaryDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "new-quality-measurements",
        element: (
          <ProtectedRoute allowGuest={true}>
            <NewQualityMeasurements />
          </ProtectedRoute>
        ),
      },
      {
        path: "measurement-detail/:measurementSymbol",
        element: (
          <ProtectedRoute allowGuest={true}>
            <MeasurementDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "measurement-history/:deviceCode/:symbol",
        element: (
          <ProtectedRoute allowGuest={true}>
            <MeasurementHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "assistant",
        element: (
          <ProtectedRoute allowGuest={true}>
            <Assistant />
          </ProtectedRoute>
        ),
      },

      // Admin routes - no guest access
      {
        path: "admin",
        element: (
          <ProtectedRoute requiredRoles={["admin"]}>
            <Admin />
          </ProtectedRoute>
        ),
      },
      {
        path: "user-management",
        element: (
          <ProtectedRoute requiredRoles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "device-management",
        element: (
          <ProtectedRoute requiredRoles={["admin"]}>
            <DeviceManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "device-access-management",
        element: (
          <ProtectedRoute requiredRoles={["superadmin"]}>
            <DeviceAccessManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "news-management",
        element: (
          <ProtectedRoute requiredRoles={["admin"]}>
            <NewsManagement />
          </ProtectedRoute>
        ),
      },
      // Notification routes - require login
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <NotificationSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: "notification-history",
        element: (
          <ProtectedRoute>
            <NotificationHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "notification-sender",
        element: (
          <ProtectedRoute requiredRoles={["admin"]}>
            <NotificationSenderPage />
          </ProtectedRoute>
        ),
      },
      // API Testing route - require admin access
      {
        path: "api-test",
        element: (
          <ProtectedRoute requiredRoles={["admin", "superadmin"]}>
            <APITestPage />
          </ProtectedRoute>
        ),
      },
      // Notification Settings route - require login
      {
        path: "notification-settings",
        element: (
          <ProtectedRoute>
            <NotificationSettingsPage />
          </ProtectedRoute>
        ),
      },

      // Public shared analysis route (no auth required)
      {
        path: "shared/:token",
        element: <PublicAnalysisView />,
      },
      // Public shared moisture reading route (no auth required)
      {
        path: "shared-moisture/:token",
        element: <PublicMoistureView />,
      },
    ],
  },
  // Auth routes with separate layout
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
  // Legacy login route (redirect to new auth structure)
  {
    path: "/login",
    element: <Navigate to="/auth/login" replace />,
  },
  // 404 route
  {
    path: "*",
    element: <NotFound />,
  },
]);
