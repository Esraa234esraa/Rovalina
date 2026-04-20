import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import { BRAND } from '../../lib/constants';
import api from '../../services/http';
import logo from '../../assets/logo.svg';

const DEFAULT_SETTINGS = {
  storeEmail: 'info@rovalina.com',
  storePhone: '+20 100 123 4567',
  storeAddress: 'القاهرة، مصر',
  city: 'القاهرة',
  governorate: 'القاهرة',
  facebook: '',
  instagram: '',
  tiktok: '',
  whatsapp: '+20 100 123 4567',
};

const normalizeWhatsAppLink = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}`;
};

const normalizePhoneLink = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return `tel:${raw.replace(/\s+/g, '')}`;
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        const data = response?.data?.data;
        if (!isMounted || !data) return;

        setSettings((prev) => ({
          ...prev,
          ...data,
        }));
      } catch {
        // Keep fallback footer data if settings endpoint is unavailable.
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const contactInfo = useMemo(() => {
    const phoneText = String(settings?.storePhone || DEFAULT_SETTINGS.storePhone).trim();
    const emailText = String(settings?.storeEmail || DEFAULT_SETTINGS.storeEmail).trim();
    const rawAddress = String(settings?.storeAddress || '').trim();
    const composedAddress = [settings?.city, settings?.governorate]
      .map((part) => String(part || '').trim())
      .filter(Boolean)
      .join('، ');
    const addressText = rawAddress || composedAddress || DEFAULT_SETTINGS.storeAddress;
    const facebookUrl = String(settings?.facebook || '').trim();
    const instagramUrl = String(settings?.instagram || '').trim();
    const tiktokUrl = String(settings?.tiktok || '').trim();
    const whatsappText = String(settings?.whatsapp || phoneText || DEFAULT_SETTINGS.whatsapp).trim();

    return {
      phoneText,
      emailText,
      addressText,
      phoneHref: normalizePhoneLink(phoneText),
      emailHref: emailText ? `mailto:${emailText}` : '',
      facebookUrl,
      instagramUrl,
      tiktokUrl,
      whatsappText,
      whatsappUrl: normalizeWhatsAppLink(whatsappText),
    };
  }, [settings]);

  return (
    <footer className="bg-surface-100 dark:bg-dark-card border-t border-surface-300 dark:border-primary-900/40 mt-20">
      <div className="container-fluid py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-ink-900 font-bold text-lg">
                R
              </div>
              <h3 className="font-arabic font-bold text-primary-600 dark:text-primary-400">
                {BRAND.name}
              </h3>
            </div>
            <p className="font-arabic text-sm text-ink-600 dark:text-secondary-200 mb-4">
              {BRAND.tagline}
            </p>
            <div className="flex gap-4">
              <a
                href={contactInfo.facebookUrl || '#'}
                className="p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg transition"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebookF className="w-5 h-5 text-primary-500" />
              </a>
              <a
                href={contactInfo.instagramUrl || '#'}
                className="p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg transition"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="w-5 h-5 text-pink-600" />
              </a>
              <a
                href={contactInfo.whatsappUrl || '#'}
                className="p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg transition"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
              </a>
              <a
                href={contactInfo.tiktokUrl || '#'}
                className="p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg transition"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTiktok className="w-5 h-5 text-ink-700 dark:text-secondary-200" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-arabic font-bold mb-4 text-ink-800 dark:text-secondary-100">
              روابط سريعة
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="font-arabic text-sm text-ink-600 dark:text-secondary-200 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="font-arabic text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  تسوقي الآن
                </Link>
              </li>
              <li>
                <Link
                  to="/offers"
                  className="font-arabic text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  العروض الخاصة
                </Link>
              </li>
              <li>
                <Link
                  to="/brands"
                  className="font-arabic text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  العلامات التجارية
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="font-arabic text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-arabic font-bold mb-4 text-ink-800 dark:text-secondary-100">
              خدمة العملاء
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="font-arabic text-sm text-ink-600 dark:text-secondary-200 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  تواصلي معنا
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="font-arabic text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  عن روڤالينا
                </Link>
              </li>
             
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-arabic font-bold mb-4 text-ink-800 dark:text-secondary-100">
              تواصلي معنا
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <a href={contactInfo.phoneHref || '#'} className="font-arabic text-sm text-ink-600 dark:text-secondary-200 hover:text-primary-700">
                  {contactInfo.phoneText}
                </a>
              </li>
              <li className="flex gap-3">
                <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <a href={contactInfo.whatsappUrl || '#'} target="_blank" rel="noopener noreferrer" className="font-arabic text-sm text-ink-600 dark:text-secondary-200 hover:text-primary-700">
                  {contactInfo.whatsappText || 'WhatsApp'}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <a href={contactInfo.emailHref || '#'} className="font-arabic text-sm text-ink-600 dark:text-secondary-200 hover:text-primary-700">
                  {contactInfo.emailText}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span className="font-arabic text-sm text-ink-600 dark:text-secondary-200">
                  {contactInfo.addressText}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="divider mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-ink-600 dark:text-secondary-200 font-arabic">
          <p>© {currentYear} {BRAND.name}. جميع الحقوق محفوظة.</p>
          
        </div>

        <div className="mt-10 pt-8 border-t border-surface-300 dark:border-primary-900/40 flex flex-col items-center">
          <img
            src={logo}
            alt={BRAND.name}
            className="w-44 sm:w-56 md:w-64 h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
            loading="lazy"
          />
          <p className="mt-3 font-arabic text-base sm:text-lg text-primary-700 dark:text-primary-300 font-semibold">
            {BRAND.name}
          </p>
        </div>
      </div>
    </footer>
  );
}


