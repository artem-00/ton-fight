import { Telegraf } from 'telegraf';

// ЗАМЕНИ НА СВОЙ ТОКЕН!
const BOT_TOKEN = '123456789:AAH...'; // ← твой токен из @BotFather
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('🎮 Добро пожаловать в TON FIGHT!', {
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

bot.launch();
console.log('🤖 Bot started');