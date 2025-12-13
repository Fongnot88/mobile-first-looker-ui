import React, { useState } from 'react';
import { useAuth } from "@/components/AuthProvider";
import { AppLayout } from "@/components/layouts/app-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { PasswordDialog } from "@/components/profile/PasswordDialog";
import { FeedbackDialogs } from "@/components/profile/FeedbackDialogs";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, CheckCircle, AlertCircle } from "lucide-react";
import { SharedLinksSection } from "@/components/profile/SharedLinksSection";
import { MoistureSharedLinksSection } from "@/components/profile/MoistureSharedLinksSection";
import { NotificationSoundSettings } from "@/components/profile/NotificationSoundSettings";
import { useTranslation } from "@/hooks/useTranslation";
const Profile = () => {
  const {
    user
  } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const isMobile = useIsMobile();
  const { t, language } = useTranslation();
  // isCollapsed state and its useEffect have been removed as AppLayout now handles sidebar state and content margins.

  // Format user data
  const userEmail = user?.email || t('profile', 'noEmailData');
  const created = user?.created_at ? new Date(user.created_at).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : t('profile', 'noDateData');

  // Format last sign in time
  const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : t('profile', 'noData');

  // Handle password success and errors
  const handlePasswordSuccess = () => {
    setShowSuccessDialog(true);
  };
  const handlePasswordError = (message: string) => {
    setErrorMessage(message);
    setShowErrorDialog(true);
  };
  return <AppLayout showFooterNav={true}>
      {/* Main content container with original padding and max-width. Dynamic margins are now handled by AppLayout. */}
      <div className={cn("max-w-7xl mx-auto"
    // Removed dynamic margin logic: !isMobile && "ml-0 md:ml-[5rem]", 
    // Removed dynamic margin logic: !isMobile && !isCollapsed && "md:ml-64"
    // The 'transition-all duration-300' was for the margin, AppLayout's main has its own.
    )}>
        {/* Standard Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('profile', 'profile')}</h1>
        </div>
        
        <div className="relative">
          {/* Background decorative elements (can be kept or removed based on preference) */}
          <div className="absolute top-12 right-8 w-24 h-24 bg-emerald-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
          <div className="absolute bottom-12 left-8 w-32 h-32 bg-blue-400 rounded-full filter blur-3xl opacity-10 -z-10"></div>
          
          {/* Main grid layout */}
          <div className={`grid ${!isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-1 gap-6'}`}>
            {/* ข้อมูลผู้ใช้ Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile', 'userInfo')}</CardTitle>
                <CardDescription>{t('profile', 'userInfoDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('profile', 'userEmail')}</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{userEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('profile', 'lastSignIn')}</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{lastSignIn}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('profile', 'memberSince')}</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">{created}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setShowPasswordDialog(true)} variant="outline">
                  <KeyRound className="w-4 h-4 mr-2" /> {t('profile', 'changePassword')}
                </Button>
              </CardFooter>
            </Card>
            
            {/* ลิงก์แชร์ของฉัน Section */}
            <SharedLinksSection />
            
            {/* ลิงก์แชร์ความชื้น Section */}
            <MoistureSharedLinksSection />
            
            {/* การตั้งค่าเสียงแจ้งเตือน Section */}
            <NotificationSoundSettings />
            
          </div>
        </div>

        {/* Password Change Dialog */}
        <PasswordDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} onSuccess={handlePasswordSuccess} onError={handlePasswordError} />

        {/* Feedback Dialogs */}
        <FeedbackDialogs showSuccessDialog={showSuccessDialog} setShowSuccessDialog={setShowSuccessDialog} showErrorDialog={showErrorDialog} setShowErrorDialog={setShowErrorDialog} errorMessage={errorMessage} />
      </div>
    </AppLayout>;
};
export default Profile;