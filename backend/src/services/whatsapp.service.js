import twilio from 'twilio';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const formatCurrency = (value, currency = 'EGP') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const buildOrderItemsText = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return '-';
  }

  return items
    .map((item, index) => {
      const name = String(item?.productName || item?.product?.name || 'Product').trim();
      const quantity = Number(item?.quantity || 0);
      return `${index + 1}. ${name} x${quantity}`;
    })
    .join('\n');
};

const buildOrderAddress = (order) => {
  const parts = [order?.addressLine, order?.city, order?.governorate, order?.postalCode]
    .map((part) => String(part || '').trim())
    .filter(Boolean);

  return parts.length ? parts.join(', ') : '-';
};

const getTwilioClient = () => {
  const accountSid = String(env.twilioAccountSid || '').trim();
  const authToken = String(env.twilioAuthToken || '').trim();

  if (!accountSid || !authToken) {
    throw new ApiError(500, 'إعدادات Twilio غير مكتملة.');
  }

  return twilio(accountSid, authToken);
};

const getWhatsappAddress = (value) => {
  const phone = String(value || '').trim();
  if (!phone) return '';
  return phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
};

export const sendOrderNotification = async (order) => {
  const fromNumber = getWhatsappAddress(env.twilioWhatsappNumber);
  const toNumber = getWhatsappAddress(env.adminWhatsappNumber);

  if (!fromNumber || !toNumber) {
    throw new ApiError(500, 'أرقام WhatsApp الخاصة بـ Twilio غير مكتملة.');
  }

  const client = getTwilioClient();
  const orderNumber = String(order?.orderNumber || order?.id || '').trim() || '-';
  const customerName = String(order?.customerName || order?.user?.name || '').trim() || '-';
  const customerPhone = String(order?.customerPhone || order?.user?.phone || '').trim() || '-';
  const paymentMethod = String(order?.paymentMethod || '-').trim() || '-';
  const itemsText = buildOrderItemsText(order?.items || []);
  const addressText = buildOrderAddress(order);
  const totalText = formatCurrency(order?.total, order?.currency || 'EGP');

  const message = [
    'New Order Received',
    `Order ID: ${orderNumber}`,
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Address: ${addressText}`,
    `Total: ${totalText}`,
    `Payment Method: ${paymentMethod}`,
    'Products:',
    itemsText,
  ].join('\n');

  const result = await client.messages.create({
    from: fromNumber,
    to: toNumber,
    body: message,
  });

  return result;
};
