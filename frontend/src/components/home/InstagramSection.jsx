import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { useInstagramGalleryQuery } from '../../hooks/useInstagramGallery';

const getInstagramEmbedUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const parts = parsed.pathname.split('/').filter(Boolean);

    if (host !== 'instagram.com') return null;

    if ((parts[0] === 'p' || parts[0] === 'reel') && parts[1]) {
      return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed`;
    }

    if ((parts[0] === 'p' || parts[0] === 'reel') && parts[2] === 'media' && parts[1]) {
      return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed`;
    }
  } catch {
    return null;
  }

  return null;
};

export default function InstagramSection() {
  const { data: galleryItems = [] } = useInstagramGalleryQuery();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="section bg-gradient-to-b from-pale-pink/30 dark:from-dark-surface/30 to-transparent">
      <div className="container-fluid">
        {/* Section header */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Motion.div
            className="flex items-center justify-center gap-3 mb-4"
            whileInView={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.6 }}
          >
            <Share2 className="w-6 h-6 text-primary-500" />
            <h2 className="font-arabic text-4xl md:text-5xl font-bold text-[#6B4A45] dark:text-[#6B4A45]">
              تابعينا على إنستجرام
            </h2>
            <Share2 className="w-6 h-6 text-primary-500" />
          </Motion.div>
          <p className="font-arabic text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            شاهدي أجمل اللحظات مع روڤالينا
          </p>
          <a
            href="https://instagram.com/rovalina_lenses"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mint-dark dark:text-mint font-bold font-arabic mt-4 inline-block hover:text-accent-800 dark:hover:text-accent-300 transition"
          >
            @rovalina_lenses
          </a>
        </Motion.div>

        {/* Gallery grid */}
        <Motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {galleryItems.map((item) => {
            const embedUrl = getInstagramEmbedUrl(item.image);

            return (
              <Motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="relative overflow-hidden rounded-3xl aspect-square group cursor-pointer shadow-sm border border-white/40"
              >
                {embedUrl ? (
                  <div className="absolute inset-0 overflow-hidden bg-white">
                    <iframe
                      src={embedUrl}
                      title={item.username || 'Instagram Post'}
                      className="w-[112%] h-[138%] -translate-x-[6%] -translate-y-[15%] border-0"
                      loading="lazy"
                      scrolling="no"
                    />
                  </div>
                ) : (
                  <>
                    <img
                      src={item.image}
                      alt={item.username}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="w-full p-4">
                        <p className="text-white font-arabic font-bold text-sm">
                          {item.username}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {!embedUrl && (
                  <Motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Share2 className="w-8 h-8 text-white drop-shadow-lg" />
                  </Motion.div>
                )}
              </Motion.div>
            );
          })}
        </Motion.div>

        {/* CTA Button */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mt-12"
        >
          <a
            href="https://instagram.com/rovalina_lenses"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-arabic">زوري إنستجرام</span>
          </a>
        </Motion.div>
      </div>
    </section>
  );
}


