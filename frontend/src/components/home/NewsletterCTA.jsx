import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Heart } from 'lucide-react';
import { useSubscribeNewsletterMutation } from '../../hooks/useEngagement';
import { useToast } from '../../hooks/useToast';

export default function NewsletterCTA() {
  const toast = useToast();
  const subscribeMutation = useSubscribeNewsletterMutation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;

    subscribeMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setSubscribed(true);
          setEmail('');
          toast.success('تم الاشتراك في النشرة البريدية بنجاح.');
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'تعذر الاشتراك حالياً.');
        },
      }
    );
  };

  return (
    <section className="section bg-gradient-to-r from-primary-100 to-rose-100 dark:from-primary-900/30 dark:to-rose-900/30 relative overflow-hidden">
      {/* Decorative elements */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"
        animate={{ x: [0, 20, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"
        animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container-fluid relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            className="flex justify-center mb-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="bg-white dark:bg-dark-card rounded-full p-4 shadow-lg">
              <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </motion.div>

          {/* Heading */}
          <h2 className="font-arabic text-4xl md:text-5xl font-bold text-[#6B4A45] dark:text-[#6B4A45] mb-4">
            اشتركي في نشرتنا البريدية
          </h2>

          {/* Description */}
          <p className="font-arabic text-gray-600 dark:text-gray-300 text-lg mb-8">
            احصلي على عروض حصرية وأحدث المجموعات مباشرة في بريدك
          </p>

          {/* Newsletter form */}
          <motion.form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 mb-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <input
              type="email"
                placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input flex-1"
              required
            />
            <motion.button
              type="submit"
              disabled={subscribeMutation.isPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
                <span className="font-arabic">{subscribeMutation.isPending ? 'جاري الاشتراك...' : 'اشترك'}</span>
            </motion.button>
          </motion.form>

          {/* Success message */}
          {subscribed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg font-arabic flex items-center gap-2"
            >
              <Heart className="w-5 h-5 fill-current" />
              شكرا لاشتراكك! سنرسل لك أحدث العروض قريبا.
            </motion.div>
          )}

          {/* Privacy note */}
          <p className="text-xs text-gray-500 dark:text-gray-400 font-arabic">
            لن نرسل بريد مزعج، ويمكنك إلغاء الاشتراك في أي وقت.
          </p>
        </motion.div>
      </div>
    </section>
  );
}


