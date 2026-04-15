import { useState } from 'react';
import { useCreateContactMessageMutation } from '../hooks/useEngagement';
import { useToast } from '../hooks/useToast';

export default function ContactPage() {
  const toast = useToast();
  const createContactMutation = useCreateContactMessageMutation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    createContactMutation.mutate(form, {
      onSuccess: () => {
        setSent(true);
        setForm({ name: '', email: '', phone: '', message: '' });
        toast.success('تم إرسال رسالتك بنجاح.');
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'تعذر إرسال الرسالة حالياً.');
      },
    });
  };

  return (
    <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
      <div className="container-fluid py-16">
        <div className="max-w-3xl mx-auto bg-surface-50 dark:bg-dark-card rounded-2xl border border-surface-300 dark:border-primary-900/40 p-8">
          <h1 className="font-arabic text-4xl font-bold text-ink-800 dark:text-secondary-100 mb-6">تواصلي معنا</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="input"
              placeholder="الاسم"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <input
              type="email"
              className="input"
              placeholder="البريد الإلكتروني"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="رقم الهاتف (اختياري)"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
            <textarea
              className="input min-h-32"
              placeholder="رسالتك"
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              required
            />

            <button className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed" type="submit" disabled={createContactMutation.isPending}>
              {createContactMutation.isPending ? 'جاري الإرسال...' : 'إرسال'}
            </button>
          </form>

          {sent && <p className="mt-4 text-green-600">تم إرسال رسالتك بنجاح.</p>}
        </div>
      </div>
    </div>
  );
}
