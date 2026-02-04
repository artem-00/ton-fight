// apps/worker/src/index.ts
import { Pool } from 'pg';

const db = new Pool({ connectionString: process.env.DATABASE_URL });

class TaskProcessor {
  async start() {
    console.log('🔄 FIFO Task Processor started');
    setInterval(() => this.processNextTask(), 100);
  }

  async processNextTask() {
    // Получаем самую старую незавершённую задачу
    const taskResult = await db.query(
      `SELECT * FROM task_queue 
       WHERE status = 'pending' 
       ORDER BY created_at ASC 
       LIMIT 1 FOR UPDATE SKIP LOCKED`
    );

    if (!taskResult.rows.length) return;

    const task = taskResult.rows[0];
    
    // Помечаем как обрабатываемую
    await db.query(
      `UPDATE task_queue SET status = 'processing' WHERE id = $1`,
      [task.id]
    );

    try {
      await this.executeTask(task);
      await db.query(
        `UPDATE task_queue SET status = 'completed' WHERE id = $1`,
        [task.id]
      );
    } catch (error) {
      console.error('Task failed:', error);
      await db.query(
        `UPDATE task_queue SET status = 'failed' WHERE id = $1`,
        [task.id]
      );
    }
  }

  async executeTask(task: any) {
    switch (task.task_type) {
      case 'roulette_spin':
        return this.spinRoulette(task.user_id, task.payload.betAmount);
        
      case 'roulette_with_gift':
        return this.spinRoulette(task.user_id, task.payload.giftValue);
        
      case 'case_open':
        return this.openCase(task.user_id, task.payload.caseId);
    }
  }

  async spinRoulette(userId: string, betAmount: number) {
    // Простая логика рулетки (50% шанс выиграть)
    const win = Math.random() > 0.5;
    const multiplier = win ? 2 : 0;
    const resultAmount = betAmount * multiplier;
    
    if (win) {
      await db.query(
        `UPDATE users SET balance = balance + $1 WHERE id = $2`,
        [resultAmount, userId]
      );
    }
    
    console.log(`🎰 Roulette: user ${userId}, bet ${betAmount}, ${win ? 'WIN' : 'LOSE'}`);
  }

  async openCase(userId: string, caseId: string) {
    // Логика открытия кейса
    const gifts = ['common', 'rare', 'epic', 'legendary'];
    const weights = [70, 20, 8, 2]; // Вероятности
    
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedRarity = 'common';
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        selectedRarity = gifts[i];
        break;
      }
    }
    
    // Получение случайного подарка нужной редкости
    const giftResult = await db.query(
      `SELECT id FROM gifts WHERE rarity = $1 ORDER BY RANDOM() LIMIT 1`,
      [selectedRarity]
    );
    
    if (giftResult.rows.length) {
      await db.query(
        `INSERT INTO inventory (user_id, gift_id) VALUES ($1, $2)`,
        [userId, giftResult.rows[0].id]
      );
    }
    
    console.log(`🎁 Case opened: user ${userId} got ${selectedRarity} gift`);
  }
}

const processor = new TaskProcessor();
processor.start();