// apps/api/src/index.ts
import { Hono } from 'hono';
import { starsRouter } from './routes/stars';
import { giftsRouter } from './routes/gifts';

const app = new Hono();

app.route('/stars', starsRouter);
app.route('/gifts', giftsRouter);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;