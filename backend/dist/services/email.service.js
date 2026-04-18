import nodemailer from 'nodemailer';
const toPositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(String(value || ''), 10);
    if (!Number.isFinite(parsed) || parsed <= 0)
        return fallback;
    return parsed;
};
const SMTP_HOST = String(process.env.SMTP_HOST || '').trim();
const SMTP_PORT = toPositiveInt(process.env.SMTP_PORT, 587);
const SMTP_USER = String(process.env.SMTP_USER || '').trim();
const SMTP_PASS = String(process.env.SMTP_PASS || '').trim();
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const SMTP_FROM = String(process.env.SMTP_FROM || SMTP_USER || 'no-reply@rovalina.com').trim();
const CONTACT_RECEIVER_EMAIL = String(process.env.CONTACT_RECEIVER_EMAIL || process.env.SUPPORT_EMAIL || process.env.STORE_EMAIL || SMTP_USER).trim();
const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && CONTACT_RECEIVER_EMAIL);
let transporter = null;
const getTransporter = () => {
    if (!isConfigured)
        return null;
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_SECURE,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });
    }
    return transporter;
};
const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const buildContactMessageHtml = ({ name, email, phone, message }) => {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || '-');
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2 style="margin: 0 0 12px;">رسالة تواصل جديدة من الموقع</h2>
      <p><strong>الاسم:</strong> ${safeName}</p>
      <p><strong>الإيميل:</strong> ${safeEmail}</p>
      <p><strong>الهاتف:</strong> ${safePhone}</p>
      <p><strong>الرسالة:</strong><br/>${safeMessage}</p>
    </div>
  `;
};
const buildNewsletterHtml = (email) => {
    const safeEmail = escapeHtml(email);
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2 style="margin: 0 0 12px;">اشتراك جديد في النشرة البريدية</h2>
      <p><strong>الإيميل:</strong> ${safeEmail}</p>
    </div>
  `;
};
const sendMail = async ({ subject, html, replyTo = '' }) => {
    const currentTransporter = getTransporter();
    if (!currentTransporter) {
        console.warn('[email] SMTP is not configured. Skipping email send.');
        return;
    }
    await currentTransporter.sendMail({
        from: SMTP_FROM,
        to: CONTACT_RECEIVER_EMAIL,
        subject,
        html,
        ...(replyTo ? { replyTo } : {}),
    });
};
export const emailService = {
    async sendContactMessageNotification({ name, email, phone, message }) {
        await sendMail({
            subject: `رسالة تواصل جديدة - ${name || 'عميل'}`,
            html: buildContactMessageHtml({ name, email, phone, message }),
            replyTo: String(email || '').trim(),
        });
    },
    async sendNewsletterNotification({ email }) {
        await sendMail({
            subject: 'اشتراك جديد في النشرة البريدية',
            html: buildNewsletterHtml(email),
            replyTo: String(email || '').trim(),
        });
    },
};
