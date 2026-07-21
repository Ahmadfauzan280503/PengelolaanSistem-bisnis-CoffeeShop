const { Client } = require('pg');
require('dotenv').config();

async function fixRLS() {
  const client = new Client({ connectionString: process.env.POSTGRES_URL });
  await client.connect();
  try {
    await client.query('CREATE POLICY "Enable delete for all users" ON public.cashier_orders FOR DELETE USING (true);');
    console.log('Policy added successfully.');
  } catch (e) {
    if (e.message.includes('already exists')) {
        console.log('Policy already exists, or other error:', e.message);
    } else {
        console.error('Error:', e.message);
    }
  }
  await client.end();
}

fixRLS();
