import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  CloudRain, 
  RefreshCw,
  Maximize,
  Route,
  Clock,
  AlertTriangle
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import GlassCard from '@/components/GlassCard';

// Mock route data
const routes = [
  {
    id: 1,
    name: 'Primary Route',
    via: 'Highway 101',
    distance: '12.4 mi',
    time: '23 min',
    traffic: 'Moderate',
    color: 'primary',
  },
  {
    id: 2,
    name: 'Alternate Route',
    via: 'Riverside Drive',
    distance: '14.2 mi',
    time: '26 min',
    traffic: 'Light',
    color: 'green',
  },
  {
    id: 3,
    name: 'Scenic Route',
    via: 'Coastal Highway',
    distance: '18.6 mi',
    time: '32 min',
    traffic: 'None',
    color: 'blue',
  },
];

const congestionAreas = [
  { name: 'Downtown Intersection', level: 'High', delay: '+12 min' },
  { name: 'Highway 101 Exit 15', level: 'Moderate', delay: '+5 min' },
  { name: 'Bridge Crossing', level: 'Low', delay: '+2 min' },
];

const LiveMap = () => {
  const [showTraffic, setShowTraffic] = useState(true);
  const [showWeather, setShowWeather] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(1);

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-10 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Live <span className="text-gradient">Map</span>
              </h1>
              <p className="text-muted-foreground">
                Real-time traffic visualization and route planning
              </p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTraffic(!showTraffic)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showTraffic 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Layers className="w-4 h-4" />
                Traffic
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowWeather(!showWeather)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showWeather 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <CloudRain className="w-4 h-4" />
                Weather
              </motion.button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map Container */}
            <GlassCard delay={0.1} className="lg:col-span-2 p-0 overflow-hidden">
              <div className="relative h-[500px] bg-muted/30">
                {/* Map Placeholder - Would integrate Google Maps here */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4"
                    >
                      <MapPin className="w-10 h-10 text-primary" />
                    </motion.div>
                    <p className="text-muted-foreground mb-2">Interactive Map View</p>
                    <p className="text-sm text-muted-foreground/60">
                      Google Maps integration with live traffic overlay
                    </p>
                  </div>
                </div>

                {/* Map Grid Overlay */}
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Simulated Route Lines */}
                <svg className="absolute inset-0" width="100%" height="100%">
                  <motion.path
                    d="M 100 400 Q 200 300 300 250 Q 400 200 500 180 Q 600 160 700 150"
                    stroke="hsl(var(--primary))"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                    style={{ filter: 'drop-shadow(0 0 10px hsl(180 100% 50% / 0.5))' }}
                  />
                  {/* Animated Dot */}
                  <motion.circle
                    r="6"
                    fill="hsl(var(--primary))"
                    initial={{ offsetDistance: '0%' }}
                    animate={{ offsetDistance: '100%' }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    style={{
                      offsetPath: 'path("M 100 400 Q 200 300 300 250 Q 400 200 500 180 Q 600 160 700 150")',
                      filter: 'drop-shadow(0 0 10px hsl(180 100% 50%))',
                    }}
                  />
                </svg>

                {/* Congestion Indicators */}
                {showTraffic && (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 }}
                      className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-traffic-high/30 flex items-center justify-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-traffic-high animate-pulse" />
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2 }}
                      className="absolute top-1/2 left-1/2 w-12 h-12 rounded-full bg-traffic-medium/30 flex items-center justify-center"
                    >
                      <div className="w-6 h-6 rounded-full bg-traffic-medium animate-pulse" />
                    </motion.div>
                  </>
                )}

                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-background/80 backdrop-blur border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <Navigation className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-background/80 backdrop-blur border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-background/80 backdrop-blur border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <Maximize className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Location Search */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter destination..."
                      className="flex-1 bg-background/80 backdrop-blur border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="glow-button py-3 px-6"
                    >
                      <Route className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Route Options */}
            <div className="space-y-4">
              <GlassCard delay={0.2} className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Route className="w-5 h-5 text-primary" />
                  Available Routes
                </h3>
                <div className="space-y-3">
                  {routes.map((route) => (
                    <motion.div
                      key={route.id}
                      whileHover={{ x: 4 }}
                      onClick={() => setSelectedRoute(route.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedRoute === route.id
                          ? 'bg-primary/10 border border-primary/30'
                          : 'bg-muted/30 border border-transparent hover:border-border/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{route.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          route.traffic === 'Light' ? 'bg-traffic-low/20 text-traffic-low' :
                          route.traffic === 'Moderate' ? 'bg-traffic-medium/20 text-traffic-medium' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {route.traffic}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {route.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {route.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">via {route.via}</p>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard delay={0.3} className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-traffic-medium" />
                  Congestion Areas
                </h3>
                <div className="space-y-2">
                  {congestionAreas.map((area) => (
                    <div
                      key={area.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div>
                        <p className="text-sm font-medium">{area.name}</p>
                        <p className={`text-xs ${
                          area.level === 'High' ? 'text-traffic-high' :
                          area.level === 'Moderate' ? 'text-traffic-medium' : 'text-traffic-low'
                        }`}>
                          {area.level} Traffic
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{area.delay}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default LiveMap;
