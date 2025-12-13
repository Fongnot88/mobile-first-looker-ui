import * as React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DialogVariant = "success" | "error" | "warning" | "info";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: DialogVariant;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-green-500",
    bgClass: "bg-green-50 dark:bg-green-900/20",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-500",
    bgClass: "bg-red-50 dark:bg-red-900/20",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50 dark:bg-amber-900/20",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-50 dark:bg-blue-900/20",
  },
};

export function SuccessDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = "success",
  autoClose = true,
  autoCloseDelay = 2000,
}: SuccessDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  React.useEffect(() => {
    if (open && autoClose) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [open, autoClose, autoCloseDelay, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader className="items-center text-center">
          <div className={cn("p-3 rounded-full mb-2", config.bgClass)}>
            <Icon className={cn("h-8 w-8", config.iconClass)} />
          </div>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-center">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex justify-center mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            ตกลง
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
