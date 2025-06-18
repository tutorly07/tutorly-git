
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';

export const useStudyTracking = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalStudyTime: 0,
    materialsCreated: 0,
    notesCreated: 0,
    sessionsCompleted: 0
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch study sessions
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('duration')
        .eq('clerk_user_id', user.id);

      // Fetch materials count
      const { data: materials } = await supabase
        .from('study_materials')
        .select('id')
        .eq('clerk_user_id', user.id);

      // Fetch notes count
      const { data: notes } = await supabase
        .from('notes')
        .select('id')
        .eq('clerk_user_id', user.id);

      const totalStudyTime = sessions?.reduce((acc, session) => acc + (session.duration || 0), 0) || 0;

      setStats({
        totalStudyTime,
        materialsCreated: materials?.length || 0,
        notesCreated: notes?.length || 0,
        sessionsCompleted: sessions?.length || 0
      });
    } catch (error) {
      console.error('Error fetching study stats:', error);
    }
  };

  const trackActivity = async (activityType: string, metadata: any = {}) => {
    if (!user) return;

    try {
      await supabase
        .from('user_activity_logs')
        .insert([{
          clerk_user_id: user.id,
          activity_type: activityType,
          metadata,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  return {
    stats,
    trackActivity,
    refetchStats: fetchStats
  };
};
