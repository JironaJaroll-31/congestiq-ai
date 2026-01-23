import { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Brain, MapPin, Cloud, Shield, Gauge, ArrowRight, Play } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import GlassCard from '@/components/GlassCard';
import AnimatedCounter from '@/components/AnimatedCounter';
import PageTransition from '@/components/PageTransition';
import DemoModal from '@/components/DemoModal';

const features = [{
  icon: Brain,
  title: 'AI Traffic Analysis',
  description: 'Neural networks predict congestion patterns before they happen.'
}, {
  icon: MapPin,
  title: 'Real-time GPS Tracking',
  description: 'Live location monitoring with sub-meter precision.'
}, {
  icon: Cloud,
  title: 'Weather Integration',
  description: 'Weather-aware routing that adapts to conditions.'
}, {
  icon: Shield,
  title: 'Risk Assessment',
  description: 'Accident probability scoring for safer routes.'
}, {
  icon: Gauge,
  title: 'Performance Analytics',
  description: 'Detailed metrics on travel time optimization.'
}, {
  icon: Zap,
  title: 'Instant Alerts',
  description: 'Real-time notifications for route changes.'
}];

const stats = [{
  value: 99.7,
  suffix: '%',
  label: 'Prediction Accuracy'
}, {
  value: 2.5,
  suffix: 'M',
  label: 'Routes Optimized'
}, {
  value: 47,
  suffix: '%',
  label: 'Time Saved'
}, {
  value: 24,
  suffix: '/7',
  label: 'AI Monitoring'
}];

const Landing = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const textY = useTransform(scrollY, [0, 500], [0, -50]);

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        {/* Demo Modal */}
        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image with Parallax */}
          <motion.div className="absolute inset-0 z-0" style={{ y: heroY }}>
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background z-10" />
            <img src={heroBg} alt="Smart City" className="w-full h-[120%] object-cover" />
          </motion.div>

          {/* Gradient Orbs */}
          <div className="absolute inset-0 z-5 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/20 blur-[120px]"
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-secondary/20 blur-[100px]"
            />
          </div>

          {/* Hero Content */}
          <motion.div
            className="relative z-20 container mx-auto px-6 text-center"
            style={{ y: textY, opacity: heroOpacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                AI-Powered Traffic Intelligence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="text-foreground">Navigate </span>
              <span className="text-gradient glow-text">Smarter</span>
              <br />
              <span className="text-foreground">Arrive </span>
              <span className="text-gradient glow-text">Faster</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Experience the future of urban mobility with AI that predicts traffic, 
              adapts to weather, and finds your fastest route in real-time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glow-button group flex items-center gap-2 text-lg"
                >
                  <Zap className="w-5 h-5" />
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <motion.button
                onClick={() => setIsDemoOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glow-button-outline flex items-center gap-2 text-lg"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
              <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="relative z-20 py-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <GlassCard key={stat.label} delay={index * 0.1} className="p-6 text-center">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.suffix === '%' || stat.suffix === 'M' ? 1 : 0}
                  />
                  <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-20 py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="text-gradient">Intelligent</span> Features
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Cutting-edge AI technology that transforms how you navigate the city.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <GlassCard key={feature.title} delay={index * 0.1} className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_hsl(180_100%_50%_/_0.3)] transition-shadow duration-500">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-20 py-20">
          <div className="container mx-auto px-6">
            <GlassCard className="p-12 text-center" hover={false}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Transform Your Commute?
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  Join thousands of smart travelers who save time every day with CongestiQ AI.
                </p>
                <Link to="/auth">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="glow-button text-lg"
                  >
                    Get Started Free
                  </motion.button>
                </Link>
              </motion.div>
            </GlassCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-20 py-10 border-t border-border/50">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-background" />
                </div>
                <span className="font-bold text-gradient">CongestiQ AI</span>
              </div>
              <p className="text-sm text-muted-foreground">© 2026 CongestiQ. Powered by AI. Built for the future.</p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Landing;
