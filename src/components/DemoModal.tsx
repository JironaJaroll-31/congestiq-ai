import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Brain, Cloud, Zap, ArrowRight } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const demoSteps = [
  {
    icon: Brain,
    title: 'AI Traffic Analysis',
    description: 'Our neural networks analyze real-time traffic patterns to predict congestion before it happens.',
    color: 'from-primary to-secondary'
  },
  {
    icon: MapPin,
    title: 'Smart Route Optimization',
    description: 'Get the fastest route based on current conditions, not just distance.',
    color: 'from-traffic-low to-primary'
  },
  {
    icon: Cloud,
    title: 'Weather-Aware Routing',
    description: 'Routes automatically adapt to weather conditions for safer travel.',
    color: 'from-secondary to-glow-purple'
  },
  {
    icon: Zap,
    title: 'Real-time Alerts',
    description: 'Instant notifications for accidents, road closures, and optimal departure times.',
    color: 'from-primary to-accent'
  }
];

const DemoModal = ({ isOpen, onClose }: DemoModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="glass-card p-6 md:p-8 mx-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gradient">How CongestiQ Works</h2>
                  <p className="text-muted-foreground text-sm mt-1">Experience AI-powered navigation</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Demo Steps */}
              <div className="space-y-4 mb-6">
                {demoSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0`}>
                      <step.icon className="w-6 h-6 text-background" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        <span className="text-xs text-primary font-mono">0{index + 1}</span>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                  </motion.div>
                ))}
              </div>

              {/* Interactive Demo Preview */}
              <div className="p-4 rounded-xl bg-muted/20 border border-border/50 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-traffic-high" />
                    <div className="w-3 h-3 rounded-full bg-traffic-medium" />
                    <div className="w-3 h-3 rounded-full bg-traffic-low" />
                  </div>
                  <span className="text-xs text-muted-foreground">Live Traffic Simulation</span>
                </div>
                <div className="h-32 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{ 
                      x: ['-100%', '100%'],
                      opacity: [0, 1, 1, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                  />
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2 animate-bounce" />
                    <p className="text-sm text-muted-foreground">Route optimization in progress...</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.a
                  href="/dashboard"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glow-button flex-1 text-center py-3"
                >
                  Try It Now
                </motion.a>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glow-button-outline flex-1 py-3"
                >
                  Maybe Later
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DemoModal;
