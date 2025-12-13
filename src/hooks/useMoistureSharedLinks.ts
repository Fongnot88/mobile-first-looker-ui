import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { getBaseUrl } from '@/utils/platform';

interface MoistureSharedLink {
  id: string;
  reading_id: string;
  user_id: string;
  share_token: string;
  title: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useMoistureSharedLinks = () => {
  const [sharedLinks, setSharedLinks] = useState<MoistureSharedLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchSharedLinks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shared_moisture_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSharedLinks(data || []);
    } catch (error) {
      console.error('Error fetching moisture shared links:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSharedLink = async (readingId: string, title: string) => {
    if (!user) {
      console.error('User not authenticated');
      throw new Error('กรุณาเข้าสู่ระบบก่อนแชร์ข้อมูล');
    }

    const shareToken = generateShareToken();
    
    try {
      console.log('Creating moisture shared link for reading ID:', readingId);
      const { data, error } = await supabase
        .from('shared_moisture_links')
        .insert({
          reading_id: readingId,
          user_id: user.id,
          share_token: shareToken,
          title,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Successfully created moisture shared link:', data);
      setSharedLinks(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating moisture shared link:', error);
      throw error;
    }
  };

  const updateSharedLink = async (id: string, updates: Partial<Pick<MoistureSharedLink, 'title' | 'is_active'>>) => {
    try {
      const { data, error } = await supabase
        .from('shared_moisture_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSharedLinks(prev => 
        prev.map(link => link.id === id ? data : link)
      );
      return data;
    } catch (error) {
      console.error('Error updating moisture shared link:', error);
      return null;
    }
  };

  const deleteSharedLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shared_moisture_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSharedLinks(prev => prev.filter(link => link.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting moisture shared link:', error);
      return false;
    }
  };

  const getPublicLink = (shareToken: string) => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/shared-moisture/${shareToken}`;
  };

  useEffect(() => {
    if (user) {
      fetchSharedLinks();
    }
  }, [user]);

  return {
    sharedLinks,
    loading,
    createSharedLink,
    updateSharedLink,
    deleteSharedLink,
    getPublicLink,
    refetch: fetchSharedLinks,
  };
};

const generateShareToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
