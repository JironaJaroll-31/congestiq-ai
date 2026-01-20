import { motion } from 'framer-motion';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind,
  Droplets,
  Eye,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import GlassCard from './GlassCard';

interface WeatherData {
  weather: {
    temp: number;
    feels_like: number;
    humidity: number;
    description: string;
    icon: string;
    wind_speed: number;
    visibility: number;
    city: string;
  };
  airQuality: {
    aqi: number;
    pm25: number;
    pm10: number;
  } | null;
  trafficImpact: {
    description: string;
    level: number;
  };
}

interface WeatherWidgetProps {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
}

const getWeatherIcon = (iconCode: string) => {
  if (iconCode.includes('01')) return <Sun className="w-8 h-8 text-primary" />;
  if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) 
    return <Cloud className="w-8 h-8 text-muted-foreground" />;
  if (iconCode.includes('09') || iconCode.includes('10')) 
    return <CloudRain className="w-8 h-8 text-secondary" />;
  if (iconCode.includes('11')) 
    return <CloudLightning className="w-8 h-8 text-primary" />;
  if (iconCode.includes('13')) 
    return <CloudSnow className="w-8 h-8 text-secondary" />;
  return <Cloud className="w-8 h-8 text-muted-foreground" />;
};

const getAqiLabel = (aqi: number) => {
  switch (aqi) {
    case 1: return { label: 'Good', color: 'text-traffic-low' };
    case 2: return { label: 'Fair', color: 'text-yellow-400' };
    case 3: return { label: 'Moderate', color: 'text-traffic-medium' };
    case 4: return { label: 'Poor', color: 'text-orange-500' };
    case 5: return { label: 'Very Poor', color: 'text-traffic-high' };
    default: return { label: 'Unknown', color: 'text-muted-foreground' };
  }
};

const getImpactColor = (level: number) => {
  switch (level) {
    case 0: return 'text-traffic-low';
    case 1: return 'text-traffic-medium';
    case 2: return 'text-orange-500';
    case 3: return 'text-traffic-high';
    default: return 'text-muted-foreground';
  }
};

const WeatherWidget = ({ data, isLoading, error }: WeatherWidgetProps) => {
  if (isLoading) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </GlassCard>
    );
  }

  if (error || !data) {
    return (
      <GlassCard className="p-4">
        <div className="text-center py-4">
          <AlertTriangle className="w-8 h-8 text-traffic-medium mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {error || 'Unable to load weather data'}
          </p>
        </div>
      </GlassCard>
    );
  }

  const { weather, airQuality, trafficImpact } = data;
  const aqiInfo = airQuality ? getAqiLabel(airQuality.aqi) : null;

  return (
    <GlassCard delay={0.4} className="p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <CloudRain className="w-5 h-5 text-primary" />
        Weather Conditions
      </h3>
      
      {/* Main Weather Display */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-muted/30"
      >
        {getWeatherIcon(weather.icon)}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{weather.temp}°F</span>
            <span className="text-sm text-muted-foreground">
              Feels like {weather.feels_like}°F
            </span>
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {weather.description} • {weather.city}
          </p>
        </div>
      </motion.div>

      {/* Weather Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-muted/20">
          <Wind className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-sm font-medium">{weather.wind_speed} mph</p>
          <p className="text-xs text-muted-foreground">Wind</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/20">
          <Droplets className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-sm font-medium">{weather.humidity}%</p>
          <p className="text-xs text-muted-foreground">Humidity</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/20">
          <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-sm font-medium">{weather.visibility} mi</p>
          <p className="text-xs text-muted-foreground">Visibility</p>
        </div>
      </div>

      {/* Air Quality */}
      {aqiInfo && (
        <div className="p-3 rounded-xl bg-muted/30 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Air Quality</span>
            <span className={`text-sm font-medium ${aqiInfo.color}`}>
              {aqiInfo.label}
            </span>
          </div>
          {airQuality && (
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>PM2.5: {airQuality.pm25.toFixed(1)} µg/m³</span>
              <span>PM10: {airQuality.pm10.toFixed(1)} µg/m³</span>
            </div>
          )}
        </div>
      )}

      {/* Traffic Impact */}
      <div className="p-3 rounded-xl bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Traffic Impact</span>
          <span className={`text-sm font-medium ${getImpactColor(trafficImpact.level)}`}>
            {trafficImpact.description}
          </span>
        </div>
        {trafficImpact.level > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Weather conditions may affect travel times
          </p>
        )}
      </div>
    </GlassCard>
  );
};

export default WeatherWidget;
