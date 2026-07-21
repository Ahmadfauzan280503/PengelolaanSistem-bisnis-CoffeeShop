const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/POSTGRES_URL="([^"]+)"/);
if (match) {
  const { Client } = require('pg');
  const client = new Client({ 
    connectionString: match[1],
    ssl: { rejectUnauthorized: false }
  });
  client.connect().then(() => {
    return client.query(
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0; " +
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_discount boolean DEFAULT false; " +
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0; " +
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS status text DEFAULT 'Tersedia';"
    );
  }).then(() => {
    return client.query("ALTER TABLE products RENAME COLUMN is_best_seller TO is_bestseller;").catch(e => console.log('Rename failed or already done'));
  }).then(() => {
    console.log('Columns added successfully');
    process.exit(0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
