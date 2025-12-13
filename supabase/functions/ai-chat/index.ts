import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// Allowed tables for security
const ALLOWED_TABLES = ["rice_quality_analysis", "device_settings", "moisture_meter_readings", "moisture_meter_settings"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with user's JWT
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for queries
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's accessible device codes
    const { data: userRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isAdminOrSuperadmin = userRoles?.some(r => r.role === "admin" || r.role === "superadmin");

    let accessibleDeviceCodes: string[] = [];

    if (isAdminOrSuperadmin) {
      // Admins can access all devices
      const { data: allDevices } = await supabaseAdmin
        .from("rice_quality_analysis")
        .select("device_code")
        .not("device_code", "is", null);
      
      accessibleDeviceCodes = [...new Set(allDevices?.map(d => d.device_code) || [])];
    } else {
      // Regular users - get from user_device_access
      const { data: userDevices } = await supabaseAdmin
        .from("user_device_access")
        .select("device_code")
        .eq("user_id", user.id);

      accessibleDeviceCodes = userDevices?.map(d => d.device_code) || [];
    }

    if (accessibleDeviceCodes.length === 0) {
      return new Response(JSON.stringify({ 
        error: "No device access",
        message: "คุณไม่มีสิทธิ์เข้าถึงอุปกรณ์ใดๆ กรุณาติดต่อผู้ดูแลระบบ"
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // System prompt for AI
    const systemPrompt = `คุณเป็น AI Assistant สำหรับระบบวิเคราะห์คุณภาพข้าว RiceFlow คุณสามารถช่วยผู้ใช้ค้นหาและวิเคราะห์ข้อมูลจากฐานข้อมูลได้

## ข้อจำกัดการเข้าถึงข้อมูล
- ผู้ใช้คนนี้สามารถเข้าถึงได้เฉพาะ device_code ต่อไปนี้: ${accessibleDeviceCodes.join(", ")}
- คุณต้องเพิ่ม WHERE device_code IN ('${accessibleDeviceCodes.join("', '")}') ใน SQL query เสมอ

## ตารางที่สามารถเข้าถึงได้
1. **rice_quality_analysis** - ข้อมูลการวิเคราะห์คุณภาพข้าว
   - id, device_code, whiteness, head_rice, whole_kernels, total_brokens, small_brokens
   - imperfection_rate, paddy_rate, yellow_rice_rate, created_at, analyzed_at, cur_material, surveyor

2. **device_settings** - การตั้งค่าอุปกรณ์
   - device_code, display_name, location, is_active, graph_color

3. **moisture_meter_readings** - ข้อมูลเครื่องวัดความชื้น
   - device_code, moisture_machine, moisture_model, temperature, reading_time

4. **moisture_meter_settings** - การตั้งค่าเครื่องวัดความชื้น
   - device_code, display_name, location, is_active

## กฎความปลอดภัย
- ใช้ได้เฉพาะ SELECT statement เท่านั้น (ห้าม INSERT, UPDATE, DELETE)
- ต้องมี WHERE device_code IN (...) เสมอ
- ตอบเป็นภาษาไทยเป็นหลัก

เมื่อผู้ใช้ถามคำถามเกี่ยวกับข้อมูล ให้ใช้ tool "execute_sql" เพื่อ query ข้อมูล แล้วสรุปผลลัพธ์ให้ผู้ใช้เข้าใจง่าย`;

    // Define tools for the AI
    const tools = [
      {
        type: "function",
        function: {
          name: "execute_sql",
          description: "Execute a SELECT SQL query on the database. Only SELECT statements are allowed. Must include WHERE device_code IN clause.",
          parameters: {
            type: "object",
            properties: {
              sql: {
                type: "string",
                description: "The SQL SELECT query to execute. Must include WHERE device_code IN clause with allowed device codes."
              },
              explanation: {
                type: "string",
                description: "Brief explanation of what this query does in Thai"
              }
            },
            required: ["sql", "explanation"],
            additionalProperties: false
          }
        }
      }
    ];

    // Build messages array
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    // First AI call to get SQL query
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools,
        tool_choice: "auto",
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const aiMessage = aiData.choices[0].message;

    // Check if AI wants to call a tool
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      const toolCall = aiMessage.tool_calls[0];
      
      if (toolCall.function.name === "execute_sql") {
        const args = JSON.parse(toolCall.function.arguments);
        const sql = args.sql;
        const explanation = args.explanation;

        console.log("Executing SQL:", sql);
        console.log("Explanation:", explanation);

        // Security validation
        const sqlLower = sql.toLowerCase().trim();
        
        // Check for SELECT only
        if (!sqlLower.startsWith("select")) {
          return new Response(JSON.stringify({ 
            response: "ขออภัย ฉันสามารถทำได้เฉพาะการค้นหาข้อมูล (SELECT) เท่านั้นค่ะ",
            sql: null,
            results: null
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check for forbidden keywords
        const forbiddenKeywords = ["insert", "update", "delete", "drop", "alter", "create", "truncate", "grant", "revoke"];
        for (const keyword of forbiddenKeywords) {
          if (sqlLower.includes(keyword)) {
            return new Response(JSON.stringify({ 
              response: "ขออภัย ไม่อนุญาตให้ใช้คำสั่งนี้ค่ะ",
              sql: null,
              results: null
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        // Check that query includes device_code restriction
        const deviceCodesPattern = accessibleDeviceCodes.map(d => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|");
        const hasDeviceCodeRestriction = accessibleDeviceCodes.some(dc => sqlLower.includes(dc.toLowerCase()));
        
        if (!hasDeviceCodeRestriction && !sqlLower.includes("device_code")) {
          return new Response(JSON.stringify({ 
            response: "ขออภัย คำสั่งนี้ต้องระบุ device_code ที่คุณมีสิทธิ์เข้าถึงค่ะ",
            sql: null,
            results: null
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Execute the query
        try {
          const { data: queryResults, error: queryError } = await supabaseAdmin.rpc('execute_sql', { query_text: sql });
          
          if (queryError) {
            console.error("Query error:", queryError);
            
            // If RPC doesn't exist, try direct query
            // Note: This is a fallback - ideally we'd use a proper RPC function
            const directResult = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
              },
              body: JSON.stringify({ query_text: sql })
            });

            if (!directResult.ok) {
              // Fallback: Parse table name and use Supabase client
              const tableMatch = sql.match(/from\s+(\w+)/i);
              if (tableMatch && ALLOWED_TABLES.includes(tableMatch[1])) {
                const tableName = tableMatch[1];
                
                // Simple query execution for common cases
                let queryBuilder = supabaseAdmin.from(tableName).select("*");
                
                // Add device_code filter
                queryBuilder = queryBuilder.in("device_code", accessibleDeviceCodes);
                
                // Check for LIMIT
                const limitMatch = sql.match(/limit\s+(\d+)/i);
                if (limitMatch) {
                  queryBuilder = queryBuilder.limit(parseInt(limitMatch[1]));
                } else {
                  queryBuilder = queryBuilder.limit(20);
                }
                
                // Check for ORDER BY
                if (sqlLower.includes("order by") && sqlLower.includes("desc")) {
                  const orderMatch = sql.match(/order\s+by\s+(\w+)/i);
                  if (orderMatch) {
                    queryBuilder = queryBuilder.order(orderMatch[1], { ascending: false });
                  }
                }

                const { data: fallbackData, error: fallbackError } = await queryBuilder;
                
                if (fallbackError) {
                  throw fallbackError;
                }

                // Second AI call to summarize results
                const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${LOVABLE_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    model: "google/gemini-2.5-flash",
                    messages: [
                      ...messages,
                      aiMessage,
                      {
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ 
                          explanation,
                          results: fallbackData,
                          rowCount: fallbackData?.length || 0
                        })
                      }
                    ],
                  }),
                });

                const summaryData = await summaryResponse.json();
                const summaryText = summaryData.choices[0].message.content;

                return new Response(JSON.stringify({ 
                  response: summaryText,
                  sql: sql,
                  results: fallbackData,
                  explanation
                }), {
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
              }
            }
          }

          // Second AI call to summarize results
          const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                ...messages,
                aiMessage,
                {
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify({ 
                    explanation,
                    results: queryResults,
                    rowCount: Array.isArray(queryResults) ? queryResults.length : 0
                  })
                }
              ],
            }),
          });

          const summaryData = await summaryResponse.json();
          const summaryText = summaryData.choices[0].message.content;

          return new Response(JSON.stringify({ 
            response: summaryText,
            sql: sql,
            results: queryResults,
            explanation
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });

        } catch (execError) {
          console.error("SQL execution error:", execError);
          return new Response(JSON.stringify({ 
            response: `ขออภัย เกิดข้อผิดพลาดในการค้นหาข้อมูล: ${execError.message}`,
            sql: sql,
            results: null
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // No tool call - just return the AI response
    return new Response(JSON.stringify({ 
      response: aiMessage.content,
      sql: null,
      results: null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("ai-chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
