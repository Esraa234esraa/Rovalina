import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';
import { sendWhatsAppMessage } from './services/whatsapp.service.js';

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mistyrose-dunlin-772686.hostingersite.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
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
