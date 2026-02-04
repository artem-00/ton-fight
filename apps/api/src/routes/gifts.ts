// apps/api/src/routes/gifts.ts
import { Hono } from 'hono';
import { db } from '../services/db';

const giftsRouter = new Hono();

// Получение инвентаря
giftsRouter.get('/inventory/:userId', async (c) => {
  const userId = c.req.param('userId');
  const inventory = await db.query(
    `SELECT g.*, i.id as inventory_id 
     FROM inventory i 
     JOIN gifts g ON i.gift_id = g.id 
     WHERE i.user_id = $1`,
    [userId]
  );
  return c.json(inventory.rows);
});

// Использование подарка как ставки
giftsRouter.post('/use', async (c) => {
  const { userId, giftId } = await c.req.json();
  
  // Проверка наличия подарка
  const gift = await db.query(
    `SELECT g.value_ton FROM inventory i 
     JOIN gifts g ON i.gift_id = g.id 
     WHERE i.user_id = $1 AND i.id = $2`,
    [userId, giftId]
  );
  
  if (!gift.rows.length) {
    return c.json({ error: 'Gift not found' }, 404);
  }
  
  // Удаление из инвентаря
  await db.query(
    `DELETE FROM inventory WHERE user_id = $1 AND id = $2`,
    [userId, giftId]
  );
  
  // Добавление в очередь задач (рулетка с подарком)
  await db.query(
    `INSERT INTO task_queue (user_id, task_type, payload) 
     VALUES ($1, 'roulette_with_gift', $2)`,
    [userId, JSON.stringify({ giftValue: gift.rows[0].value_ton })]
  );
  
  return c.json({ success: true });
});

export { giftsRouter };