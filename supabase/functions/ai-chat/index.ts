import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface WeatherContext {
  temperature?: number;
  condition?: string;
  humidity?: number;
}

interface LocationContext {
  lat?: number;
  lng?: number;
  address?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { messages, weatherContext, locationContext, userId } = await req.json();

    console.log('AI Chat request:', { 
      messageCount: messages?.length,
      hasWeather: !!weatherContext,
      hasLocation: !!locationContext,
      userId: userId?.slice(0, 8) + '...'
    });

    // Build dynamic system context
    let systemContext = `You are CongestiQ AI, an intelligent traffic and navigation assistant. You provide real-time, helpful advice about:
- Traffic conditions and congestion
- Route optimization and alternatives
- Weather impacts on travel
- Estimated travel times
- Safety recommendations

You have access to real-time data and should provide specific, actionable advice.`;

    if (weatherContext) {
      systemContext += `\n\nCurrent Weather Conditions:
- Temperature: ${weatherContext.temperature}°C
- Condition: ${weatherContext.condition}
- Humidity: ${weatherContext.humidity}%`;

      // Add weather-specific traffic advice
      if (weatherContext.condition?.toLowerCase().includes('rain')) {
        systemContext += `\nWeather Alert: Rain is affecting visibility and road conditions. Advise longer following distances and reduced speeds.`;
      } else if (weatherContext.condition?.toLowerCase().includes('snow')) {
        systemContext += `\nWeather Alert: Snow conditions present. Recommend extreme caution and allow extra travel time.`;
      } else if (weatherContext.condition?.toLowerCase().includes('fog')) {
        systemContext += `\nWeather Alert: Foggy conditions reducing visibility. Recommend using low beams and reduced speed.`;
      }
    }

    if (locationContext) {
      systemContext += `\n\nUser Location: ${locationContext.address || `${locationContext.lat}, ${locationContext.lng}`}`;
    }

    // Add current time context
    const now = new Date();
    const hour = now.getHours();
    let trafficContext = '';
    
    if (hour >= 7 && hour <= 9) {
      trafficContext = 'Morning rush hour - expect heavy traffic on major routes.';
    } else if (hour >= 16 && hour <= 19) {
      trafficContext = 'Evening rush hour - congestion likely on highways and main arteries.';
    } else if (hour >= 22 || hour <= 5) {
      trafficContext = 'Off-peak hours - light traffic expected.';
    } else {
      trafficContext = 'Moderate traffic levels expected.';
    }

    systemContext += `\n\nCurrent Time Context: ${trafficContext}`;
    systemContext += `\n\nAlways be conversational, specific, and helpful. If you don't have specific data, provide general best-practice advice while being honest about limitations.`;

    // Prepare messages for AI
    const aiMessages = [
      { role: 'system', content: systemContext },
      ...messages.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    console.log('Sending to AI Gateway with', aiMessages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('AI Chat error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
