
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';

interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  is_trial: boolean;
  trial_end_date: string | null;
  subscription_end_date: string | null;
}

export const useSubscription = () => {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchSubscription();
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [user, isLoaded]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('clerk_user_id', user!.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data);
      setHasActiveSubscription(!!data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    subscription,
    loading,
    hasActiveSubscription,
    refetch: fetchSubscription
  };
};
