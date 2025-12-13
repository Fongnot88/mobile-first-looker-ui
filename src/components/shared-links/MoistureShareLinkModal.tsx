import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Download, Share2 } from 'lucide-react';
import { useMoistureSharedLinks } from '@/hooks/useMoistureSharedLinks';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { shareContent, getSharingCapabilities, getShareButtonText } from '@/utils/sharing';
import { isMobileDevice } from '@/utils/platform';
import QRCode from 'qrcode';

interface MoistureShareLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readingId: string;
  deviceName?: string;
}

export const MoistureShareLinkModal: React.FC<MoistureShareLinkModalProps> = ({
  open,
  onOpenChange,
  readingId,
  deviceName,
}) => {
  const [title, setTitle] = useState(deviceName ? `ข้อมูลความชื้น - ${deviceName}` : '');
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const { createSharedLink, getPublicLink } = useMoistureSharedLinks();
  const { t } = useTranslation();
  
  const sharingCapabilities = getSharingCapabilities();
  const isMobile = isMobileDevice();

  useEffect(() => {
    if (shareUrl && qrCanvasRef.current) {
      const qrSize = isMobile ? 250 : 200;
      
      QRCode.toCanvas(qrCanvasRef.current, shareUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error);
    }
  }, [shareUrl, isMobile]);

  const handleDownloadQR = () => {
    if (!qrCanvasRef.current || !title) return;
    
    try {
      const finalCanvas = document.createElement('canvas');
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return;

      const qrCanvas = qrCanvasRef.current;
      const padding = 20;
      const fontSize = 16;
      
      finalCanvas.width = qrCanvas.width + (padding * 2);
      finalCanvas.height = qrCanvas.height + (padding * 3) + fontSize + 10;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      ctx.drawImage(qrCanvas, padding, padding);
      
      ctx.fillStyle = '#000000';
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = 'center';
      const textY = qrCanvas.height + padding * 2 + fontSize;
      ctx.fillText(title, finalCanvas.width / 2, textY);
      
      const link = document.createElement('a');
      link.download = `moisture-qr-${title.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      link.href = finalCanvas.toDataURL();
      link.click();
      
      toast({
        title: 'สำเร็จ',
        description: 'บันทึก QR Code เรียบร้อยแล้ว',
      });
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถบันทึก QR Code ได้',
        variant: 'destructive',
      });
    }
  };

  const handleCreateLink = async () => {
    if (!title.trim()) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'กรุณาระบุชื่อลิงก์',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating moisture link for reading ID:', readingId, 'with title:', title);
      const result = await createSharedLink(readingId, title.trim());
      const url = getPublicLink(result.share_token);
      setShareUrl(url);
      toast({
        title: 'สำเร็จ',
        description: 'สร้างลิงก์แชร์เรียบร้อยแล้ว',
      });
    } catch (error: any) {
      console.error('Failed to create moisture link:', error);
      toast({
        title: 'ข้อผิดพลาด',
        description: error?.message || 'ไม่สามารถสร้างลิงก์ได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareLink = async () => {
    if (!shareUrl || !title) return;
    
    setSharing(true);
    
    try {
      await shareContent(
        {
          title: `${title} - ข้อมูลความชื้น`,
          text: `ดูข้อมูลความชื้น: ${title}`,
          url: shareUrl
        },
        {
          fallbackToClipboard: true,
          onSuccess: () => {
            if (sharingCapabilities.hasWebShare) {
              toast({
                title: 'แชร์สำเร็จ',
                description: 'แชร์ลิงก์เรียบร้อยแล้ว',
              });
            } else {
              setCopied(true);
              toast({
                title: 'คัดลอกแล้ว',
                description: 'คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว',
              });
              setTimeout(() => setCopied(false), 2000);
            }
          },
          onError: (error) => {
            console.error('Share failed:', error);
            toast({
              title: 'ข้อผิดพลาด',
              description: 'ไม่สามารถแชร์ลิงก์ได้',
              variant: 'destructive',
            });
          }
        }
      );
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'คัดลอกแล้ว',
        description: 'คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'ข้อผิดพลาด',
        description: 'ไม่สามารถคัดลอกลิงก์ได้',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setTitle(deviceName ? `ข้อมูลความชื้น - ${deviceName}` : '');
    setShareUrl('');
    setCopied(false);
    setSharing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แชร์ข้อมูลความชื้น</DialogTitle>
          <DialogDescription>
            สร้างลิงก์สาธารณะเพื่อแชร์ข้อมูลความชื้นนี้ให้ผู้อื่นดู
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!shareUrl ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">ชื่อลิงก์</Label>
                <Input
                  id="title"
                  placeholder="เช่น ข้อมูลความชื้นข้าวหอมมะลิ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>ลิงก์แชร์</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    onClick={handleShareLink}
                    disabled={sharing}
                    className="shrink-0"
                    title={sharingCapabilities.hasWebShare ? 'แชร์ลิงก์' : 'คัดลอกลิงก์'}
                  >
                    {sharing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : sharingCapabilities.hasWebShare ? (
                      <Share2 className="h-4 w-4" />
                    ) : copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  {sharingCapabilities.hasWebShare && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      className="shrink-0"
                      title="คัดลอกลิงก์"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>QR Code</Label>
                <div className="flex flex-col items-center space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <canvas
                    ref={qrCanvasRef}
                    className="border border-gray-300 dark:border-gray-600 rounded"
                    style={{
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</p>
                    {isMobile && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        สแกน QR Code ด้วยกล้องหรือแอปสแกน QR
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadQR}
                      className="gap-2 flex-1"
                    >
                      <Download className="h-4 w-4" />
                      บันทึก QR Code
                    </Button>
                    {isMobile && (
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={handleShareLink}
                        disabled={sharing}
                        className="gap-2 flex-1"
                      >
                        {sharing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                        {getShareButtonText(sharingCapabilities.recommendedMethod as 'web_share' | 'clipboard' | 'manual')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!shareUrl ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                ยกเลิก
              </Button>
              <Button onClick={handleCreateLink} disabled={loading}>
                {loading ? 'กำลังสร้าง...' : 'สร้างลิงก์'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>
              เสร็จสิ้น
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
