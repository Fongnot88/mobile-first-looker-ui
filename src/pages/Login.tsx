
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { FooterNav } from "@/components/FooterNav";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Login() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "ใส่อีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับกลับมา",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: error.message || "กรุณาตรวจสอบอีเมลและรหัสผ่าน",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "ใส่อีเมลและรหัสผ่านเพื่อลงทะเบียน",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณาตรวจสอบรหัสผ่านอีกครั้ง",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (signUpError) {
        console.error("SignUp error:", signUpError);
        throw signUpError;
      }
      
      // Check if user already exists
      if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        toast({
          title: "อีเมลนี้มีผู้ใช้งานแล้ว",
          description: "กรุณาลงชื่อเข้าใช้หรือใช้อีเมลอื่น",
          variant: "destructive",
        });
        setActiveTab("login");
        return;
      }
      
      // Sign in automatically after successful registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error("Auto login error:", signInError);
        throw signInError;
      }
      
      toast({
        title: "ลงทะเบียนสำเร็จ",
        description: "ยินดีต้อนรับสู่ระบบ คุณสามารถใช้งานได้ทันที",
      });
      
      // Navigate to home page - users now get 'user' role automatically
      navigate("/");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "ลงทะเบียนไม่สำเร็จ",
        description: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to initialize a user role if none exists (no longer needed as the trigger handles this)
  const checkAndInitializeUserRole = async (userId: string) => {
    try {
      // Check if the user has any roles
      const { data: roles, error: rolesError } = await supabase.rpc('get_user_roles', {
        user_id: userId
      });
      
      console.log("Checked roles for user:", userId, roles);
      
      // If no roles or error, the trigger should have already added the 'user' role
      if (rolesError || !roles || roles.length === 0) {
        console.log("No roles found, but trigger should have handled this");
      }
    } catch (error) {
      console.error("Error in checkAndInitializeUserRole:", error);
    }
  };
  
  // If user just logged in, check and initialize role if needed
  useEffect(() => {
    if (user && !isLoading) {
      checkAndInitializeUserRole(user.id);
    }
  }, [user, isLoading]);
  
  // If already logged in, redirect to home
  if (!isLoading && user) {
    return <Navigate to="/" replace />;
  }
  
  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-emerald-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }
  
  return (
    <>
      <div className={`min-h-screen bg-gradient-to-b from-emerald-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 ${isMobile ? 'pb-20' : ''}`}>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Riceflow Login</CardTitle>
            <CardDescription className="text-center">เข้าสู่ระบบหรือลงทะเบียนเพื่อใช้งาน</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="อีเมลของคุณ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input 
                  id="password"
                  type="password"
                  placeholder="รหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-sky-600 hover:bg-sky-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                กลับหน้าแรก
              </Button>
              
              <div className="text-center mt-2">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-sm text-muted-foreground hover:text-emerald-600 px-0"
                  onClick={() => navigate('/support')}
                >
                  พบปัญหาการเข้าใช้งานบัญชี? ติดต่อส่วนสนับสนุน
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      {/* Mobile Footer Navigation */}
      {isMobile && <FooterNav />}
    </>
  );
}
