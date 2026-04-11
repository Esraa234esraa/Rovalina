import React from 'react';
import { m } from 'framer-motion';
import { Star, Quote, ChevronRight, ChevronLeft } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import {
  useCreateSiteReviewMutation,
  useEngagementTestimonialsQuery,
} from '../../hooks/useEngagementTestimonials';

const getInitials = (value) => {
  const text = String(value || 'عميل').trim();
  const parts = text.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]).join('');
  return initials || 'عم';
};

const MotionDiv = m.div;

export default function TestimonialsSection() {
  const toast = useToast();
  const { data: testimonials = [], isFetching } = useEngagementTestimonialsQuery();
  const createReviewMutation = useCreateSiteReviewMutation();
  const [form, setForm] = React.useState({ name: '', rating: 5, comment: '' });
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [cardsPerSlide, setCardsPerSlide] = React.useState(3);

  const averageRating = React.useMemo(() => {
    if (!testimonials.length) return 0;
    const sum = testimonials.reduce((acc, item) => acc + Number(item.rating || 0), 0);
    return Number((sum / testimonials.length).toFixed(1));
  }, [testimonials]);

  const testimonialsCountLabel = React.useMemo(() => {
    const count = testimonials.length;
    if (count >= 1000) {
      return `${Math.round(count / 100) / 10}K+`;
    }
    return String(count || 0);
  }, [testimonials]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.comment.trim()) return;

    createReviewMutation.mutate(
      {
        name: form.name,
        quote: form.comment,
        rating: form.rating,
      },
      {
        onSuccess: () => {
          toast.success('تم إرسال تقييمك بنجاح، وسيظهر بعد المراجعة.');
          setForm({ name: '', rating: 5, comment: '' });
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'تعذر إرسال التقييم حالياً.');
        },
      }
    );
  };

  const readable = (ar, en, fallback = '') => {
    if (typeof ar === 'string' && !/[A-Za-z][\^?.",]/.test(ar)) return ar;
    return en || fallback;
  };

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

  React.useEffect(() => {
    const detectCardsPerSlide = () => {
      const width = window.innerWidth;
      if (width < 640) return 1;
      if (width < 1024) return 2;
      return 3;
    };

    const applyCardsPerSlide = () => {
      setCardsPerSlide(detectCardsPerSlide());
    };

    applyCardsPerSlide();
    window.addEventListener('resize', applyCardsPerSlide);

    return () => {
      window.removeEventListener('resize', applyCardsPerSlide);
    };
  }, []);

  const testimonialSlides = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < testimonials.length; i += cardsPerSlide) {
      result.push(testimonials.slice(i, i + cardsPerSlide));
    }
    return result;
  }, [testimonials, cardsPerSlide]);

  const hasMultipleSlides = testimonialSlides.length > 1;

  React.useEffect(() => {
    if (!hasMultipleSlides) return undefined;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonialSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [hasMultipleSlides, testimonialSlides.length]);

  const safeSlideIndex = testimonialSlides.length > 0 ? activeSlide % testimonialSlides.length : 0;

  const nextSlide = () => {
    if (!hasMultipleSlides) return;
    setActiveSlide((prev) => (prev + 1) % testimonialSlides.length);
  };

  const prevSlide = () => {
    if (!hasMultipleSlides) return;
    setActiveSlide((prev) => (prev - 1 + testimonialSlides.length) % testimonialSlides.length);
  };

  return (
    <section className="section bg-white dark:bg-dark-card overflow-x-clip overflow-y-hidden hide-scrollbar">
      <div className="container-fluid max-w-full overflow-hidden">
        {/* Section header */}
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-arabic text-4xl md:text-5xl font-bold text-[#6B4A45] dark:text-[#6B4A45] mb-4">
            آراء عملائنا
          </h2>
          <p className="font-arabic text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            ماذا يقول عملاؤنا الرائعون عن روڤالينا
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-400 to-mint dark:to-mint-dark mx-auto mt-6 rounded-full"></div>
        </MotionDiv>

        <div className="max-w-3xl mx-auto mb-10 card p-6 dark:bg-dark-surface">
          <h3 className="font-arabic text-xl font-bold text-gray-900 dark:text-white mb-4">اكتبي تقييمك عن الموقع</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="الاسم (اختياري)"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="input md:col-span-1"
            />
            <select
              value={form.rating}
              onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
              className="input md:col-span-1"
            >
              <option value={5}>5 نجوم</option>
              <option value={4}>4 نجوم</option>
              <option value={3}>3 نجوم</option>
              <option value={2}>2 نجوم</option>
              <option value={1}>1 نجمة</option>
            </select>
            <input
              type="text"
              required
              placeholder="اكتبي رأيك في تجربة الموقع"
              value={form.comment}
              onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
              className="input md:col-span-2"
            />
            <button type="submit" className="btn btn-primary md:col-span-4">إرسال التقييم</button>
          </form>
        </div>

        {/* Testimonials grid */}
        {isFetching && testimonials.length > 0 && (
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">جاري تحديث أحدث التقييمات...</p>
          </div>
        )}
        <div className="relative">
          <MotionDiv
            variants={containerVariants}
            initial={false}
            animate="visible"
            className={`grid gap-6 ${
              cardsPerSlide === 1
                ? 'grid-cols-1'
                : cardsPerSlide === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {(testimonialSlides[safeSlideIndex] || []).map((testimonial) => (
              <MotionDiv key={testimonial.id} variants={itemVariants}>
                <MotionDiv
                  whileHover={{ y: -8 }}
                  className="card group overflow-hidden h-full dark:bg-dark-surface"
                >
                  {/* Top accent bar */}
                  <div className="h-1 bg-gradient-to-r from-primary-400 to-rose-400"></div>

                  {/* Content */}
                  <div className="p-6 flex flex-col h-full">
                    {/* Quote icon */}
                    <MotionDiv
                      className="text-primary-500/20 mb-2"
                      whileHover={{ scale: 1.2 }}
                    >
                      <Quote className="w-8 h-8" />
                    </MotionDiv>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(testimonial.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="font-arabic text-gray-700 dark:text-gray-300 mb-6 leading-relaxed flex-grow break-words">
                      "{readable(testimonial.quote, testimonial.quoteEn, 'تجربة ممتازة وخدمة رائعة.')}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="w-12 h-12 rounded-full flex-shrink-0 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary-500 via-primary-600 to-slate-900 text-white flex items-center justify-center shadow-sm">
                        <span className="text-sm font-bold tracking-wide">
                          {getInitials(readable(testimonial.name, testimonial.nameEn, 'عميل'))}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-arabic font-bold text-gray-900 dark:text-white text-sm">
                          {readable(testimonial.name, testimonial.nameEn, 'عميل')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                          {testimonial.nameEn}
                        </p>
                      </div>
                    </div>
                  </div>
                </MotionDiv>
              </MotionDiv>
            ))}
          </MotionDiv>

          {hasMultipleSlides ? (
            <>
              <button
                type="button"
                onClick={prevSlide}
                className="absolute top-1/2 -translate-y-1/2 right-2 md:right-3 p-2 rounded-full bg-white/90 dark:bg-dark-surface/90 border border-surface-300 dark:border-gray-700 shadow text-ink-700 dark:text-secondary-100"
                aria-label="السابق"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute top-1/2 -translate-y-1/2 left-2 md:left-3 p-2 rounded-full bg-white/90 dark:bg-dark-surface/90 border border-surface-300 dark:border-gray-700 shadow text-ink-700 dark:text-secondary-100"
                aria-label="التالي"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          ) : null}
        </div>

        {hasMultipleSlides ? (
          <div className="flex justify-center gap-2 mt-5">
            {testimonialSlides.map((_, index) => (
              <button
                key={`testimonial-dot-${index}`}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === safeSlideIndex ? 'w-8 bg-primary-600' : 'w-2.5 bg-primary-300/70'
                }`}
                aria-label={`تقييم ${index + 1}`}
              />
            ))}
          </div>
        ) : null}

        {!isFetching && testimonials.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-surface p-6 text-center">
            <p className="font-arabic text-gray-700 dark:text-gray-300">لا توجد تقييمات ظاهرة حالياً.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">أضيفي تقييمك وسيظهر بعد المراجعة.</p>
          </div>
        ) : null}

        {/* Trust indicators */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="text-center">
            <MotionDiv
              className="bg-gradient-to-br from-primary-100 to-rose-100 dark:from-primary-900/20 dark:to-rose-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {averageRating || '0.0'}
              </span>
            </MotionDiv>
            <p className="font-arabic font-bold text-gray-900 dark:text-white">
              تقييم العملاء
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">متوسط التقييم</p>
          </div>

          <div className="text-center">
            <MotionDiv
              className="bg-gradient-to-br from-primary-100 to-rose-100 dark:from-primary-900/20 dark:to-rose-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {testimonialsCountLabel}
              </span>
            </MotionDiv>
            <p className="font-arabic font-bold text-gray-900 dark:text-white">
              عميلة سعيدة
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">موثوقة وآمنة</p>
          </div>

          <div className="text-center">
            <MotionDiv
              className="bg-gradient-to-br from-primary-100 to-rose-100 dark:from-primary-900/20 dark:to-rose-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                100%
              </span>
            </MotionDiv>
            <p className="font-arabic font-bold text-gray-900 dark:text-white">
              ضمان الجودة
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">أصلية 100%</p>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}


