import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import { Link } from 'react-router-dom';

export default function AnimatedHero() {
  const petals = React.useMemo(() => {
    const count = 12;
    return Array.from({ length: count }, (_, i) => {
      const base = (i / (count - 1)) * 100;
      const jitter = (Math.random() - 0.5) * 8;
      return {
        id: i,
        delay: i * 0.7,
        left: Math.min(96, Math.max(4, base + jitter)),
      };
    });
  }, []);

  // Floating pearls animation
  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const floatingVariantsLong = {
    animate: {
      y: [0, -30, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  // Falling petals animation
  const fallingVariants = {
    initial: { y: -100, opacity: 0, rotate: 0 },
    animate: {
      y: window.innerHeight + 200,
      opacity: [0, 1, 1, 0],
      rotate: 360,
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const Petal = ({ delay, left, size }) => (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: window.innerHeight + 200, opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
        delay,
      }}
      className={`absolute pointer-events-none ${size}`}
      style={{ left: `${left}%` }}
    >
      <div className="text-pink-300 drop-shadow-lg">
        🌸
      </div>
    </motion.div>
  );

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-pale-pink via-cream to-white dark:from-dark-bg dark:via-dark-surface dark:to-dark-card overflow-hidden pt-6 md:pt-0">
      {/* Soft blur background circles */}
      <motion.div
        className="absolute top-10 left-10 w-72 h-72 rounded-full bg-gradient-to-br from-primary-200/20 to-rose-200/20 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-gradient-to-br from-rose-200/20 to-primary-200/20 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Falling petals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {petals.map((petal) => (
          <Petal key={petal.id} delay={petal.delay} left={petal.left} size="text-2xl" />
        ))}
      </div>

      {/* Floating pearls - background */}
      <motion.div
        className="absolute top-20 left-16 w-8 h-8 rounded-full bg-white/40 shadow-lg"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        className="absolute top-40 right-24 w-12 h-12 rounded-full bg-white/30 shadow-lg"
        variants={floatingVariantsLong}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-40 left-1/4 w-10 h-10 rounded-full bg-white/25 shadow-lg"
        variants={floatingVariants}
        animate="animate"
      />

      {/* Main content */}
      <div className="relative z-10 container-fluid h-screen flex flex-col items-center justify-center text-center px-4">
        {/* Logo/Brand accent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-rose-400 shadow-lg shadow-primary-200/50 dark:shadow-primary-500/20 flex items-center justify-center text-white font-bold text-4xl">
              RI
            </div>
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-arabic text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
        >
          <span className="bg-gradient-to-r from-ink-800 via-primary-700 to-secondary-600 dark:from-secondary-100 dark:via-primary-300 dark:to-secondary-300 bg-clip-text text-transparent drop-shadow-sm">
            <TypeAnimation
              sequence={[
                ' روڤالينا | Rovalina',
                1400,
                'Rovalina Lenses',
                1800,
              ]}
              speed={40}
              repeat={Infinity}
              cursor={true}
            />
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-arabic text-xl md:text-2xl text-primary-600 dark:text-primary-300 mb-2"
        >
          عدسات بألوان الأحلام
        </motion.p>

        {/* Sub tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-gray-600 dark:text-gray-300 text-lg mb-12 max-w-2xl"
        >
          اكتشفي مجموعتنا الفريدة من عدسات العيون الطبية، المريحة والطبيعية
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mb-12"
        >
          <Link to="/shop" className="btn btn-primary btn-lg shadow-lg shadow-primary-200/50 dark:shadow-primary-500/20 hover:shadow-xl">
            <span className="font-arabic">تسوقي الآن</span>
          </Link>
          <Link to="/offers" className="btn btn-secondary btn-lg border-2">
            <span className="font-arabic">اكتشفي العروض</span>
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-primary-500" />
          </motion.div>
        </motion.div>

        {/* Floating glossy elements - foreground */}
        <motion.div
          className="absolute top-1/3 left-1/4 w-6 h-6 rounded-full bg-white/50 shadow-lg"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-5 h-5 rounded-full bg-white/40 shadow-lg"
          variants={floatingVariantsLong}
          animate="animate"
        />
      </div>

      {/* Subtle pattern overlay - optional */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}


