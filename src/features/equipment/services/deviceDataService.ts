
import { supabase } from "@/integrations/supabase/client";
import { DeviceInfo } from "../types";
import { userRoleService } from "@/utils/auth/userRoleService";

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

    // Check user role if not provided - use cached service
    let userIsSuperAdmin = isSuperAdmin;
    let userIsAdmin = isAdmin;

    if (userIsSuperAdmin === undefined || userIsAdmin === undefined) {
      const userRoles = await userRoleService.getUserRoles(currentUserId);
      userIsSuperAdmin = userRoles.includes('superadmin');
      userIsAdmin = userRoles.includes('admin');
    }

    console.log(`User roles - isSuperAdmin: ${userIsSuperAdmin}, isAdmin: ${userIsAdmin}`);

    let devices: DeviceInfo[] = [];

    // SuperAdmin and Admin have different permissions now
    if (userIsSuperAdmin || userIsAdmin) {
      console.log(`Fetching devices for ${userIsSuperAdmin ? 'SuperAdmin' : 'Admin'} using database function...`);
      const { data, error } = await supabase.rpc('get_devices_with_details', {
        user_id_param: currentUserId,
        is_admin_param: userIsAdmin && !userIsSuperAdmin, // Only true for admin, not superadmin
        is_superadmin_param: userIsSuperAdmin // Only true for superadmin
      });
      if (error) {
        console.error("Error from database function:", error);
        throw error;
      }
      devices = data || [];
      console.log(`${userIsSuperAdmin ? 'SuperAdmin' : 'Admin'}: Found ${devices.length} devices from database function`);
    } else {
      // Regular users see devices they have access to OR devices in guest_device_access that are enabled
      console.log("Fetching devices for regular user...");

      const { data: accessibleDevices, error: accessError } = await supabase
        .from('user_device_access')
        .select('device_code')
        .eq('user_id', currentUserId);

      if (accessError) throw accessError;

      const { data: guestDevices, error: guestError } = await supabase
        .from('guest_device_access')
        .select('device_code')
        .eq('enabled', true);

      if (guestError) throw guestError;

      // Also get all moisture meters (starting with 'mm')
      const { data: moistureMeters, error: mmError } = await supabase
        .from('device_settings')
        .select('device_code')
        .ilike('device_code', 'mm%');

      if (mmError) {
        console.error("Error fetching moisture meters:", mmError);
        // Continue without moisture meters if error
      }

      // Combine accessible devices and enabled guest devices and moisture meters
      const allAccessibleDeviceCodes = [
        ...(accessibleDevices?.map(d => d.device_code) || []),
        ...(guestDevices?.map(d => d.device_code) || []),
        ...(moistureMeters?.map(d => d.device_code) || [])
      ];

      const uniqueDeviceCodes = [...new Set(allAccessibleDeviceCodes)];
      console.log(`Regular user: Found ${uniqueDeviceCodes.length} accessible device codes`);

      if (uniqueDeviceCodes.length > 0) {
        // Use database function and filter results
        const { data, error } = await supabase.rpc('get_devices_with_details', {
          user_id_param: currentUserId,
          is_admin_param: false,
          is_superadmin_param: false
        });
        if (error) throw error;

        // Filter to only show devices they have access to
        devices = (data || []).filter(device =>
          uniqueDeviceCodes.includes(device.device_code)
        );
      }
      console.log(`Regular user: Filtered to ${devices.length} devices`);
    }

    console.log(`✅ Successfully fetched ${devices.length} devices with details`);
    console.log("Device codes found:", devices.map(d => d.device_code));

    return devices;
  } catch (error) {
    console.error("❌ Error fetching devices with details:", error);
    return [];
  }
};

export const fetchDeviceCount = async (): Promise<number> => {
  console.log("Counting unique devices using optimized function...");

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No authenticated user found");
      return 0;
    }

    // Check user role - use cached service
    const userRoles = await userRoleService.getUserRoles(user.id);
    const isSuperAdmin = userRoles.includes('superadmin');
    const isAdmin = userRoles.includes('admin');

    let count = 0;

    // SuperAdmin and Admin have different permissions
    if (isSuperAdmin || isAdmin) {
      const { data, error } = await supabase.rpc('get_devices_with_details', {
        user_id_param: user.id,
        is_admin_param: isAdmin && !isSuperAdmin, // Only true for admin, not superadmin
        is_superadmin_param: isSuperAdmin // Only true for superadmin
      });
      if (error) throw error;
      count = data?.length || 0;
    } else {
      // Regular users see devices they have access to OR devices in guest_device_access that are enabled
      const { data: accessibleDevices, error: accessError } = await supabase
        .from('user_device_access')
        .select('device_code')
        .eq('user_id', user.id);

      if (accessError) throw accessError;

      const { data: guestDevices, error: guestError } = await supabase
        .from('guest_device_access')
        .select('device_code')
        .eq('enabled', true);

      if (guestError) throw guestError;

      // Also get all moisture meters (starting with 'mm')
      const { data: moistureMeters, error: mmError } = await supabase
        .from('device_settings')
        .select('device_code')
        .ilike('device_code', 'mm%');

      // Combine accessible devices and enabled guest devices and moisture meters
      const allAccessibleDeviceCodes = [
        ...(accessibleDevices?.map(d => d.device_code) || []),
        ...(guestDevices?.map(d => d.device_code) || []),
        ...(moistureMeters?.map(d => d.device_code) || [])
      ];

      count = new Set(allAccessibleDeviceCodes).size;
    }

    console.log(`Found ${count} unique devices using optimized function`);
    return count;
  } catch (error) {
    console.error("❌ Error counting devices:", error);
    return 0;
  }
};
