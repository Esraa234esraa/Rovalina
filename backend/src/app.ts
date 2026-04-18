import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mistyrose-dunlin-772686.hostingersite.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
