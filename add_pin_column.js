const { Client } = require('pg');

const connectionString = "postgres://postgres.cjnlbefawsnyqscqvkib:Jfo90mKWeXkYbASW@aws-1-us-east-1.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addPinColumn() {
  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    await client.query("ALTER TABLE cashier_accounts ADD COLUMN IF NOT EXISTS pin TEXT;");
    console.log("Column 'pin' added to cashier_accounts.");

  } catch (error) {
    console.error("Error adding column:", error);
  } finally {
    await client.end();
    console.log("Connection closed.");
  }
}

addPinColumn();
