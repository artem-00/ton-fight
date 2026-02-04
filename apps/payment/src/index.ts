// apps/payment/src/index.ts
import { TonClient, Address } from '@ton/ton';
import { Pool } from 'pg';

const client = new TonClient({
  endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
  apiKey: process.env.TONCENTER_API_KEY
});

const MY_WALLET = Address.parse(process.env.MY_TON_WALLET_ADDRESS!);
const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function watchDeposits() {
  const lastLt = await getLastProcessedLt();
  
  const transactions = await client.getTransactions(MY_WALLET, {
    limit: 100,
    lt: lastLt ? BigInt(lastLt) : undefined
  });

  // Обработка от старых к новым (FIFO!)
  for (const tx of transactions.reverse()) {
    if (!tx.inMsg || tx.inMsg.info.type !== 'internal') continue;
    
    const comment = tx.inMsg.body?.beginParse().loadString(256) || '';
    const match = comment.match(/deposit_user_(\d+)/);
    
    if (match) {
      const userId = match[1];
      const amount = Number(tx.inMsg.info.value.coins) / 1e9;
      
      // Начисление баланса
      await db.query(
        `UPDATE users SET balance = balance + $1 WHERE id = $2`,
        [amount, userId]
      );
      
      await db.query(
        `INSERT INTO transactions (user_id, amount, type, status, external_id) 
         VALUES ($1, $2, 'ton_deposit', 'completed', $3)`,
        [userId, amount, tx.lt.toString()]
      );
      
      console.log(`✅ TON Deposit: ${amount} TON → user ${userId}`);
    }
  }
}

async function getLastProcessedLt(): Promise<string | null> {
  const result = await db.query(
    `SELECT MAX(external_id) as last_lt FROM transactions WHERE type = 'ton_deposit'`
  );
  return result.rows[0]?.last_lt || null;
}

// Запуск каждые 30 секунд
setInterval(watchDeposits, 30_000);
watchDeposits(); // Первый запуск сразу