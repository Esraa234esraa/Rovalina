import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
const PAYMOB_BASE_URL = 'https://accept.paymob.com/api';
const toCents = (value) => Math.round(Number(value || 0) * 100);
const getRequiredPaymobConfig = () => {
    const apiKey = String(env.paymobApiKey || '').trim();
    const integrationId = String(env.paymobIntegrationId || '').trim();
    const iframeId = String(env.paymobIframeId || '').trim();
    if (!apiKey || !integrationId || !iframeId) {
        throw new ApiError(500, 'PAYMOB_API_KEY و PAYMOB_INTEGRATION_ID و PAYMOB_IFRAME_ID مطلوبة لإعداد الدفع الإلكتروني.');
    }
    return {
        apiKey,
        integrationId,
        iframeId,
        hmacSecret: String(env.paymobHmacSecret || '').trim(),
    };
};
const ensureJsonResponse = async (response) => {
    const rawText = await response.text();
    let parsed = null;
    if (rawText) {
        try {
            parsed = JSON.parse(rawText);
        }
        catch {
            parsed = null;
        }
    }
    if (!response.ok) {
        const message = parsed?.detail || parsed?.message || parsed?.error || rawText || 'فشل الاتصال بخدمات Paymob.';
        throw new ApiError(response.status, message);
    }
    return parsed ?? {};
};
const paymobRequest = async (path, payload) => {
    const response = await fetch(`${PAYMOB_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return ensureJsonResponse(response);
};
const splitCustomerName = (value) => {
    const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
        return {
            firstName: 'Customer',
            lastName: 'User',
        };
    }
    if (parts.length === 1) {
        return {
            firstName: parts[0],
            lastName: parts[0],
        };
    }
    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
    };
};
const normalizePhoneNumber = (value) => {
    const digits = String(value || '').replace(/\D+/g, '');
    return digits || '0000000000';
};
const buildBillingData = (order) => {
    const customerName = String(order?.customerName || order?.user?.name || '').trim();
    const customerEmail = String(order?.customerEmail || order?.user?.email || '').trim() || 'customer@example.com';
    const customerPhone = normalizePhoneNumber(order?.customerPhone || order?.user?.phone || '');
    const { firstName, lastName } = splitCustomerName(customerName || 'Customer User');
    return {
        apartment: 'NA',
        email: customerEmail,
        floor: 'NA',
        first_name: firstName,
        street: String(order?.addressLine || order?.city || 'NA').trim() || 'NA',
        building: 'NA',
        phone_number: customerPhone,
        shipping_method: 'PKG',
        postal_code: String(order?.postalCode || 'NA').trim() || 'NA',
        city: String(order?.city || 'Cairo').trim() || 'Cairo',
        country: 'EG',
        last_name: lastName,
        state: String(order?.governorate || order?.city || 'Cairo').trim() || 'Cairo',
    };
};
const resolvePaymobOrderId = (paymobOrderResponse, existingPaymobOrderId) => {
    const id = paymobOrderResponse?.id ?? existingPaymobOrderId;
    return String(id || '').trim();
};
export const paymobService = {
    toCents,
    async getAuthToken() {
        const { apiKey } = getRequiredPaymobConfig();
        const data = await paymobRequest('/auth/tokens', { api_key: apiKey });
        const token = String(data?.token || '').trim();
        if (!token) {
            throw new ApiError(502, 'تعذر الحصول على رمز مصادقة Paymob.');
        }
        return token;
    },
    async createOrder({ authToken, order, amountCents }) {
        const payload = {
            auth_token: authToken,
            delivery_needed: false,
            amount_cents: amountCents,
            currency: order.currency || 'EGP',
            merchant_order_id: order.id,
            items: [],
        };
        const data = await paymobRequest('/ecommerce/orders', payload);
        const paymobOrderId = resolvePaymobOrderId(data, order.paymobOrderId);
        if (!paymobOrderId) {
            throw new ApiError(502, 'تعذر إنشاء طلب Paymob.');
        }
        return {
            ...data,
            id: paymobOrderId,
        };
    },
    async createPaymentKey({ authToken, order, paymobOrderId, amountCents }) {
        const { integrationId } = getRequiredPaymobConfig();
        const payload = {
            auth_token: authToken,
            amount_cents: amountCents,
            expiration: 3600,
            order_id: paymobOrderId,
            billing_data: buildBillingData(order),
            currency: order.currency || 'EGP',
            integration_id: Number(integrationId),
            lock_order_when_paid: true,
        };
        const data = await paymobRequest('/acceptance/payment_keys', payload);
        const paymentToken = String(data?.token || '').trim();
        if (!paymentToken) {
            throw new ApiError(502, 'تعذر إنشاء مفتاح الدفع من Paymob.');
        }
        return paymentToken;
    },
    async createPaymentSession(order) {
        const { iframeId } = getRequiredPaymobConfig();
        const amountCents = toCents(order.total);
        if (amountCents <= 0) {
            throw new ApiError(400, 'إجمالي الطلب غير صالح لإنشاء عملية دفع.');
        }
        const authToken = await this.getAuthToken();
        let paymobOrderId = String(order.paymobOrderId || '').trim();
        if (!paymobOrderId) {
            const paymobOrder = await this.createOrder({ authToken, order, amountCents });
            paymobOrderId = String(paymobOrder.id || '').trim();
        }
        const paymentToken = await this.createPaymentKey({
            authToken,
            order,
            paymobOrderId,
            amountCents,
        });
        return {
            paymentToken,
            paymobOrderId,
            iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`,
            amountCents,
        };
    },
    extractWebhookContext(payload) {
        const root = payload?.obj || payload?.data || payload || {};
        const orderInfo = root?.order || payload?.order || {};
        const success = Boolean(root?.success ??
            payload?.success ??
            orderInfo?.success ??
            false);
        const paymobOrderId = String(orderInfo?.id ??
            root?.order_id ??
            payload?.order_id ??
            payload?.orderId ??
            '').trim();
        const merchantOrderId = String(orderInfo?.merchant_order_id ??
            root?.merchant_order_id ??
            payload?.merchant_order_id ??
            payload?.merchantOrderId ??
            '').trim();
        const transactionId = String(root?.id ??
            root?.transaction_id ??
            payload?.transaction_id ??
            payload?.transactionId ??
            '').trim();
        return {
            success,
            paymobOrderId: paymobOrderId || null,
            merchantOrderId: merchantOrderId || null,
            transactionId: transactionId || null,
            paymentResponse: payload,
            raw: root,
        };
    },
};
