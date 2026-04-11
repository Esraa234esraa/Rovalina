import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import LoadingState from '../components/ui/LoadingState';
import { useCatalogFAQs } from '../hooks/useCatalogFAQs';

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState(null);
  const { data: faqs = [], isLoading, isError, error } = useCatalogFAQs();

  const groupedFAQs = useMemo(() => {
    const map = new Map();
    for (const faq of Array.isArray(faqs) ? faqs : []) {
      const category = faq.category || 'أسئلة عامة';
      if (!map.has(category)) map.set(category, []);
      map.get(category).push({
        id: faq.id,
        q: faq.question,
        a: faq.answer,
        order: Number(faq.order || 0),
      });
    }

    return Array.from(map.entries()).map(([category, questions]) => ({
      category,
      questions: questions.sort((a, b) => a.order - b.order),
    }));
  }, [faqs]);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  let globalIndex = 0;

  return (
    <div className="container-fluid">
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-arabic text-4xl md:text-5xl font-bold text-center mb-12">الأسئلة الشائعة</h1>

          {isLoading ? <LoadingState text="جاري تحميل الأسئلة الشائعة..." /> : null}

          {isError ? (
            <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
              حدث خطأ أثناء تحميل الأسئلة الشائعة.
              <p className="mt-2 text-sm opacity-80">{error?.message || 'يرجى المحاولة مرة أخرى.'}</p>
            </div>
          ) : null}

          {!isLoading && !isError && groupedFAQs.length === 0 ? (
            <div className="rounded-xl border border-surface-300 dark:border-primary-900/40 p-8 text-center text-ink-600 dark:text-secondary-300">
              لا توجد أسئلة شائعة متاحة حاليًا.
            </div>
          ) : null}

          {!isLoading && !isError
            ? groupedFAQs.map((category, categoryIndex) => (
                <div key={`${category.category}-${categoryIndex}`} className="mb-12">
                  <h2 className="font-arabic text-2xl font-bold mb-6">{category.category}</h2>
                  <div className="space-y-4">
                    {category.questions.map((question) => {
                      const itemIndex = globalIndex++;
                      return (
                        <div key={question.id || itemIndex} className="bg-white dark:bg-dark-bg rounded-lg border">
                          <button
                            onClick={() => toggleAccordion(itemIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between"
                          >
                            <h3 className="font-arabic text-lg font-semibold text-right">{question.q}</h3>
                            <ChevronDown className={`w-5 h-5 transition-transform ${activeIndex === itemIndex ? 'rotate-180' : ''}`} />
                          </button>
                          {activeIndex === itemIndex ? (
                            <div className="px-6 py-4 bg-gray-50 dark:bg-dark-secondary border-t">
                              <p className="font-arabic text-gray-700 dark:text-gray-300">{question.a}</p>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            : null}
        </div>
      </section>
    </div>
  );
}
