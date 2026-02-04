// apps/bot/src/index.ts
import { Telegraf } from 'telegraf';

const BOT_TOKEN = '8381308909:AAHp5IEM57wL53CSWGPAK0U9l5fhLfKkEh8';
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('🎮 TON FIGHT', {
    reply_markup: {
      inline_keyboard: [[
        { 
          text: 'Играть', 
          web_app: { url: 'https://artem-00.github.io/ton-fight/' } 
        }
      ]]
    }
  });
});

// Обработка Stars платежей
bot.on('successful_payment', async (ctx) => {
  const userId = ctx.from.id.toString();
  const starsAmount = ctx.message.successful_payment.total_amount;
  
  // Конвертация Stars → TON (1 Star = 0.01 TON)
  const tonAmount = starsAmount * 0.01;
  
  // Начисление баланса через API
  await fetch('http://localhost:3000/api/stars/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount: tonAmount })
  });
  
  ctx.reply(`✅ Получено ${starsAmount} ⭐ (${tonAmount} TON)!`);
});

bot.launch();
console.log('🤖 Bot started');