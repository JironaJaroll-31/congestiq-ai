/// <reference types="@types/google.maps" />
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Layers, 
  CloudRain, 
  RefreshCw,
  Maximize,
  Route,
  Clock,
  AlertTriangle,
  Locate,
  Loader2
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import GlassCard from '@/components/GlassCard';
import WeatherWidget from '@/components/WeatherWidget';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

declare global {
  interface Window {
    google?: typeof google;
  }
}

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

const routes = [
  {
    id: 1,
    name: 'Primary Route',
    via: 'Highway 101',
    distance: '12.4 mi',
    time: '23 min',
    traffic: 'Moderate',
  },
  {
    id: 2,
    name: 'Alternate Route',
    via: 'Riverside Drive',
    distance: '14.2 mi',
    time: '26 min',
    traffic: 'Light',
  },
  {
    id: 3,
    name: 'Scenic Route',
    via: 'Coastal Highway',
    distance: '18.6 mi',
    time: '32 min',
    traffic: 'None',
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState('');
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [calculatedRoutes, setCalculatedRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const defaultCenter = { lat: 37.7749, lng: -122.4194 };

  const darkMapStyles: google.maps.MapTypeStyle[] = [
    { elementType: 'geometry', stylers: [{ color: '#0a0a14' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a14' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#00f0ff' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#00f0ff' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f1a1a' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3d7070' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c3e50' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a252f' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#00f0ff' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#00f0ff' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a141e' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#0a141e' }] },
  ];

  // Fetch API key from edge function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-maps-key');
        if (error) throw error;
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        } else {
          setMapError('API key not found');
        }
      } catch (error) {
        console.error('Error fetching Maps API key:', error);
        setMapError('Failed to load map configuration');
      } finally {
        setIsLoadingKey(false);
      }
    };
    fetchApiKey();
  }, []);

  // Fetch weather data
  const fetchWeather = useCallback(async (lat: number, lng: number) => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { lat, lon: lng }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeatherError('Failed to load weather data');
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // Fetch weather when location is available and weather is toggled
  useEffect(() => {
    if (showWeather && userLocation) {
      fetchWeather(userLocation.lat, userLocation.lng);
    }
  }, [showWeather, userLocation, fetchWeather]);

  // Load Google Maps script manually after we have the API key
  useEffect(() => {
    if (!apiKey || mapLoaded) return;

    // Check if script is already loaded
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setMapLoaded(true);
    };
    
    script.onerror = () => {
      setMapError('Failed to load Google Maps');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, [apiKey, mapLoaded]);

  // Initialize map after script loads
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapRef.current) return;

    const map = new google.maps.Map(mapContainerRef.current, {
      center: userLocation || defaultCenter,
      zoom: 13,
      styles: darkMapStyles,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapRef.current = map;

    // Add traffic layer
    const trafficLayer = new google.maps.TrafficLayer();
    if (showTraffic) {
      trafficLayer.setMap(map);
    }
    trafficLayerRef.current = trafficLayer;

    // Add directions renderer with custom styling
    const directionsRenderer = new google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: '#00f0ff',
        strokeWeight: 6,
        strokeOpacity: 0.9,
      },
      suppressMarkers: false,
      markerOptions: {
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#00f0ff',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      },
    });
    directionsRenderer.setMap(map);
    directionsRendererRef.current = directionsRenderer;

  }, [mapLoaded, showTraffic]);

  // Update traffic layer visibility
  useEffect(() => {
    if (!trafficLayerRef.current || !mapRef.current) return;
    
    if (showTraffic) {
      trafficLayerRef.current.setMap(mapRef.current);
    } else {
      trafficLayerRef.current.setMap(null);
    }
  }, [showTraffic]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);

          // Update user marker
          if (mapRef.current && mapLoaded) {
            if (!userMarkerRef.current) {
              userMarkerRef.current = new google.maps.Marker({
                position: newLocation,
                map: mapRef.current,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 12,
                  fillColor: '#00f0ff',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                },
                title: 'Your Location',
              });
            } else {
              userMarkerRef.current.setPosition(newLocation);
            }
            
            // Pan to user location on first fix
            if (!userMarkerRef.current) {
              mapRef.current.panTo(newLocation);
            }
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location if geolocation fails
          setUserLocation(defaultCenter);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      // Fallback to default location
      setUserLocation(defaultCenter);
    }
  }, [mapLoaded]);

  const centerOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
      toast.success('Centered on your location');
    } else {
      toast.error('Location not available');
    }
  }, [userLocation]);

  const calculateRoute = async () => {
    if (!destination.trim()) {
      toast.error('Please enter a destination');
      return;
    }

    if (!userLocation) {
      toast.error('Waiting for your location...');
      return;
    }

    if (!mapLoaded || !window.google) {
      toast.error('Map is still loading');
      return;
    }

    setIsLoadingRoute(true);
    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: userLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
      });

      if (result.routes && result.routes.length > 0) {
        setCalculatedRoutes(result.routes);
        
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setDirections(result);
          directionsRendererRef.current.setRouteIndex(0);
        }
        
        toast.success(`Found ${result.routes.length} route(s)`);
      } else {
        toast.error('No routes found');
      }
    } catch (error: unknown) {
      console.error('Error calculating route:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not find a route';
      toast.error(errorMessage);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const selectRoute = (index: number) => {
    if (directionsRendererRef.current && calculatedRoutes.length > index) {
      directionsRendererRef.current.setRouteIndex(index);
      setSelectedRoute(index + 1);
    }
  };

  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] } as google.maps.DirectionsResult);
    }
    setCalculatedRoutes([]);
    setDestination('');
    toast.success('Route cleared');
  };

  if (isLoadingKey) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-24 pb-10 px-4 md:px-6 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading map configuration...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (mapError || !apiKey) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-24 pb-10 px-4 md:px-6 flex items-center justify-center">
          <GlassCard className="p-8 text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-traffic-medium mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Map Configuration Required</h2>
            <p className="text-muted-foreground">
              {mapError || 'Google Maps API key is not configured. Please add your API key in the Cloud settings.'}
            </p>
          </GlassCard>
        </div>
      </PageTransition>
    );
  }

  // Format route info from Google Directions
  const getRouteInfo = (route: google.maps.DirectionsRoute, index: number) => {
    const leg = route.legs[0];
    const durationInTraffic = leg.duration_in_traffic?.text || leg.duration?.text || 'N/A';
    const distance = leg.distance?.text || 'N/A';
    const summary = route.summary || `Route ${index + 1}`;
    
    return {
      id: index + 1,
      name: index === 0 ? 'Fastest Route' : `Alternative ${index}`,
      via: summary,
      distance: distance,
      time: durationInTraffic,
      traffic: leg.duration_in_traffic ? 'Live Traffic' : 'Estimated',
    };
  };

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
              <p className="text-muted-foreground flex items-center gap-2">
                {userLocation ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-traffic-low animate-pulse" />
                    GPS Active • Real-time traffic enabled
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Acquiring GPS signal...
                  </>
                )}
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
              <div className="relative h-[500px]">
                {/* Map Container */}
                <div 
                  ref={mapContainerRef} 
                  className="absolute inset-0"
                />

                {/* Loading Overlay */}
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm z-10">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading Google Maps...</p>
                    </div>
                  </div>
                )}

                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={centerOnUser}
                    className="p-2 rounded-lg bg-background/80 backdrop-blur border border-border/50 hover:border-primary/50 transition-colors"
                    title="Center on my location"
                  >
                    <Locate className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearRoute}
                    className="p-2 rounded-lg bg-background/80 backdrop-blur border border-border/50 hover:border-primary/50 transition-colors"
                    title="Clear route"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-background/80 backdrop-blur border border-border/50 hover:border-primary/50 transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Location Search */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && calculateRoute()}
                      placeholder="Enter destination..."
                      className="flex-1 bg-background/80 backdrop-blur border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={calculateRoute}
                      disabled={isLoadingRoute}
                      className="glow-button py-3 px-6 disabled:opacity-50"
                    >
                      {isLoadingRoute ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Route className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Route Options & Weather */}
            <div className="space-y-4">
              <GlassCard delay={0.2} className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Route className="w-5 h-5 text-primary" />
                  {calculatedRoutes.length > 0 ? 'Calculated Routes' : 'Available Routes'}
                </h3>
                <div className="space-y-3">
                  {calculatedRoutes.length > 0 ? (
                    // Show calculated routes from Google
                    calculatedRoutes.map((route, index) => {
                      const routeInfo = getRouteInfo(route, index);
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ x: 4 }}
                          onClick={() => selectRoute(index)}
                          className={`p-3 rounded-xl cursor-pointer transition-all ${
                            selectedRoute === index + 1
                              ? 'bg-primary/10 border border-primary/30'
                              : 'bg-muted/30 border border-transparent hover:border-border/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{routeInfo.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                              {routeInfo.traffic}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {routeInfo.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {routeInfo.time}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">via {routeInfo.via}</p>
                        </motion.div>
                      );
                    })
                  ) : (
                    // Show placeholder routes
                    routes.map((route) => (
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
                    ))
                  )}
                </div>
              </GlassCard>

              {/* Weather Widget - shown when toggled */}
              {showWeather && (
                <WeatherWidget 
                  data={weatherData} 
                  isLoading={isLoadingWeather} 
                  error={weatherError} 
                />
              )}

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
