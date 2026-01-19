import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

const AnimatedCounter = ({ 
  value, 
  suffix = '', 
  prefix = '',
  decimals = 0,
  duration = 2,
  className = ''
}: AnimatedCounterProps) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { 
    damping: 30, 
    stiffness: 100,
    duration: duration * 1000
  });
  const displayValue = useTransform(springValue, (latest) => 
    `${prefix}${latest.toFixed(decimals)}${suffix}`
  );

  useEffect(() => {
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        motionValue.set(value);
        setHasAnimated(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value, hasAnimated, motionValue]);

  return (
    <motion.span 
      className={`stat-value ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {displayValue}
    </motion.span>
  );
};

export default AnimatedCounter;
