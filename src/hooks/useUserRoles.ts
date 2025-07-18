import { useState, useCallback } from "react";
import { userRoleService } from "@/utils/auth/userRoleService";

export const useUserRoles = () => {
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Function to fetch user roles with caching
  const fetchUserRoles = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    return await userRoleService.getUserRoles(userId, forceRefresh);
  }, []);

  // Clear roles cache on signout
  const clearRolesCache = useCallback(() => {
    userRoleService.clearAllCache();
    setUserRoles([]);
  }, []);

  return {
    userRoles,
    setUserRoles,
    fetchUserRoles,
    clearRolesCache,
  };
};