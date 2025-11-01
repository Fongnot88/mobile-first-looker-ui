import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EquipmentTabsProps {
  className?: string;
  defaultValue?: string;
}

export const EquipmentTabs = ({
  className,
  defaultValue = "devices",
}: EquipmentTabsProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // กำหนดค่าเริ่มต้นตาม URL ปัจจุบัน
  const getActiveTab = () => {
    if (location.pathname === "/equipment/moisture-meter") {
      return "moisture-meter";
    }
    return "devices";
  };

  const [activeTab, setActiveTab] = React.useState(getActiveTab());

  React.useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    switch (value) {
      case "devices":
        navigate("/equipment");
        break;
      case "moisture-meter":
        navigate("/equipment/moisture-meter");
        break;
      default:
        navigate("/equipment");
    }
  };

  return (
    <Tabs
      value={activeTab}
      className={cn("w-full", className)}
      onValueChange={handleTabChange}
    >
      <TabsList className="grid w-full grid-cols-2 h-12 bg-white border border-gray-200 rounded-lg p-1">
        <TabsTrigger 
          value="devices"
          className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md text-sm font-medium"
        >
          รายการอุปกรณ์
        </TabsTrigger>
        <TabsTrigger 
          value="moisture-meter"
          className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-md text-sm font-medium"
        >
          เครื่องวัดความชื้นข้าว
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
