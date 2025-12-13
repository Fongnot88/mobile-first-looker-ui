import React, { useState, useRef } from 'react';
import { useMoistureSharedLinks } from '@/hooks/useMoistureSharedLinks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Copy, Edit, Trash2, ExternalLink, Check, QrCode, Download, Share2, Droplets } from 'lucide-react';
import QRCode from 'qrcode';
import { useTranslation } from '@/hooks/useTranslation';
import { shareContent, getSharingCapabilities } from '@/utils/sharing';
import { isMobileDevice } from '@/utils/platform';

export const MoistureSharedLinksSection: React.FC = () => {
  const { t, language } = useTranslation();
  const { sharedLinks, loading, updateSharedLink, deleteSharedLink, getPublicLink } = useMoistureSharedLinks();
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());
  const [showQrCode, setShowQrCode] = useState<string | null>(null);
  const [sharingLinks, setSharingLinks] = useState<Set<string>>(new Set());
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const sharingCapabilities = getSharingCapabilities();
  const isMobile = isMobileDevice();

  const generateQRCode = (token: string) => {
    if (!qrCanvasRef.current) return;
    
    const url = getPublicLink(token);
    const canvas = qrCanvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    const qrSize = isMobile ? 250 : 200;
    
    QRCode.toCanvas(qrCanvasRef.current, url, {
      width: qrSize,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).catch((error) => {
      console.error('QR code generation failed:', error);
    });
  };

  const handleDownloadQR = (shareToken: string, title: string) => {
    if (!qrCanvasRef.current) return;
    
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
        title: language === 'th' ? 'สำเร็จ' : 'Success',
        description: language === 'th' ? 'ดาวน์โหลด QR Code สำเร็จ' : 'QR Code downloaded successfully',
      });
    } catch (error) {
      toast({
        title: language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description: language === 'th' ? 'ไม่สามารถดาวน์โหลด QR Code ได้' : 'Failed to download QR Code',
        variant: 'destructive',
      });
    }
  };

  const handleShareLink = async (shareToken: string, title: string) => {
    setSharingLinks(prev => new Set([...prev, shareToken]));
    
    try {
      const url = getPublicLink(shareToken);
      
      await shareContent(
        {
          title: `${title} - Moisture Reading`,
          text: language === 'th' ? `ดูข้อมูลความชื้น: ${title}` : `View moisture data: ${title}`,
          url: url
        },
        {
          fallbackToClipboard: true,
          onSuccess: () => {
            if (sharingCapabilities.hasWebShare) {
              toast({
                title: language === 'th' ? 'แชร์สำเร็จ' : 'Shared successfully',
                description: language === 'th' ? 'แชร์ลิงก์สำเร็จ' : 'Link shared successfully',
              });
            } else {
              setCopiedLinks(prev => new Set([...prev, shareToken]));
              toast({
                title: language === 'th' ? 'คัดลอกสำเร็จ' : 'Copied',
                description: language === 'th' ? 'คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว' : 'Link copied to clipboard',
              });
              setTimeout(() => {
                setCopiedLinks(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(shareToken);
                  return newSet;
                });
              }, 2000);
            }
          },
          onError: (error) => {
            console.error('Share failed:', error);
            toast({
              title: language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
              description: language === 'th' ? 'ไม่สามารถแชร์ลิงก์ได้' : 'Failed to share link',
              variant: 'destructive',
            });
          }
        }
      );
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setSharingLinks(prev => {
        const newSet = new Set(prev);
        newSet.delete(shareToken);
        return newSet;
      });
    }
  };

  const handleCopyLink = async (shareToken: string) => {
    try {
      const url = getPublicLink(shareToken);
      await navigator.clipboard.writeText(url);
      setCopiedLinks(prev => new Set([...prev, shareToken]));
      toast({
        title: language === 'th' ? 'คัดลอกสำเร็จ' : 'Copied',
        description: language === 'th' ? 'คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว' : 'Link copied to clipboard',
      });
      setTimeout(() => {
        setCopiedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete(shareToken);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast({
        title: language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description: language === 'th' ? 'ไม่สามารถคัดลอกลิงก์ได้' : 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const result = await updateSharedLink(id, { is_active: !currentStatus });
    if (result) {
      toast({
        title: language === 'th' ? 'อัปเดตสำเร็จ' : 'Updated',
        description: !currentStatus 
          ? (language === 'th' ? 'เปิดใช้งานลิงก์แล้ว' : 'Link activated')
          : (language === 'th' ? 'ปิดใช้งานลิงก์แล้ว' : 'Link deactivated'),
      });
    } else {
      toast({
        title: language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description: language === 'th' ? 'ไม่สามารถอัปเดตสถานะได้' : 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleEditTitle = async (id: string) => {
    if (!editTitle.trim()) {
      toast({
        title: language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description: language === 'th' ? 'กรุณากรอกชื่อลิงก์' : 'Please enter a link name',
        variant: 'destructive',
      });
      return;
    }

    const result = await updateSharedLink(id, { title: editTitle.trim() });
    if (result) {
      toast({
        title: language === 'th' ? 'อัปเดตสำเร็จ' : 'Updated',
        description: language === 'th' ? 'เปลี่ยนชื่อลิงก์สำเร็จ' : 'Link name updated',
      });
      setEditingLink(null);
      setEditTitle('');
    } else {
      toast({
        title: language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description: language === 'th' ? 'ไม่สามารถเปลี่ยนชื่อได้' : 'Failed to update name',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLink = async (id: string) => {
    const success = await deleteSharedLink(id);
    if (success) {
      toast({
        title: language === 'th' ? 'ลบสำเร็จ' : 'Deleted',
        description: language === 'th' ? 'ลบลิงก์แชร์แล้ว' : 'Shared link deleted',
      });
    } else {
      toast({
        title: language === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
        description: language === 'th' ? 'ไม่สามารถลบลิงก์ได้' : 'Failed to delete link',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (link: any) => {
    setEditingLink(link.id);
    setEditTitle(link.title);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            {language === 'th' ? 'ลิงก์แชร์ความชื้น' : 'Moisture Shared Links'}
          </CardTitle>
          <CardDescription>
            {language === 'th' ? 'จัดการลิงก์แชร์ข้อมูลความชื้นของคุณ' : 'Manage your moisture data shared links'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">
              {language === 'th' ? 'กำลังโหลด...' : 'Loading...'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-500" />
          {language === 'th' ? 'ลิงก์แชร์ความชื้น' : 'Moisture Shared Links'}
        </CardTitle>
        <CardDescription>
          {language === 'th' ? 'จัดการลิงก์แชร์ข้อมูลความชื้นของคุณ' : 'Manage your moisture data shared links'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sharedLinks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'th' ? 'ยังไม่มีลิงก์แชร์ความชื้น' : 'No moisture shared links yet'}
          </div>
        ) : (
          <div className="space-y-4">
            {sharedLinks.map((link) => (
              <div
                key={link.id}
                className="border rounded-lg p-3 md:p-4 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        <h4 className="font-medium text-base md:text-lg">{link.title}</h4>
                        <Dialog open={editingLink === link.id} onOpenChange={(open) => {
                          if (!open) {
                            setEditingLink(null);
                            setEditTitle('');
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(link)}
                              className="h-6 w-6 p-0 hover:bg-muted"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {language === 'th' ? 'แก้ไขชื่อลิงก์' : 'Edit Link Name'}
                              </DialogTitle>
                              <DialogDescription>
                                {language === 'th' ? 'เปลี่ยนชื่อลิงก์แชร์ของคุณ' : 'Change your shared link name'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                              <Label htmlFor="edit-title">
                                {language === 'th' ? 'ชื่อลิงก์' : 'Link Name'}
                              </Label>
                              <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder={language === 'th' ? 'กรอกชื่อลิงก์ใหม่' : 'Enter new link name'}
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingLink(null);
                                  setEditTitle('');
                                }}
                              >
                                {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                              </Button>
                              <Button onClick={() => handleEditTitle(link.id)}>
                                {language === 'th' ? 'บันทึก' : 'Save'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Badge variant={link.is_active ? "default" : "secondary"}>
                        {link.is_active 
                          ? (language === 'th' ? 'ใช้งาน' : 'Active')
                          : (language === 'th' ? 'ปิดใช้งาน' : 'Inactive')
                        }
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 mb-3">
                      <p className="text-xs text-muted-foreground">
                        {language === 'th' ? 'สร้างเมื่อ' : 'Created'}: {formatDate(link.created_at)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'th' ? 'อัปเดตล่าสุด' : 'Updated'}: {formatDate(link.updated_at)}
                      </p>
                    </div>
                    
                    <div className="mt-2 bg-muted/30 p-3 rounded-md">
                      <p className="text-xs font-medium mb-2">
                        {language === 'th' ? 'ลิงก์แชร์สาธารณะ' : 'Public Share Link'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 bg-background p-2 rounded border">
                        <span className="text-sm text-muted-foreground break-all flex-1 min-w-[200px]">
                          {getPublicLink(link.share_token)}
                        </span>
                        <Button
                          variant="default"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => handleShareLink(link.share_token, link.title)}
                          disabled={sharingLinks.has(link.share_token)}
                        >
                          {sharingLinks.has(link.share_token) ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : sharingCapabilities.hasWebShare ? (
                            <Share2 className="h-4 w-4" />
                          ) : copiedLinks.has(link.share_token) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        {sharingCapabilities.hasWebShare && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                            onClick={() => handleCopyLink(link.share_token)}
                          >
                            {copiedLinks.has(link.share_token) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end items-center gap-2 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-xs text-muted-foreground">
                        {link.is_active 
                          ? (language === 'th' ? 'เปิด' : 'On')
                          : (language === 'th' ? 'ปิด' : 'Off')
                        }
                      </span>
                      <Switch
                        checked={link.is_active}
                        onCheckedChange={() => handleToggleActive(link.id, link.is_active)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <Dialog open={showQrCode === link.share_token} onOpenChange={(open) => {
                    if (open) {
                      setShowQrCode(link.share_token);
                      setTimeout(() => generateQRCode(link.share_token), 100);
                    } else {
                      setShowQrCode(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <QrCode className="h-4 w-4 mr-1.5" />
                        {language === 'th' ? 'QR Code' : 'QR Code'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <QrCode className="h-5 w-5" />
                          QR Code - {link.title}
                        </DialogTitle>
                        <DialogDescription>
                          {language === 'th' 
                            ? 'สแกน QR Code เพื่อเข้าดูข้อมูลความชื้น'
                            : 'Scan this QR code to view moisture data'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center p-4">
                        <canvas ref={qrCanvasRef} className="border rounded-lg" />
                        <p className="text-sm text-muted-foreground mt-3 text-center break-all max-w-full">
                          {getPublicLink(link.share_token)}
                        </p>
                      </div>
                      <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleDownloadQR(link.share_token, link.title)}
                          className="w-full sm:w-auto"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {language === 'th' ? 'ดาวน์โหลด' : 'Download'}
                        </Button>
                        <Button
                          onClick={() => handleShareLink(link.share_token, link.title)}
                          className="w-full sm:w-auto"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          {language === 'th' ? 'แชร์' : 'Share'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => window.open(getPublicLink(link.share_token), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    {language === 'th' ? 'เปิดลิงก์' : 'Open'}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        {language === 'th' ? 'ลบ' : 'Delete'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {language === 'th' ? 'ยืนยันการลบ' : 'Confirm Delete'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {language === 'th' 
                            ? `คุณต้องการลบลิงก์ "${link.title}" หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`
                            : `Are you sure you want to delete "${link.title}"? This action cannot be undone.`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteLink(link.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {language === 'th' ? 'ลบ' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
