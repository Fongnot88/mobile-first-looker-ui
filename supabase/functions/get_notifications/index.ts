
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// กำหนด CORS headers เพื่อให้สามารถเรียกใช้งานจาก client ได้
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // จัดการกับ CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // สร้าง Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    // Get authorization header
    const authorization = req.headers.get('Authorization');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization || '' } }
    });

    // Get current user from JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ดึงพารามิเตอร์จาก query string (ถ้ามี)
    const url = new URL(req.url);
    const limit = url.searchParams.get("limit") || "100"; // จำนวนแถวที่ต้องการ (ค่าเริ่มต้น 100)
    const page = url.searchParams.get("page") || "1";     // หน้า (ค่าเริ่มต้น 1)
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    console.log(`Query notifications for user ${user.id} with limit: ${limitNum}, page: ${pageNum}, offset: ${offset}`);

    // ดึงข้อมูลจากตาราง notifications สำหรับ user ปัจจุบันเท่านั้น
    const { data: notifications, error, count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", user.id) // 🔒 CRITICAL: Filter by current user only
      .order("timestamp", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      console.error("Error fetching notifications:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // คำนวณจำนวนหน้าทั้งหมด
    const totalPages = count ? Math.ceil(count / limitNum) : 0;

    // ส่งข้อมูลกลับ
    return new Response(
      JSON.stringify({ 
        data: notifications, 
        metadata: { 
          totalCount: count, 
          totalPages, 
          currentPage: pageNum,
          limit: limitNum 
        } 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
