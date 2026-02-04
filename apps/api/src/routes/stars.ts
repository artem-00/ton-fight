// apps/api/src/routes/stars.ts
import { Hono } from 'hono';
import { db } from '../services/db';

const starsRouter = new Hono();

// Создание инвойса
starsRouter.post('/create-invoice', async (c) => {
  const { amountStars, userId } = await c.req.json();
  
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Пополнение TON FIGHT',
      description: `Пополнение на ${amountStars} ⭐`,
      payload: `stars_${userId}`,
      provider_token: '', // Пусто для Stars!
      currency: 'XTR',
      prices: [{ label: 'Stars', amount: amountStars }]
    })
  });
  
  return c.json(await response.json());
});

// Начисление баланса после оплаты
starsRouter.post('/deposit', async (c) => {
  const { userId, amount } = await c.req.json();
  
  await db.query(
    `INSERT INTO transactions (user_id, amount, type, status) 
     VALUES ($1, $2, 'stars', 'completed')`,
    [userId, amount]
  );
  
  await db.query(
    `UPDATE users SET balance = balance + $1 WHERE id = $2`,
    [amount, userId]
  );
  
  return c.json({ success: true });
});

export { starsRouter };