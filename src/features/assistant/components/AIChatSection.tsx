import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Loader2, Database, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  timestamp: Date;
}

export const AIChatSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'กรุณาเข้าสู่ระบบ',
          description: 'คุณต้องเข้าสู่ระบบก่อนใช้งาน AI Chat',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `https://tlnkyztazcsqybjigrpw.supabase.co/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message: userMessage.content,
            conversationHistory: messages.map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 429) {
          toast({
            title: 'Rate Limit',
            description: 'กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
            variant: 'destructive',
          });
        } else if (response.status === 402) {
          toast({
            title: 'Credit หมด',
            description: 'กรุณาเติม credits ใน Lovable workspace',
            variant: 'destructive',
          });
        } else if (response.status === 403) {
          toast({
            title: 'ไม่มีสิทธิ์เข้าถึง',
            description: errorData.message || 'คุณไม่มีสิทธิ์เข้าถึงอุปกรณ์ใดๆ',
            variant: 'destructive',
          });
        } else {
          throw new Error(errorData.error || 'Failed to get response');
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        sql: data.sql,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อ AI ได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="relative border-4 border-amber-900 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 shadow-2xl overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-amber-900"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-amber-900"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-amber-900"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-amber-900"></div>

      <CardHeader className="relative bg-gradient-to-r from-amber-800 to-amber-700 text-amber-50 rounded-none border-b-4 border-amber-900">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-transparent"></div>
        <CardTitle className="relative text-center text-xl font-bold flex items-center justify-center gap-2">
          <Database className="h-6 w-6" />
          AI Database Assistant
        </CardTitle>
        <p className="text-center text-amber-200 text-sm">ถามคำถามเกี่ยวกับข้อมูลการวิเคราะห์คุณภาพข้าว</p>
        {/* Decorative elements */}
        <div className="absolute top-2 left-4 w-4 h-4 border-2 border-amber-300 rotate-45 bg-amber-600"></div>
        <div className="absolute top-2 right-4 w-4 h-4 border-2 border-amber-300 rotate-45 bg-amber-600"></div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Chat Messages */}
        <ScrollArea className="h-[300px] pr-4 mb-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-amber-700/60">
              <Bot className="h-12 w-12 mb-2" />
              <p className="text-center text-sm">
                สวัสดีครับ! ผมเป็น AI Assistant<br />
                ถามอะไรเกี่ยวกับข้อมูลข้าวได้เลยครับ
              </p>
              <div className="mt-4 space-y-2 text-xs text-amber-600">
                <p>💡 ตัวอย่าง: "ค่า whiteness เฉลี่ยวันนี้เท่าไหร่?"</p>
                <p>💡 ตัวอย่าง: "แสดง 5 record ล่าสุด"</p>
                <p>💡 ตัวอย่าง: "สรุปข้อมูลความชื้นวันนี้"</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-100 border-2 border-amber-300 text-amber-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.sql && (
                      <div className="mt-2 p-2 bg-amber-900/10 rounded text-xs font-mono overflow-x-auto">
                        <p className="text-amber-700 font-bold mb-1">SQL Query:</p>
                        <code className="text-amber-800">{msg.sql}</code>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="พิมพ์คำถามของคุณที่นี่..."
            disabled={isLoading}
            className="flex-1 border-2 border-amber-600 focus:border-amber-800 bg-white"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-br from-amber-600 to-amber-700 text-white border-2 border-amber-900 shadow-[0_4px_#78350f] hover:-translate-y-0.5 hover:shadow-[0_6px_#78350f] active:translate-y-0.5 active:shadow-none transition-all duration-150"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
