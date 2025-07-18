
import { supabase } from "@/integrations/supabase/client";
import { DeviceInfo } from "../types";

export const fetchDevicesWithDetails = async (userId?: string, isAdmin?: boolean, isSuperAdmin?: boolean): Promise<DeviceInfo[]> => {
  console.log("Fetching devices with details using optimized database function...");
  
  try {
    // Get current user if not provided
    let currentUserId = userId;
    let currentUser = null;
    
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        return [];
      }
      currentUserId = user.id;
      currentUser = user;
    }

    // Check user role if not provided
    let userIsSuperAdmin = isSuperAdmin;
    let userIsAdmin = isAdmin;
    
    if (userIsSuperAdmin === undefined || userIsAdmin === undefined) {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUserId);

      userIsSuperAdmin = userRoles?.some(role => role.role === 'superadmin') || false;
      userIsAdmin = userRoles?.some(role => role.role === 'admin') || false;
    }

    console.log(`User roles - isSuperAdmin: ${userIsSuperAdmin}, isAdmin: ${userIsAdmin}`);

    let devices: DeviceInfo[] = [];

    try {
      // Try the main optimized function first
      console.log(`Calling get_devices_with_details for ${userIsSuperAdmin ? 'SuperAdmin' : userIsAdmin ? 'Admin' : 'Regular User'}`);
      
      const { data, error } = await supabase.rpc('get_devices_with_details', {
        user_id_param: currentUserId,
        is_admin_param: userIsAdmin && !userIsSuperAdmin,
        is_superadmin_param: userIsSuperAdmin
      });
      
      if (error) {
        console.error("Error from database function:", error);
        throw error;
      }
      
      devices = data || [];
      console.log(`✅ Successfully fetched ${devices.length} devices from main function`);
      
    } catch (mainError) {
      console.error("❌ Main function failed, trying emergency fallback:", mainError);
      
      // Emergency fallback - try the emergency function
      try {
        const { data: emergencyData, error: emergencyError } = await supabase.rpc('get_devices_emergency_fallback');
        
        if (emergencyError) {
          console.error("❌ Emergency fallback also failed:", emergencyError);
          return [];
        }
        
        devices = emergencyData || [];
        console.log(`🚑 Emergency fallback returned ${devices.length} devices`);
        
      } catch (emergencyError) {
        console.error("❌ Emergency fallback completely failed:", emergencyError);
        return [];
      }
    }

    console.log(`✅ Final result: ${devices.length} devices`);
    console.log("Device codes found:", devices.map(d => d.device_code));
    
    return devices;
  } catch (error) {
    console.error("❌ Outer error in fetchDevicesWithDetails:", error);
    return [];
  }
};

export const fetchDeviceCount = async (): Promise<number> => {
  console.log("Counting unique devices using optimized function...");
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No authenticated user found for count");
      return 0;
    }

    // Check user role
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isSuperAdmin = userRoles?.some(role => role.role === 'superadmin');
    const isAdmin = userRoles?.some(role => role.role === 'admin');

    let count = 0;

    try {
      // Use the main function to get count
      const { data, error } = await supabase.rpc('get_devices_with_details', {
        user_id_param: user.id,
        is_admin_param: isAdmin && !isSuperAdmin,
        is_superadmin_param: isSuperAdmin
      });
      
      if (error) throw error;
      count = data?.length || 0;
    } catch (error) {
      console.error("❌ Error counting devices, using fallback:", error);
      // Fallback count method
      if (isSuperAdmin || isAdmin) {
        const { data: fallbackData } = await supabase
          .from('rice_quality_analysis')
          .select('device_code', { count: 'exact', head: true });
        count = fallbackData?.length || 0;
      } else {
        const { data: accessibleDevices } = await supabase
          .from('user_device_access')
          .select('device_code')
          .eq('user_id', user.id);
        count = accessibleDevices?.length || 0;
      }
    }

    console.log(`Found ${count} unique devices using optimized function`);
    return count;
  } catch (error) {
    console.error("❌ Error counting devices:", error);
    return 0;
  }
};
