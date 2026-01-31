
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useGuestMode } from "@/hooks/useGuestMode";
import { supabase } from "@/integrations/supabase/client";

export const useDeviceAccess = (deviceCode: string | undefined) => {
  const { user, userRoles } = useAuth();
  const { isGuest } = useGuestMode();
  const isAdmin = userRoles.includes('admin');
  const isSuperAdmin = userRoles.includes('superadmin');

  // Check device access permissions for authenticated users directly from user_device_access table
  // This supports both rice quality meters AND moisture meters
  const {
    data: accessibleDeviceCodes,
    isLoading: isCheckingAccess
  } = useQuery({
    queryKey: ['userDeviceAccess', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_device_access')
        .select('device_code')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user device access:', error);
        return [];
      }

      return data?.map(item => item.device_code) || [];
    },
    enabled: !!user && !isGuest && !isAdmin && !isSuperAdmin
  });

  // Check guest device access
  const {
    data: guestAccessibleDevices,
    isLoading: isCheckingGuestAccess
  } = useQuery({
    queryKey: ['guestDeviceAccess'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guest_device_access')
        .select('device_code')
        .eq('enabled', true);

      if (error) {
        console.error('Error fetching guest device access:', error);
        return [];
      }

      return data?.map(item => ({ device_code: item.device_code })) || [];
    },
    enabled: isGuest
  });

  // Check if user has access to the current device
  let hasDeviceAccess = false;

  if (isGuest) {
    // For guests, check guest_device_access
    hasDeviceAccess = guestAccessibleDevices?.some(device => device.device_code === deviceCode) ?? false;
  } else {
    // For authenticated users, admin and superadmin have access to all devices
    if (isAdmin || isSuperAdmin) {
      hasDeviceAccess = true; // Admin and SuperAdmin have access to all devices
    } else {
      // Allow access to all moisture meter devices (starting with 'mm') for all users
      // This allows every role to view moisture meter graphs
      if (deviceCode?.toLowerCase().startsWith('mm')) {
        hasDeviceAccess = true;
      } else {
        // Regular users need to check their specific device access from user_device_access table
        hasDeviceAccess = accessibleDeviceCodes?.includes(deviceCode || '') ?? false;
      }
    }
  }

  // Also allow guests to access moisture meters if needed (based on "all levels" request)
  if (isGuest && deviceCode?.toLowerCase().startsWith('mm')) {
    hasDeviceAccess = true;
  }

  const isLoading = (isGuest && isCheckingGuestAccess) || (!isGuest && isCheckingAccess);

  return {
    hasDeviceAccess,
    isLoading,
    isGuest,
    isAdmin,
    isSuperAdmin
  };
};
