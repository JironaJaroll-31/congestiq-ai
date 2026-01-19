import { motion } from 'framer-motion';
import { 
  CloudRain, 
  Cloud, 
  Sun, 
  Wind, 
  Droplets, 
  Thermometer,
  Eye,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import GlassCard from '@/components/GlassCard';
import AnimatedCounter from '@/components/AnimatedCounter';

const currentWeather = {
  condition: 'Partly Cloudy',
  temperature: 72,
  feelsLike: 70,
  humidity: 45,
  windSpeed: 12,
  visibility: 10,
  uvIndex: 6,
};

const forecast = [
  { time: '2PM', temp: 74, icon: Sun, condition: 'Sunny' },
  { time: '4PM', temp: 72, icon: Cloud, condition: 'Cloudy' },
  { time: '6PM', temp: 68, icon: CloudRain, condition: 'Rain' },
  { time: '8PM', temp: 65, icon: CloudRain, condition: 'Rain' },
  { time: '10PM', temp: 62, icon: Cloud, condition: 'Cloudy' },
];

const trafficImpact = [
  { 
    condition: 'Rain Expected', 
    time: '5:00 PM - 9:00 PM',
    impact: '+25%',
    severity: 'high',
    description: 'Heavy congestion expected during rush hour combined with rain',
  },
  { 
    condition: 'Low Visibility', 
    time: '6:30 PM - 8:00 PM',
    impact: '+15%',
    severity: 'medium',
    description: 'Fog may reduce visibility in low-lying areas',
  },
  { 
    condition: 'Wind Advisory', 
    time: 'Tomorrow 6:00 AM',
    impact: '+10%',
    severity: 'low',
    description: 'Strong winds may affect high-profile vehicles on bridges',
  },
];

const WeatherRisk = () => {
  const getImpactColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-traffic-high/50 bg-traffic-high/10';
      case 'medium': return 'border-traffic-medium/50 bg-traffic-medium/10';
      default: return 'border-traffic-low/50 bg-traffic-low/10';
    }
  };

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
              Weather & <span className="text-gradient">Risk Analysis</span>
            </h1>
            <p className="text-muted-foreground">
              AI-powered weather impact predictions for your commute
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Current Weather */}
            <GlassCard delay={0.1} className="lg:col-span-2 p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center"
                  >
                    <Sun className="w-14 h-14 text-yellow-400" />
                  </motion.div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Current Conditions</p>
                    <h2 className="text-4xl font-bold mb-1">
                      <AnimatedCounter value={currentWeather.temperature} suffix="°F" />
                    </h2>
                    <p className="text-lg">{currentWeather.condition}</p>
                    <p className="text-sm text-muted-foreground">
                      Feels like {currentWeather.feelsLike}°F
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Humidity</p>
                      <p className="font-semibold">{currentWeather.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wind className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Wind</p>
                      <p className="font-semibold">{currentWeather.windSpeed} mph</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Visibility</p>
                      <p className="font-semibold">{currentWeather.visibility} mi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">UV Index</p>
                      <p className="font-semibold">{currentWeather.uvIndex}</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Risk Score */}
            <GlassCard delay={0.2} className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-traffic-medium" />
                Weather Risk Score
              </h3>
              <div className="text-center py-6">
                <div className="relative inline-flex items-center justify-center w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                      fill="none"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#riskGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 352" }}
                      animate={{ strokeDasharray: "158 352" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(180 100% 50%)" />
                        <stop offset="100%" stopColor="hsl(45 93% 47%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <AnimatedCounter value={45} suffix="%" className="text-3xl" />
                      <p className="text-xs text-muted-foreground">Impact</p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Moderate weather impact expected during evening commute
                </p>
              </div>
            </GlassCard>

            {/* Hourly Forecast */}
            <GlassCard delay={0.3} className="lg:col-span-3 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Hourly Forecast
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {forecast.map((hour, index) => (
                  <motion.div
                    key={hour.time}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm text-muted-foreground mb-2">{hour.time}</p>
                    <hour.icon className={`w-8 h-8 mx-auto mb-2 ${
                      hour.condition === 'Sunny' ? 'text-yellow-400' :
                      hour.condition === 'Rain' ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                    <p className="font-semibold">{hour.temp}°</p>
                    <p className="text-xs text-muted-foreground">{hour.condition}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* Traffic Impact */}
            <GlassCard delay={0.4} className="lg:col-span-3 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Weather-Traffic Impact Forecast
              </h3>
              <div className="space-y-4">
                {trafficImpact.map((item, index) => (
                  <motion.div
                    key={item.condition}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`p-4 rounded-xl border ${getImpactColor(item.severity)}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          item.severity === 'high' ? 'bg-traffic-high/20' :
                          item.severity === 'medium' ? 'bg-traffic-medium/20' : 'bg-traffic-low/20'
                        }`}>
                          <CloudRain className={`w-6 h-6 ${
                            item.severity === 'high' ? 'text-traffic-high' :
                            item.severity === 'medium' ? 'text-traffic-medium' : 'text-traffic-low'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.condition}</h4>
                          <p className="text-sm text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-muted-foreground max-w-md">
                          {item.description}
                        </p>
                        <div className={`text-lg font-bold ${
                          item.severity === 'high' ? 'text-traffic-high' :
                          item.severity === 'medium' ? 'text-traffic-medium' : 'text-traffic-low'
                        }`}>
                          {item.impact}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WeatherRisk;
