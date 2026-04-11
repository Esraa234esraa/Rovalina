import { useEffect, useState } from 'react';
import api from '../services/http';
import LoadingState from '../components/ui/LoadingState';

const fallbackAboutUs =
  'نحن متجر متخصص في العدسات الأصلية مع خدمة عملاء سريعة وتوصيل آمن. هدفنا تقديم تجربة تسوق سهلة ومنتجات موثوقة بأسعار مناسبة. لأي استفسار، تواصلي معنا من صفحة التواصل وسنساعدك فورًا.';

export default function AboutPage() {
  const [aboutText, setAboutText] = useState(fallbackAboutUs);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        const content = response?.data?.data?.aboutUs;
        if (alive && content) {
          setAboutText(content);
        }
      } catch (_error) {
        if (alive) {
          setAboutText(fallbackAboutUs);
        }
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
      <div className="container-fluid py-16">
        <div className="max-w-4xl mx-auto bg-surface-50 dark:bg-dark-card rounded-2xl border border-surface-300 dark:border-primary-900/40 p-8 md:p-12 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600 dark:text-primary-400 mb-4">
            About Us
          </p>
          <h1 className="font-arabic text-4xl font-bold text-ink-800 dark:text-secondary-100 mb-6">عن روڤالينا لينسز</h1>
          {isLoading ? (
            <div className="py-6">
              <LoadingState text="جاري تحميل صفحة من نحن..." />
            </div>
          ) : (
            <div className="space-y-4 text-lg leading-8 text-ink-700 dark:text-secondary-200">
              {String(aboutText || '')
                .split(/\n+/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}