import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Activity, 
  Clock, 
  CloudRain, 
  AlertTriangle, 
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Navigation
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import GlassCard from '@/components/GlassCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  trafficImpact: number;
}

const trendData = [
  { hour: '6AM', congestion: 20 },
  { hour: '8AM', congestion: 75 },
  { hour: '10AM', congestion: 45 },
  { hour: '12PM', congestion: 55 },
  { hour: '2PM', congestion: 40 },
  { hour: '4PM', congestion: 65 },
  { hour: '6PM', congestion: 85 },
  { hour: '8PM', congestion: 35 },
];

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  suffix?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color: 'cyan' | 'green' | 'yellow' | 'red';
  delay: number;
}

const StatCard = ({ icon: Icon, title, value, suffix = '', trend, trendValue, color, delay }: StatCardProps) => {
  const colorClasses = {
    cyan: 'from-primary/20 to-secondary/20 text-primary',
    green: 'from-traffic-low/20 to-emerald-500/20 text-traffic-low',
    yellow: 'from-traffic-medium/20 to-amber-500/20 text-traffic-medium',
    red: 'from-traffic-high/20 to-rose-500/20 text-traffic-high',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'down' ? 'text-traffic-low' : trend === 'up' ? 'text-traffic-high' : 'text-muted-foreground';

  return (
    <GlassCard delay={delay} className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <AnimatedCounter value={value} suffix={suffix} />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </GlassCard>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [alerts, setAlerts] = useState<{ id: number; type: string; message: string; time: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({
              lat: latitude,
              lng: longitude,
              address: 'Current Location'
            });

            // Fetch weather data
            const { data: weatherData, error } = await supabase.functions.invoke('get-weather', {
              body: { lat: latitude, lon: longitude }
            });

            if (!error && weatherData) {
              setWeather({
                temperature: weatherData.temperature,
                condition: weatherData.condition,
                humidity: weatherData.humidity,
                trafficImpact: weatherData.trafficImpact || 15
              });

              // Generate dynamic alerts based on weather
              const dynamicAlerts = generateAlerts(weatherData);
              setAlerts(dynamicAlerts);
            }
            setLoading(false);
          },
          () => {
            // Use default location on error
            setLocation({
              lat: 40.7128,
              lng: -74.0060,
              address: 'Downtown Financial District'
            });
            setLoading(false);
          }
        );
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const generateAlerts = (weatherData: WeatherData) => {
    const alerts = [];
    const now = new Date();
    const hour = now.getHours();

    // Weather-based alerts
    if (weatherData.condition?.toLowerCase().includes('rain')) {
      alerts.push({
        id: 1,
        type: 'warning',
        message: `Rain expected - roads may be slippery. Current: ${Math.round(weatherData.temperature)}°C`,
        time: 'Now'
      });
    }

    // Time-based traffic alerts
    if (hour >= 7 && hour <= 9) {
      alerts.push({
        id: 2,
        type: 'warning',
        message: 'Morning rush hour - expect 15-25 min delays on major routes',
        time: '5 min ago'
      });
    } else if (hour >= 16 && hour <= 19) {
      alerts.push({
        id: 3,
        type: 'warning',
        message: 'Evening rush hour - congestion on highways',
        time: '2 min ago'
      });
    }

    // Always add a success alert
    alerts.push({
      id: 4,
      type: 'success',
      message: 'AI route optimization active - monitoring conditions',
      time: '1 min ago'
    });

    return alerts;
  };

  const handleNavigateNow = () => {
    navigate('/map');
  };

  const getCongestionLevel = () => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 9) return 68;
    if (hour >= 16 && hour <= 19) return 75;
    if (hour >= 22 || hour <= 5) return 15;
    return 42;
  };

  const getAIRiskScore = () => {
    const baseScore = 20;
    const weatherPenalty = weather?.condition?.toLowerCase().includes('rain') ? 15 : 0;
    const timePenalty = new Date().getHours() >= 16 && new Date().getHours() <= 19 ? 10 : 0;
    return Math.min(baseScore + weatherPenalty + timePenalty, 100);
  };

  const congestionLevel = getCongestionLevel();
  const aiRiskScore = getAIRiskScore();

  const getCongestLevel = (value: number) => {
    if (value < 30) return { label: 'Low', class: 'text-traffic-low' };
    if (value < 60) return { label: 'Moderate', class: 'text-traffic-medium' };
    return { label: 'High', class: 'text-traffic-high' };
  };

  const congestion = getCongestLevel(congestionLevel);

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-10 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Traffic <span className="text-gradient">Intelligence</span>
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{location?.address || 'Loading location...'}</span>
              <span className="text-primary">•</span>
              <span>Updated just now</span>
              {weather && (
                <>
                  <span className="text-primary">•</span>
                  <span>{Math.round(weather.temperature)}°C, {weather.condition}</span>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <StatCard
              icon={Brain}
              title="AI Risk Score"
              value={aiRiskScore}
              suffix="%"
              trend="down"
              trendValue="5%"
              color="cyan"
              delay={0}
            />
            <StatCard
              icon={Activity}
              title="Congestion Level"
              value={congestionLevel}
              suffix="%"
              trend={congestionLevel > 50 ? 'up' : 'down'}
              trendValue={congestionLevel > 50 ? '12%' : '8%'}
              color={congestionLevel < 30 ? 'green' : congestionLevel < 60 ? 'yellow' : 'red'}
              delay={0.1}
            />
            <StatCard
              icon={Clock}
              title="Est. Delay"
              value={Math.round(congestionLevel * 0.25)}
              suffix=" min"
              trend="stable"
              trendValue="0%"
              color="yellow"
              delay={0.2}
            />
            <StatCard
              icon={CloudRain}
              title="Weather Impact"
              value={weather?.trafficImpact || 15}
              suffix="%"
              trend={weather?.condition?.toLowerCase().includes('rain') ? 'up' : 'stable'}
              trendValue="3%"
              color="cyan"
              delay={0.3}
            />
            <StatCard
              icon={AlertTriangle}
              title="Accident Risk"
              value={Math.round(aiRiskScore * 0.4)}
              suffix="%"
              trend="down"
              trendValue="2%"
              color="green"
              delay={0.4}
            />
            <StatCard
              icon={MapPin}
              title="Active Routes"
              value={3}
              color="cyan"
              delay={0.5}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Traffic Trend Chart */}
            <GlassCard delay={0.3} className="lg:col-span-2 p-6">
              <h3 className="text-lg font-semibold mb-4">Today's Traffic Pattern</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {trendData.map((item, index) => (
                  <motion.div
                    key={item.hour}
                    initial={{ height: 0 }}
                    animate={{ height: `${item.congestion}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6, type: 'spring' }}
                    className="flex-1 rounded-t-lg relative group cursor-pointer"
                    style={{
                      background: item.congestion < 30 
                        ? 'linear-gradient(to top, hsl(142 76% 46% / 0.3), hsl(142 76% 46% / 0.1))'
                        : item.congestion < 60
                        ? 'linear-gradient(to top, hsl(45 93% 47% / 0.3), hsl(45 93% 47% / 0.1))'
                        : 'linear-gradient(to top, hsl(0 72% 51% / 0.3), hsl(0 72% 51% / 0.1))',
                      borderTop: `3px solid ${item.congestion < 30 ? 'hsl(142 76% 46%)' : item.congestion < 60 ? 'hsl(45 93% 47%)' : 'hsl(0 72% 51%)'}`
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="glass-card px-2 py-1 text-xs whitespace-nowrap">
                        {item.congestion}% congestion
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {trendData.map((item) => (
                  <span key={item.hour} className="flex-1 text-center">{item.hour}</span>
                ))}
              </div>
            </GlassCard>

            {/* Live Alerts */}
            <GlassCard delay={0.4} className="p-6">
              <h3 className="text-lg font-semibold mb-4">Live Alerts</h3>
              <div className="space-y-3">
                {alerts.length > 0 ? alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      alert.type === 'warning' 
                        ? 'bg-traffic-medium/10 border-traffic-medium/30' 
                        : alert.type === 'success'
                        ? 'bg-traffic-low/10 border-traffic-low/30'
                        : 'bg-primary/10 border-primary/30'
                    }`}
                  >
                    <p className="text-sm mb-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </motion.div>
                )) : (
                  <p className="text-sm text-muted-foreground">No alerts at this time</p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Current Status Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6"
          >
            <GlassCard hover={false} className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full animate-pulse ${
                    congestionLevel < 30 ? 'bg-traffic-low' : 
                    congestionLevel < 60 ? 'bg-traffic-medium' : 'bg-traffic-high'
                  }`} />
                  <div>
                    <h4 className="font-semibold">
                      Current Traffic Status: <span className={congestion.class}>{congestion.label}</span>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {congestionLevel < 30 
                        ? 'Clear roads ahead - great time to travel'
                        : congestionLevel < 60 
                        ? 'AI recommends taking the scenic route via Riverside Drive'
                        : 'Consider delaying your trip or using public transit'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNavigateNow}
                  className="glow-button text-sm py-2 px-6 flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate Now
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
