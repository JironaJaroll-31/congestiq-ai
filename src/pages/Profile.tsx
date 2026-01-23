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
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileData {
  display_name: string | null;
  location: string | null;
  avatar_url: string | null;
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
  const { isDarkMode, setIsDarkMode, animationsEnabled, setAnimationsEnabled, compactView, setCompactView } = useTheme();
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

  // Sync theme context with profile data
  useEffect(() => {
    if (profile) {
      setIsDarkMode(profile.appearance_dark_mode);
      setAnimationsEnabled(profile.appearance_animations);
      setCompactView(profile.appearance_compact_view);
    }
  }, [profile?.appearance_dark_mode, profile?.appearance_animations, profile?.appearance_compact_view]);

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
      
      // Apply theme changes immediately
      if (key === 'appearance_dark_mode') {
        setIsDarkMode(value as boolean);
        toast.success(value ? 'Dark mode enabled' : 'Light mode enabled');
      } else if (key === 'appearance_animations') {
        setAnimationsEnabled(value as boolean);
        toast.success(value ? 'Animations enabled' : 'Animations disabled');
      } else if (key === 'appearance_compact_view') {
        setCompactView(value as boolean);
        toast.success(value ? 'Compact view enabled' : 'Standard view enabled');
      } else {
        toast.success('Setting updated');
      }
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

  const handleAvatarUpdate = (url: string | null) => {
    setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
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
        { key: 'notifications_traffic_alerts' as keyof ProfileData, label: 'Traffic Alerts', description: 'Get notified about traffic on your routes' },
        { key: 'notifications_weather_updates' as keyof ProfileData, label: 'Weather Updates', description: 'Receive weather-related travel advisories' },
        { key: 'notifications_route_suggestions' as keyof ProfileData, label: 'Route Suggestions', description: 'AI-powered route recommendations' },
      ]
    },
    { 
      category: 'Privacy',
      icon: Shield,
      options: [
        { key: 'privacy_share_location' as keyof ProfileData, label: 'Share Location', description: 'Allow location access for accurate routing' },
        { key: 'privacy_analytics' as keyof ProfileData, label: 'Analytics', description: 'Help improve CongestiQ with usage data' },
        { key: 'privacy_personalization' as keyof ProfileData, label: 'Personalization', description: 'Enable personalized route suggestions' },
      ]
    },
    { 
      category: 'Appearance',
      icon: Palette,
      options: [
        { key: 'appearance_dark_mode' as keyof ProfileData, label: 'Dark Mode', description: 'Switch between dark and light themes' },
        { key: 'appearance_animations' as keyof ProfileData, label: 'Animations', description: 'Enable smooth UI animations' },
        { key: 'appearance_compact_view' as keyof ProfileData, label: 'Compact View', description: 'Use smaller spacing and elements' },
      ]
    },
  ];

  const getSettingValue = (key: keyof ProfileData): boolean => {
    if (!profile) return false;
    const value = profile[key];
    return typeof value === 'boolean' ? value : false;
  };

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
              <ProfilePictureUpload
                userId={user?.id || ''}
                currentAvatarUrl={profile?.avatar_url || null}
                onAvatarUpdate={handleAvatarUpdate}
              />
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
                    {section.options.map((option) => {
                      const isEnabled = getSettingValue(option.key);
                      return (
                        <div
                          key={option.key}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                          onClick={() => updateSetting(option.key, !isEnabled)}
                        >
                          <div className="flex-1">
                            <span className="text-sm font-medium">{option.label}</span>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                              isEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
                            }`}>
                              <motion.div
                                initial={false}
                                animate={{ x: isEnabled ? 20 : 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="w-5 h-5 rounded-full bg-background shadow-md"
                              />
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      );
                    })}
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
