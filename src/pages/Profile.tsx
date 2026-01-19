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
  Award
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import GlassCard from '@/components/GlassCard';
import AnimatedCounter from '@/components/AnimatedCounter';

const userStats = [
  { label: 'Routes Optimized', value: 247, icon: MapPin },
  { label: 'Time Saved', value: 18.5, suffix: 'hrs', icon: Clock },
  { label: 'AI Predictions', value: 892, icon: Zap },
  { label: 'Accuracy Score', value: 97, suffix: '%', icon: Star },
];

const settings = [
  { 
    category: 'Notifications',
    icon: Bell,
    options: [
      { label: 'Traffic Alerts', enabled: true },
      { label: 'Weather Updates', enabled: true },
      { label: 'Route Suggestions', enabled: false },
    ]
  },
  { 
    category: 'Privacy',
    icon: Shield,
    options: [
      { label: 'Share Location', enabled: true },
      { label: 'Analytics', enabled: true },
      { label: 'Personalization', enabled: true },
    ]
  },
  { 
    category: 'Appearance',
    icon: Palette,
    options: [
      { label: 'Dark Mode', enabled: true },
      { label: 'Animations', enabled: true },
      { label: 'Compact View', enabled: false },
    ]
  },
];

const Profile = () => {
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
                transition={{ type: 'spring' as const, damping: 15 }}
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
                <h1 className="text-2xl font-bold mb-1">Alex Navigator</h1>
                <p className="text-muted-foreground mb-3">Smart Commuter since Jan 2024</p>
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
                        key={option.label}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
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
