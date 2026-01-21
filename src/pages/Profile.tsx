import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  MapPin, 
  Clock,
  Zap,
  Settings,
  ChevronRight,
  Star,
  Award,
  LogOut,
  Loader2,
  Save
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import GlassCard from '@/components/GlassCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileData {
  display_name: string | null;
  location: string | null;
  notifications_traffic_alerts: boolean;
  notifications_weather_updates: boolean;
  notifications_route_suggestions: boolean;
  privacy_share_location: boolean;
  privacy_analytics: boolean;
  privacy_personalization: boolean;
  appearance_dark_mode: boolean;
  appearance_animations: boolean;
  appearance_compact_view: boolean;
  routes_optimized: number;
  time_saved_hours: number;
  ai_predictions: number;
  accuracy_score: number;
  created_at: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setNewDisplayName(data.display_name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof ProfileData, value: boolean | string) => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [key]: value })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, [key]: value } : null);
      toast.success('Setting updated');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDisplayName = async () => {
    if (!newDisplayName.trim()) return;
    await updateSetting('display_name', newDisplayName.trim());
    setEditingName(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const getMemberSince = () => {
    if (!profile?.created_at) return 'New Member';
    const date = new Date(profile.created_at);
    return `Smart Commuter since ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  const userStats = [
    { label: 'Routes Optimized', value: profile?.routes_optimized || 0, icon: MapPin },
    { label: 'Time Saved', value: profile?.time_saved_hours || 0, suffix: 'hrs', icon: Clock },
    { label: 'AI Predictions', value: profile?.ai_predictions || 0, icon: Zap },
    { label: 'Accuracy Score', value: profile?.accuracy_score || 97, suffix: '%', icon: Star },
  ];

  const settings = [
    { 
      category: 'Notifications',
      icon: Bell,
      options: [
        { key: 'notifications_traffic_alerts' as keyof ProfileData, label: 'Traffic Alerts', enabled: profile?.notifications_traffic_alerts ?? true },
        { key: 'notifications_weather_updates' as keyof ProfileData, label: 'Weather Updates', enabled: profile?.notifications_weather_updates ?? true },
        { key: 'notifications_route_suggestions' as keyof ProfileData, label: 'Route Suggestions', enabled: profile?.notifications_route_suggestions ?? false },
      ]
    },
    { 
      category: 'Privacy',
      icon: Shield,
      options: [
        { key: 'privacy_share_location' as keyof ProfileData, label: 'Share Location', enabled: profile?.privacy_share_location ?? true },
        { key: 'privacy_analytics' as keyof ProfileData, label: 'Analytics', enabled: profile?.privacy_analytics ?? true },
        { key: 'privacy_personalization' as keyof ProfileData, label: 'Personalization', enabled: profile?.privacy_personalization ?? true },
      ]
    },
    { 
      category: 'Appearance',
      icon: Palette,
      options: [
        { key: 'appearance_dark_mode' as keyof ProfileData, label: 'Dark Mode', enabled: profile?.appearance_dark_mode ?? true },
        { key: 'appearance_animations' as keyof ProfileData, label: 'Animations', enabled: profile?.appearance_animations ?? true },
        { key: 'appearance_compact_view' as keyof ProfileData, label: 'Compact View', enabled: profile?.appearance_compact_view ?? false },
      ]
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <GlassCard delay={0} className="p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User className="w-12 h-12 text-background" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-traffic-low flex items-center justify-center border-4 border-background">
                  <Award className="w-4 h-4 text-background" />
                </div>
              </motion.div>
              <div className="text-center md:text-left flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      className="text-2xl font-bold bg-muted/50 border border-border/50 rounded-lg px-3 py-1 focus:outline-none focus:border-primary/50"
                      autoFocus
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveDisplayName}
                      disabled={saving}
                      className="p-2 rounded-lg bg-primary text-primary-foreground"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </motion.button>
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold mb-1">{profile?.display_name || 'Smart Commuter'}</h1>
                )}
                <p className="text-muted-foreground mb-1">{user?.email}</p>
                <p className="text-muted-foreground mb-3 text-sm">{getMemberSince()}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium">
                    Pro Member
                  </span>
                  <span className="px-3 py-1 rounded-full bg-traffic-low/10 border border-traffic-low/30 text-traffic-low text-xs font-medium">
                    Time Saver
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditingName(true)}
                className="glow-button-outline py-2 px-4 text-sm"
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Edit Profile
              </motion.button>
            </div>
          </GlassCard>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {userStats.map((stat, index) => (
              <GlassCard key={stat.label} delay={index * 0.1} className="p-4 text-center">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <AnimatedCounter 
                  value={stat.value} 
                  suffix={stat.suffix || ''} 
                  decimals={stat.suffix === 'hrs' ? 1 : 0}
                  className="text-2xl"
                />
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </GlassCard>
            ))}
          </div>

          {/* Settings */}
          <GlassCard delay={0.3} className="p-6">
            <h2 className="text-lg font-semibold mb-6">Settings</h2>
            <div className="space-y-6">
              {settings.map((section, sectionIndex) => (
                <motion.div
                  key={section.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + sectionIndex * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <section.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">{section.category}</h3>
                  </div>
                  <div className="space-y-2 pl-7">
                    {section.options.map((option) => (
                      <div
                        key={option.key}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                        onClick={() => updateSetting(option.key, !option.enabled)}
                      >
                        <span className="text-sm">{option.label}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${
                            option.enabled ? 'bg-primary' : 'bg-muted'
                          }`}>
                            <motion.div
                              initial={false}
                              animate={{ x: option.enabled ? 16 : 0 }}
                              className="w-4 h-4 rounded-full bg-background"
                            />
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Logout Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleLogout}
              className="w-full p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </motion.button>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 p-4 rounded-xl border border-traffic-high/30 bg-traffic-high/5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-traffic-high">Danger Zone</h4>
                <p className="text-sm text-muted-foreground">Irreversible actions</p>
              </div>
              <button className="text-sm text-traffic-high hover:underline">
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
