import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';
import { sendWhatsAppMessage } from './services/whatsapp.service.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://rovalina.store',
  'https://www.rovalina.store',
  'https://mistyrose-dunlin-772686.hostingersite.com',
  'https://rovalina-production.up.railway.app',
];

const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin/server-side requests with no Origin header.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

app.get('/test-whatsapp', async (_req, res) => {
  const result = await sendWhatsAppMessage('Test message from server');
  return res.status(result.success ? 200 : 500).json({
    success: result.success,
    message: result.message,
    sid: result?.data?.sid || null,
  });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
