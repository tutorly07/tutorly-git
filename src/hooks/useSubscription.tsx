
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';

export interface Subscription {
  id: string;
  clerk_user_id: string;
  plan_name: string;
  status: string;
  is_trial: boolean;
  trial_end_date?: string;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('clerk_user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const createTrialSubscription = async (planName: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 4); // 4-day trial

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          clerk_user_id: user.id,
          plan_name: planName,
          status: 'active',
          is_trial: true,
          trial_end_date: trialEndDate.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setSubscription(data);
      return true;
    } catch (error) {
      console.error('Error creating trial subscription:', error);
      return false;
    }
  };

  const hasActiveSubscription = Boolean(subscription && subscription.status === 'active');

  return {
    subscription,
    loading,
    hasActiveSubscription,
    refetch: fetchSubscription,
    createTrialSubscription
  };
};
