import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
