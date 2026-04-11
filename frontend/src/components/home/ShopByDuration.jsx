import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Sun, Moon, Clock } from 'lucide-react';
import { useCatalogDurations } from '../../hooks/useCatalogDurations';

const DEFAULT_DURATION_CARDS = [
  {
    id: 1,
    name: 'العدسات اليومية',
    nameEn: 'Daily Lenses',
    slug: 'daily',
    icon: Sun,
    description: 'عدسات مريحة وآمنة للاستخدام اليومي',
    color: 'from-yellow-400 to-orange-400',
    darkColor: 'dark:from-yellow-600 dark:to-orange-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    id: 2,
    name: 'العدسات الأسبوعية',
    nameEn: 'Weekly Lenses',
    slug: 'weekly',
    icon: Clock,
    description: 'عدسات صحية للاستخدام طوال الأسبوع',
    color: 'from-green-400 to-emerald-400',
    darkColor: 'dark:from-green-600 dark:to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    id: 3,
    name: 'العدسات الشهرية',
    nameEn: 'Monthly Lenses',
    slug: 'monthly',
    icon: Calendar,
    description: 'عدسات عالية الراحة والجودة طوال الشهر',
    color: 'from-blue-400 to-cyan-400',
    darkColor: 'dark:from-blue-600 dark:to-cyan-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    id: 4,
    name: 'العدسات السنوية',
    nameEn: 'Yearly Lenses',
    slug: 'yearly',
    icon: Moon,
    description: 'عدسات متينة واقتصادية للاستخدام السنوي',
    color: 'from-purple-400 to-pink-400',
    darkColor: 'dark:from-purple-600 dark:to-pink-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
];

const ICON_MAP = {
  '📅': Calendar,
  '⏱️': Clock,
  '🌙': Moon,
  '☀️': Sun,
};

export default function ShopByDuration() {
  const { data: durations = [] } = useCatalogDurations();

  const displayDurations = durations.length > 0 ? durations.map((duration) => {
    const iconComponent = ICON_MAP[duration.icon] || Calendar;
    const colorMap = {
      'يومي': { color: 'from-yellow-400 to-orange-400', darkColor: 'dark:from-yellow-600 dark:to-orange-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
      'أسبوعي': { color: 'from-green-400 to-emerald-400', darkColor: 'dark:from-green-600 dark:to-emerald-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
      'شهري': { color: 'from-blue-400 to-cyan-400', darkColor: 'dark:from-blue-600 dark:to-cyan-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
      'سنوي': { color: 'from-purple-400 to-pink-400', darkColor: 'dark:from-purple-600 dark:to-pink-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
    };
    const colorConfig = colorMap[duration.name] || colorMap['يومي'];
    return {
      ...duration,
      icon: iconComponent,
      description: `عدسات ${duration.name}`,
      color: colorConfig.color,
      darkColor: colorConfig.darkColor,
      bgColor: colorConfig.bgColor,
    };
  }) : DEFAULT_DURATION_CARDS;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="section bg-white dark:bg-dark-card">
      <div className="container-fluid">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-arabic text-4xl md:text-5xl font-bold text-[#6B4A45] dark:text-[#6B4A45] mb-4">
            تسوقي حسب المدة
          </h2>
          <p className="font-arabic text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            اختاري المدة التي تناسب احتياجك
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-400 to-mint dark:to-mint-dark mx-auto mt-6 rounded-full"></div>
        </motion.div>

        {/* Duration cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {displayDurations.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.id} variants={itemVariants}>
                <Link to={`/shop?duration=${card.slug}`}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="card group overflow-hidden cursor-pointer h-full dark:bg-dark-surface"
                  >
                    {/* Image area */}
                    <div className={`${card.bgColor} p-8 flex flex-col items-center justify-center min-h-48 relative overflow-hidden`}>
                      {/* Background gradient circle */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      />

                      {/* Icon */}
                      <motion.div
                        className="relative z-10 mb-4"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={`bg-gradient-to-br ${card.color} ${card.darkColor} p-4 rounded-full shadow-lg`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-arabic font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                        {card.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {card.nameEn}
                      </p>
                      <p className="font-arabic text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                        {card.description}
                      </p>

                      {/* Arrow */}
                      <motion.div
                        className="inline-block text-primary-600 dark:text-primary-400 font-bold"
                        whileHover={{ x: 4 }}
                      >
                        ←
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}


