import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Map, 
  Bot, 
  Cloud, 
  User, 
  Menu, 
  X,
  Zap,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Home', icon: Zap },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/map', label: 'Live Map', icon: Map },
  { path: '/assistant', label: 'AI Assistant', icon: Bot },
  { path: '/weather', label: 'Weather', icon: Cloud },
  { path: '/profile', label: 'Profile', icon: User },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Show different nav items based on auth state
  const displayedItems = user 
    ? navItems.slice(1) // Hide Home for logged-in users in nav bar
    : navItems.filter(item => item.path === '/'); // Only show Home for non-logged users

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="fixed top-0 left-0 right-0 z-50 hidden md:block"
      >
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="glass-card px-6 py-3 flex items-center justify-between">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
              >
                <Zap className="w-6 h-6 text-background" />
              </motion.div>
              <span className="text-xl font-bold text-gradient">CongestiQ</span>
            </Link>

            {user ? (
              // Logged in: show nav items
              <div className="flex items-center gap-1">
                {displayedItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="relative px-4 py-2 rounded-lg transition-colors group"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navActive"
                          className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/30"
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        />
                      )}
                      <span className={`relative z-10 flex items-center gap-2 text-sm font-medium ${
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      }`}>
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              // Not logged in: show sign in button
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glow-button text-sm py-2 px-5 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="mx-4 mt-4">
          <div className="glass-card px-4 py-3 flex items-center justify-between">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Zap className="w-5 h-5 text-background" />
              </div>
              <span className="text-lg font-bold text-gradient">CongestiQ</span>
            </Link>

            {user ? (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            ) : (
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glow-button text-sm py-2 px-4 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 z-50 md:hidden"
          >
            <div className="glass-card p-4 space-y-2">
              {navItems.slice(1).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/30' 
                        : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
