import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  User, 
  Volume2,
  Loader2,
  Sparkles
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import GlassCard from '@/components/GlassCard';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  "Is traffic heavy ahead?",
  "Suggest fastest route",
  "Will rain affect travel?",
  "Show alternate roads",
  "What's my ETA?",
  "Report an incident",
];

const mockResponses: Record<string, string> = {
  "is traffic heavy ahead?": "Based on real-time data, there's moderate congestion on your current route. The main bottleneck is near the Downtown intersection, with an estimated 12-minute delay. I recommend taking the Riverside alternate route to save approximately 8 minutes.",
  "suggest fastest route": "I've analyzed 3 possible routes to your destination. The fastest option is via Highway 101 → Exit 15 → Main Street, with an estimated arrival time of 23 minutes. This route avoids the construction zone on 5th Avenue.",
  "will rain affect travel?": "Light rain is expected to begin around 5:00 PM. Based on historical data, this typically increases congestion by 15-20% in your area. I recommend departing before 4:30 PM to avoid weather-related delays.",
  "show alternate roads": "I've identified 2 alternate routes: 1) Riverside Drive (26 min, scenic, low traffic) 2) Industrial Boulevard (24 min, moderate traffic). Both avoid the current congestion hotspot downtown.",
  "what's my eta?": "Your current estimated time of arrival is 4:47 PM. This accounts for current traffic conditions, upcoming weather changes, and typical patterns for this time of day.",
  "report an incident": "Thank you for helping keep roads safe. To report an incident, please provide: 1) Location (address or landmark) 2) Type of incident (accident, road hazard, etc.) 3) Any additional details. I'll notify other drivers and update route recommendations.",
};

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      content: "Hello! I'm your AI traffic assistant. Ask me about traffic conditions, routes, weather impacts, or anything related to your journey. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500));

    const response = mockResponses[text.toLowerCase()] || 
      "I understand your question. Based on my analysis of current traffic patterns and conditions, I recommend checking the Live Map for real-time updates. Is there anything specific about your route you'd like me to help with?";

    const assistantMessage: Message = {
      id: Date.now() + 1,
      type: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // In production, this would integrate with Web Speech API
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        setInput("What's the traffic like downtown?");
      }, 2000);
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">AI-Powered Assistant</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Voice <span className="text-gradient">Navigation</span>
            </h1>
            <p className="text-muted-foreground">
              Ask me anything about traffic, routes, and conditions
            </p>
          </motion.div>

          {/* Chat Container */}
          <GlassCard delay={0.1} className="mb-6 p-0 overflow-hidden">
            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.type === 'assistant' && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-background" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm' 
                        : 'bg-muted/50 rounded-2xl rounded-tl-sm'
                    } p-4`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs opacity-60">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.type === 'assistant' && (
                          <button
                            onClick={() => speakMessage(message.content)}
                            className={`p-1 rounded hover:bg-background/20 transition-colors ${isSpeaking ? 'text-primary' : 'opacity-60 hover:opacity-100'}`}
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    {message.type === 'user' && (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Bot className="w-5 h-5 text-background" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border/50 p-4">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleListening}
                  className={`p-3 rounded-xl transition-colors ${
                    isListening 
                      ? 'bg-traffic-high text-white animate-pulse' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </motion.button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about traffic, routes, weather..."
                  className="flex-1 bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="glow-button p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <motion.button
                  key={action}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSend(action)}
                  className="px-4 py-2 text-sm rounded-full bg-muted/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-colors"
                >
                  {action}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AIAssistant;
