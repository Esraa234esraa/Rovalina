import dotenv from 'dotenv';
dotenv.config();
export const env = {
    port: Number(process.env.PORT || 5000),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    paymobApiKey: process.env.PAYMOB_API_KEY || '',
    paymobIntegrationId: process.env.PAYMOB_INTEGRATION_ID || '',
    paymobIframeId: process.env.PAYMOB_IFRAME_ID || '',
    paymobHmacSecret: process.env.PAYMOB_HMAC_SECRET || '',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioWhatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
    adminWhatsappNumber: process.env.ADMIN_WHATSAPP_NUMBER || '',
};
