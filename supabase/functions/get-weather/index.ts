import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenWeather API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { lat, lon } = await req.json();

    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch current weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
    );

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();

    // Fetch air quality
    const airQualityResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );

    let airQuality = null;
    if (airQualityResponse.ok) {
      const airData = await airQualityResponse.json();
      airQuality = airData.list?.[0];
    }

    // Calculate traffic impact based on weather conditions
    const weatherId = weatherData.weather?.[0]?.id || 800;
    let trafficImpact = 'None';
    let impactLevel = 0;

    if (weatherId >= 200 && weatherId < 300) {
      trafficImpact = 'Severe - Thunderstorm';
      impactLevel = 3;
    } else if (weatherId >= 300 && weatherId < 400) {
      trafficImpact = 'Light - Drizzle';
      impactLevel = 1;
    } else if (weatherId >= 500 && weatherId < 600) {
      if (weatherId >= 502) {
        trafficImpact = 'Heavy - Rain';
        impactLevel = 2;
      } else {
        trafficImpact = 'Moderate - Rain';
        impactLevel = 1;
      }
    } else if (weatherId >= 600 && weatherId < 700) {
      trafficImpact = 'Severe - Snow';
      impactLevel = 3;
    } else if (weatherId >= 700 && weatherId < 800) {
      trafficImpact = 'Moderate - Low Visibility';
      impactLevel = 2;
    }

    return new Response(
      JSON.stringify({
        weather: {
          temp: Math.round(weatherData.main?.temp || 0),
          feels_like: Math.round(weatherData.main?.feels_like || 0),
          humidity: weatherData.main?.humidity || 0,
          description: weatherData.weather?.[0]?.description || 'Unknown',
          icon: weatherData.weather?.[0]?.icon || '01d',
          wind_speed: Math.round(weatherData.wind?.speed || 0),
          visibility: Math.round((weatherData.visibility || 10000) / 1609.34), // Convert to miles
          city: weatherData.name || 'Unknown',
        },
        airQuality: airQuality ? {
          aqi: airQuality.main?.aqi || 1,
          pm25: airQuality.components?.pm2_5 || 0,
          pm10: airQuality.components?.pm10 || 0,
        } : null,
        trafficImpact: {
          description: trafficImpact,
          level: impactLevel,
        },
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error fetching weather:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch weather data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
