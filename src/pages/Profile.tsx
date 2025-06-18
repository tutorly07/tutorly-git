
import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Trophy, BookOpen, Target } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data || {
        clerk_user_id: user?.id,
        email: user?.primaryEmailAddress?.emailAddress,
        full_name: user?.fullName || '',
        role: 'student'
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Could not load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Could not sign out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  {user?.fullName?.charAt(0) || user?.primaryEmailAddress?.emailAddress?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl text-white">
                {user?.fullName || 'User'}
              </CardTitle>
              <p className="text-white/70">{user?.primaryEmailAddress?.emailAddress}</p>
              <Badge variant="outline" className="text-purple-400 border-purple-400 w-fit mx-auto">
                <Trophy className="w-4 h-4 mr-1" />
                {profile?.role || 'Student'}
              </Badge>
            </CardHeader>
          </Card>

          {/* Profile Details */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center text-white/90">
                  <User className="w-4 h-4 mr-3 text-purple-400" />
                  <span>{user?.fullName || 'Not provided'}</span>
                </div>
                <div className="flex items-center text-white/90">
                  <Mail className="w-4 h-4 mr-3 text-purple-400" />
                  <span>{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                <div className="flex items-center text-white/90">
                  <Calendar className="w-4 h-4 mr-3 text-purple-400" />
                  <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <h3 className="font-semibold text-white">Study Materials</h3>
                <p className="text-2xl font-bold text-purple-400">0</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <h3 className="font-semibold text-white">Quizzes Taken</h3>
                <p className="text-2xl font-bold text-blue-400">0</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <h3 className="font-semibold text-white">Study Hours</h3>
                <p className="text-2xl font-bold text-green-400">0</p>
              </CardContent>
            </Card>
          </div>

          {/* Account Actions */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSignOut}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;
