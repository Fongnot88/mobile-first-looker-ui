
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DeviceList } from "./DeviceList";
import { fetchDevicesWithDetails } from "@/features/equipment/services/deviceDataService";

interface Device {
  device_code: string;
  display_name?: string;
}

interface User {
  id: string;
  email: string;
}

export const AccessMapping = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deviceUserMap, setDeviceUserMap] = useState<Record<string, string[]>>({});
  const [userDetailsMap, setUserDetailsMap] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user, userRoles } = useAuth();
  const { toast } = useToast();
  
  const isSuperAdmin = userRoles.includes('superadmin');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all devices using the same method as Equipment page
      const fetchedDevices = await fetchDevicesWithDetails(user?.id, true, isSuperAdmin);

      // Transform to match Device interface with display names
      const devicesList = fetchedDevices.map(device => ({
        device_code: device.device_code,
        display_name: device.display_name || undefined
      }));

      setDevices(devicesList);

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email')
        .order('email');

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Create user details map for quick lookup
      const userMap: Record<string, User> = {};
      (usersData || []).forEach(userData => {
        userMap[userData.id] = userData;
      });
      setUserDetailsMap(userMap);

      // Get user roles for all users using RPC function
      const userRoleMap: Record<string, string[]> = {};
      
      // Fetch roles for each user
      for (const userData of (usersData || [])) {
        try {
          const { data: rolesData, error: roleError } = await supabase.rpc('get_user_roles', {
            user_id: userData.id
          });
          
          if (!roleError && rolesData) {
            userRoleMap[userData.id] = rolesData;
          } else {
            userRoleMap[userData.id] = [];
          }
        } catch (error) {
          console.error(`Error fetching roles for user ${userData.id}:`, error);
          userRoleMap[userData.id] = [];
        }
      }

      // Fetch explicit device-user mappings
      const { data: accessData, error: accessError } = await supabase
        .from('user_device_access')
        .select('user_id, device_code');

      if (accessError) throw accessError;

      // Create device-user mapping including both explicit and implicit access
      const deviceMap: Record<string, string[]> = {};
      
      // Initialize all devices with empty arrays
      devicesList.forEach(device => {
        deviceMap[device.device_code] = [];
      });

      // Add users with explicit access
      (accessData || []).forEach(access => {
        if (!deviceMap[access.device_code]) {
          deviceMap[access.device_code] = [];
        }
        if (!deviceMap[access.device_code].includes(access.user_id)) {
          deviceMap[access.device_code].push(access.user_id);
        }
      });

      // Add users with implicit access (admins and superadmins have access to all devices)
      Object.keys(userRoleMap).forEach(userId => {
        const roles = userRoleMap[userId];
        if (roles.includes('admin') || roles.includes('superadmin')) {
          devicesList.forEach(device => {
            if (!deviceMap[device.device_code].includes(userId)) {
              deviceMap[device.device_code].push(userId);
            }
          });
        }
      });

      setDeviceUserMap(deviceMap);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isSuperAdmin) {
      fetchData();
    }
  }, [user, isSuperAdmin]);

  const handleSelectDevice = (deviceCode: string) => {
    // Handle device selection logic here
    console.log('Selected device:', deviceCode);
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DeviceList 
        devices={devices}
        deviceUserMap={deviceUserMap}
        userDetailsMap={userDetailsMap}
        isLoading={isLoading}
        onRefresh={fetchData}
        onSelectDevice={handleSelectDevice}
      />
    </div>
  );
};
